require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const { cotarPorCidade } = require('./src/calculadora.js');

// Importações do Baileys e utilitários do WhatsApp
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

const app = express();
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Instância global do socket do WhatsApp
let sock;

async function conectarWhatsApp() {
    // Salva a sessão na pasta 'auth_info_baileys' para não precisar escanear o QR code toda vez
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }), // Silencia logs excessivos do Baileys
        printQRInTerminal: false // Vamos tratar a exibição manualmente com qrcode-terminal
    });

    // Evento para gerar o QR Code no terminal
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('📱 Escaneie o QR Code abaixo com o seu WhatsApp:');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
            if (shouldReconnect) {
                conectarWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('✅ WhatsApp conectado com sucesso!');
        }
    });

    // Salvando credenciais atualizadas
    sock.ev.on('creds.update', saveCreds);

    // Ouvindo mensagens recebidas
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        // Extrai o número do cliente (formato jid: 5511999999999@s.whatsapp.net)
        const numeroCliente = msg.key.remoteJid;
        
        // Ignora grupos
        if (numeroCliente.endsWith('@g.us')) return;

        const mensagemRecebida = 
            msg.message.conversation || 
            msg.message.extendedTextMessage?.text;

        if (!mensagemRecebida) return;

        console.log(`💬 Cliente ${numeroCliente} enviou: ${mensagemRecebida}`);

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { 
                        role: "system", 
                        content: `Você é a Ray, a assistente virtual de orçamentos da ELRAY Serviços e Corretora de Seguros, focada em PLANOS DE SAÚDE.

APRESENTAÇÃO INICIAL:
Sempre que o cliente iniciar a conversa (ex: "Oi", "Olá", "Bom dia", "Quero uma cotação") e ainda NÃO tiver passado os dados, você deve se apresentar de forma simpática EXATAMENTE com este texto:
"Olá! Meu nome é Ray, sou sua assistente de orçamentos aqui da ELRAY. 💙 

Para eu preparar as melhores opções de planos de saúde para você bem rápido, por favor, me envie as idades, a cidade e o estado **tudo na mesma mensagem**, ok? 

👇 *Exemplo de como mandar:*
Idade: 23 e 45, Cidade: Itaquaquecetuba, Estado: SP"

REGRA DE OURO (MÁXIMA PRIORIDADE):
Se o cliente fornecer na mesma mensagem (ou você já tiver no contexto) a IDADE, a CIDADE e o ESTADO, você está TERMINANTEMENTE PROIBIDO de continuar a conversa, fazer novas perguntas ou perguntar o tipo de seguro. Você DEVE IMEDIATAMENTE responder APENAS com o comando:
COTAR|SiglaDoEstado|Cidade|Idades

Exemplo:
Cliente: "Idade: 23, Cidade: Itaquaquecetuba, Estado: SP"
Sua Resposta: COTAR|SP|Itaquaquecetuba|23

CASO 1: O cliente quer APENAS a REDE DE ATENDIMENTO (Hospitais, Book, Clínicas, Onde atende).
Sua Resposta OBRIGATÓRIA (sem saudações): BOOK|SiglaDoEstado

CASO 2: O cliente quer COTAÇÃO e JÁ PASSOU Idade, Cidade e Estado.
Sua Resposta OBRIGATÓRIA (sem saudações): COTAR|SiglaDoEstado|Cidade|Idades

CASO 3: O cliente pediu cotação mas FALTAM DADOS.
Aja com simpatia e peça SOMENTE os dados que faltam (idade, cidade ou estado) para o plano de saúde. Não ofereça outros tipos de seguro.` 
                    },
                    { role: "user", content: mensagemRecebida }
                ],
            });

            const respostaIA = completion.choices[0].message.content;

            // --- CASO 1: APENAS O BOOK ---
            if (respostaIA.startsWith('BOOK|')) {
                const estado = respostaIA.split('|')[1].trim().toUpperCase();
                console.log(`📂 Acionando envio de Book: ${estado}`);
                
                await enviarTextoWhatsApp(numeroCliente, `Certamente! Estou localizando o guia de rede hospitalar de ${estado} para você...`);
                await buscarEEnviarPDF(numeroCliente, estado);
                await enviarTextoWhatsApp(numeroCliente, "Este é o material completo. Deseja que eu realize uma simulação de valores agora?");
            } 

            // --- CASO 2: COTAÇÃO COMPLETA ---
            else if (respostaIA.startsWith('COTAR|')) {
                const partes = respostaIA.split('|');
                const estadoCru = partes[1].trim();
                const cidade = partes[2].trim();
                const idadesStr = partes[3];
                const arrayIdades = idadesStr.split(',').map(i => parseInt(i.trim()));

                await enviarTextoWhatsApp(numeroCliente, "⏳ Só um instante! Estou calculando os melhores valores e preparando o PDF da rede hospitalar...");

                const resultado = cotarPorCidade(estadoCru.toLowerCase(), cidade, arrayIdades);

                if (resultado.sucesso) {
                    let respostaFinal = `✅ *Cotação Finalizada!*\n\nEncontrei estes planos para a região de *${cidade}*:\n\n`;
                    
                    resultado.dados.planos.forEach(p => {
                        respostaFinal += `🛡️ *${p.plano}*\n💰 TOTAL: R$ ${p.preco_total}\n〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\n`;
                    });
                    
                    respostaFinal += `\n_(Valores com coparticipação parcial na enfermaria. Sujeito a análise técnica)._\n\n`;

                    respostaFinal += `📅 *Informações importantes sobre a implantação:*\n`;
                    respostaFinal += `* Vigência: 01 de julho\n`;
                    respostaFinal += `* A proposta é implantada após a contratação\n\n`;
                    
                    respostaFinal += `💳 *Pagamento:*\n`;
                    respostaFinal += `* A 1ª mensalidade (taxa de adesão) é paga no ato da contratação\n`;
                    respostaFinal += `* O primeiro boleto da operadora vence em 01 de julho\n\n`;
                    
                    respostaFinal += `⏱️ *Liberação de uso:*\n`;
                    respostaFinal += `* Urgência e emergência: a partir de 10 de julho\n`;
                    respostaFinal += `* Demais procedimentos: a partir de 01 de agosto\n`;

                    await enviarTextoWhatsApp(numeroCliente, respostaFinal);
                    await buscarEEnviarPDF(numeroCliente, estadoCru.toUpperCase());
                    await enviarTextoWhatsApp(numeroCliente, "Acima está a rede de hospitais. Podemos transferir para um especialista dar andamento?");
                } else {
                    await enviarTextoWhatsApp(numeroCliente, `❌ Erro: ${resultado.erro}`);
                }
            } 

            // --- CASO 3: CONVERSA NORMAL ---
            else {
                await enviarTextoWhatsApp(numeroCliente, respostaIA);
            }

        } catch (error) {
            console.error('❌ ERRO NO PROCESSAMENTO:', error.message);
        }
    });
}

