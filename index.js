require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const { cotarPorCidade } = require('./src/calculadora.js');

// Importações do Baileys e utilitários do WhatsApp
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode'); // Biblioteca para gerar imagem web
const pino = require('pino');

const app = express();
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Variáveis globais para gerenciar o estado da conexão e o QR Code na web
let sock;
let ultimoQrCodeString = null;
let statusConexao = 'Aguardando inicialização...';

// Rota web para exibir o QR Code no navegador (ex: https://elray-bot.onrender.com/)
app.get('/', async (req, res) => {
    if (statusConexao === 'Conectado') {
        return res.send(`
            <html>
                <body style="font-family: Arial; text-align: center; padding-top: 50px; background-color: #f4f6f8;">
                    <h1 style="color: #2e7d32;">✅ WhatsApp Conectado com Sucesso!</h1>
                    <p>O bot da ELRAY está ativo e operando normalmente na nuvem.</p>
                </body>
            </html>
        `);
    }

    if (!ultimoQrCodeString) {
        return res.send(`
            <html>
                <body style="font-family: Arial; text-align: center; padding-top: 50px; background-color: #f4f6f8;">
                    <h2>⏳ Gerando QR Code, aguarde um instante e atualize a página...</h2>
                </body>
            </html>
        `);
    }

    try {
        // Converte a string do QR Code em uma imagem DataURL (PNG)
        const qrCodeImage = await QRCode.toDataURL(ultimoQrCodeString);
        res.send(`
            <html>
                <head>
                    <title>Conectar WhatsApp - ELRAY Bot</title>
                    <meta http-equiv="refresh" content="5"> <!-- Atualiza a página a cada 5 segundos se não conectar -->
                </head>
                <body style="font-family: Arial; text-align: center; padding-top: 30px; background-color: #f4f6f8;">
                    <h2 style="color: #1565c0;">📱 Escaneie o QR Code abaixo com o seu WhatsApp</h2>
                    <p>Abra o WhatsApp > Aparelhos Conectados > Conectar um aparelho</p>
                    <div style="margin-top: 20px;">
                        <img src="${qrCodeImage}" alt="QR Code WhatsApp" style="border: 5px solid white; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); width: 300px; height: 300px;" />
                    </div>
                    <p style="margin-top: 20px; color: #666; font-size: 14px;">Esta página atualiza automaticamente.</p>
                </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send('Erro ao gerar a imagem do QR Code.');
    }
});

async function conectarWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false 
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            ultimoQrCodeString = qr; // Salva o QR code para exibir no site
            statusConexao = 'Aguardando leitura do QR Code';
            console.log('📱 Novo QR Code gerado! Acesse a URL web para escanear.');
            qrcodeTerminal.generate(qr, { small: true }); // Continua gerando no terminal por garantia
        }

        if (connection === 'close') {
            statusConexao = 'Desconectado';
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
            if (shouldReconnect) {
                conectarWhatsApp();
            }
        } else if (connection === 'open') {
            statusConexao = 'Conectado';
            ultimoQrCodeString = null; // Limpa o QR code pois já conectou
            console.log('✅ WhatsApp conectado com sucesso!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Ouvindo mensagens recebidas
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const numeroCliente = msg.key.remoteJid;
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

            if (respostaIA.startsWith('BOOK|')) {
                const estado = respostaIA.split('|')[1].trim().toUpperCase();
                console.log(`📂 Acionando envio de Book: ${estado}`);
                
                await enviarTextoWhatsApp(numeroCliente, `Certamente! Estou localizando o guia de rede hospitalar de ${estado} para você...`);
                await buscarEEnviarPDF(numeroCliente, estado);
                await enviarTextoWhatsApp(numeroCliente, "Este é o material completo. Deseja que eu realize uma simulação de valores agora?");
            } 
            else if (respostaIA.startsWith('COTAR|')) {
                const partes = respostaIA.split('|');
                const estadoCru = partes[1].trim();
                const cidade = partes[2].trim();
                const idadesStr = partes[3];

                const arrayIdades = idadesStr
                    .toLowerCase()
                    .replace(/anos?/g, '')
                    .replace(/\s+e\s+/g, ',')
                    .split(/[,;\s]+/)
                    .map(i => parseInt(i.trim()))
                    .filter(i => !isNaN(i));

                await enviarTextoWhatsApp(numeroCliente, "⏳ Só um instante! Estou calculando os melhores valores e preparando o PDF da rede hospitalar...");

                const resultado = cotarPorCidade(estadoCru.toLowerCase(), cidade, arrayIdades);

                if (resultado.sucesso) {
                    let respostaFinal = `✅ *Cotação Finalizada!*\n\nEncontrei estes planos para *${cidade} (${estadoCru.toUpperCase()})* para a(s) idade(s): *${idadesStr}*:\n\n`;
                    
                    resultado.dados.planos.forEach(p => {
                        respostaFinal += `🛡️ *${p.plano}*\n💰 TOTAL: R$ ${p.preco_total}\n〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\n`;
                    });
                    
                    respostaFinal += `\n_(Valores com coparticipação parcial na enfermaria. Sujeito a análise técnica)._\n\n`;

                    const agora = new Date();
                    const diaDoMes = agora.getDate();
                    
                    let mesAlvo = agora.getMonth() + 2; 
                    let anoAlvo = agora.getFullYear();

                    if (diaDoMes >= 23) {
                        mesAlvo += 1;
                    }
                    
                    if (mesAlvo > 12) {
                        mesAlvo = 1;
                        anoAlvo += 1;
                    }

                    const mesesNomes = ["", "janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
                    const nomeMesVigencia = mesesNomes[mesAlvo];

                    let mesSeguinteAlvo = mesAlvo + 1;
                    if (mesSeguinteAlvo > 12) {
                        mesSeguinteAlvo = 1;
                    }
                    const nomeMesSeguinte = mesesNomes[mesSeguinteAlvo];

                    respostaFinal += `📅 *Informações importantes sobre a implantação:*\n`;
                    respostaFinal += `* Vigência: 01 de ${nomeMesVigencia}\n`;
                    respostaFinal += `* A proposta é implantada após a contratação\n\n`;
                    
                    respostaFinal += `💳 *Pagamento:*\n`;
                    respostaFinal += `* A 1ª mensalidade (taxa de adesão) é paga no ato da contratação\n`;
                    respostaFinal += `* O primeiro boleto da operadora vence em 01 de ${nomeMesVigencia}\n\n`;
                    
                    respostaFinal += `⏱️ *Liberação de uso:*\n`;
                    respostaFinal += `* Urgência e emergência: a partir de 10 de ${nomeMesVigencia}\n`;
                    respostaFinal += `* Demais procedimentos: a partir de 01 de ${nomeMesSeguinte}\n`;

                    await enviarTextoWhatsApp(numeroCliente, respostaFinal);
                    await buscarEEnviarPDF(numeroCliente, estadoCru.toUpperCase());
                    await enviarTextoWhatsApp(numeroCliente, "Acima está a rede de hospitais. Podemos transferir para um especialista dar andamento?");
                } else {
                    await enviarTextoWhatsApp(numeroCliente, `❌ Erro: ${resultado.erro}`);
                }
            } 
            else {
                await enviarTextoWhatsApp(numeroCliente, respostaIA);
            }

        } catch (error) {
            console.error('❌ ERRO NO PROCESSAMENTO:', error.message);
        }
    });
}

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
    conectarWhatsApp();
});