// FUNÇÃO PARA BUSCAR E ENVIAR O PDF VIA BAILEYS
async function buscarEEnviarPDF(numeroJid, siglaEstado) {
    const pastaEstadoPath = path.join(__dirname, 'books', siglaEstado);

    if (fs.existsSync(pastaEstadoPath)) {
        const arquivos = fs.readdirSync(pastaEstadoPath);
        const arquivoPDF = arquivos.find(arq => arq.toLowerCase().endsWith('.pdf'));

        if (arquivoPDF) {
            const caminhoCompleto = path.join(pastaEstadoPath, arquivoPDF);
            const bufferPDF = fs.readFileSync(caminhoCompleto);
            
            await sock.sendMessage(numeroJid, {
                document: bufferPDF,
                mimetype: 'application/pdf',
                fileName: `Rede_Hospitalar_${siglaEstado}.pdf`
            });
            return true;
        }
    }
    console.log(`⚠️ PDF não encontrado em: books/${siglaEstado}/`);
    return false;
}

async function enviarTextoWhatsApp(phoneJid, message) {
    try {
        await sock.sendMessage(phoneJid, { text: message });
    } catch (err) { 
        console.error("Erro ao enviar mensagem via WhatsApp:", err.message); 
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express rodando na porta ${PORT}`);
    // Inicia a conexão com o WhatsApp
    conectarWhatsApp();
});
