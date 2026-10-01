require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const { cotarPorCidade } = require('./src/calculadora.js');

// Importações do Banco de Dados e Baileys
const { Pool } = require('pg');
const { 
    default: makeWASocket, 
    initAuthCreds, 
    BufferJSON, 
    proto, 
    DisconnectReason 
} = require('@whiskeysockets/baileys');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const pino = require('pino');

const app = express();
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Configuração do Banco de Dados PostgreSQL (Pega a URL do painel do Render)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Variáveis globais
let sock;
let ultimoQrCodeString = null;
let statusConexao = 'Aguardando inicialização...';

// Autenticação da Web
const WEB_USER = process.env.WEB_USER || 'admin';
const WEB_PASS = process.env.WEB_PASS || 'elray2026';

function verificarAutenticacao(req, res, next) {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [user, pass] = Buffer.from(b64auth, 'base64').toString().split(':');

    if (user === WEB_USER && pass === WEB_PASS) {
        return next();
    }
    res.set('WWW-Authenticate', 'Basic realm="Acesso Restrito - ELRAY Bot"');
    res.status(401).send('Autenticação necessária para aceder ao QR Code.');
}

app.get('/', verificarAutenticacao, async (req, res) => {
    if (statusConexao === 'Conectado') {
        return res.send(`
            <html>
                <body style="font-family: Arial; text-align: center; padding-top: 50px; background-color: #f4f6f8;">
                    <h1 style="color: #2e7d32;">✅ WhatsApp Conectado com Sucesso!</h1>
                    <p>O bot da ELRAY está ativo e a operar normalmente na nuvem.</p>
                </body>
            </html>
        `);
    }

    if (!ultimoQrCodeString) {
        return res.send(`
            <html>
                <body style="font-family: Arial; text-align: center; padding-top: 50px; background-color: #f4f6f8;">
                    <h2>⏳ A gerar QR Code, aguarde um instante e atualize a página...</h2>
                </body>
            </html>
        `);
    }

    try {
        const qrCodeImage = await QRCode.toDataURL(ultimoQrCodeString);
        res.send(`
            <html>
                <head>
                    <title>Conectar WhatsApp - ELRAY Bot</title>
                    <meta http-equiv="refresh" content="5">
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

// ============================================================================
// ADAPTADOR PARA SALVAR SESSÃO NO BANCO DE DADOS EM VEZ DE PASTA
// ============================================================================
async function usePostgresAuthState(sessionName) {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS baileys_auth (
            session_name VARCHAR(50),
            key_name VARCHAR(255),
            data TEXT,
            PRIMARY KEY (session_name, key_name)
        )
    `);

    const writeData = async (data, key) => {
        const dataString = JSON.stringify(data, BufferJSON.replacer);
        await pool.query(
            `INSERT INTO baileys_auth (session_name, key_name, data) VALUES ($1, $2, $3) 
             ON CONFLICT (session_name, key_name) DO UPDATE SET data = EXCLUDED.data`,
            [sessionName, key, dataString]
        );
    };

    const readData = async (key) => {
        const res = await pool.query('SELECT data FROM baileys_auth WHERE session_name = $1 AND key_name = $2', [sessionName, key]);
        if (res.rows.length > 0) {
            return JSON.parse(res.rows[0].data, BufferJSON.reviver);
        }
        return null;
    };

    const removeData = async (key) => {
        await pool.query('DELETE FROM baileys_auth WHERE session_name = $1 AND key_name = $2', [sessionName, key]);
    };

    let creds = await readData('creds');
    if (!creds) {
        creds = initAuthCreds();
        await writeData(creds, 'creds');
    }

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(ids.map(async (id) => {
                        let value = await readData(`${type}-${id}`);
                        if (type === 'app-state-sync-key' && value) {
                            value = proto.Message.AppStateSyncKeyData.fromObject(value);
                        }
                        data[id] = value;
                    }));
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const key = `${category}-${id}`;
                            if (value) {
                                tasks.push(writeData(value, key));
                            } else {
                                tasks.push(removeData(key));
                            }
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: () => writeData(creds, 'creds'),
        clearState: async () => {
            await pool.query('DELETE FROM baileys_auth WHERE session_name = $1', [sessionName]);
        }
    };
}

async function conectarWhatsApp() {
    // Agora puxamos o "state" direto do banco de dados (Sessão: ray_bot)
    const { state, saveCreds, clearState } = await usePostgresAuthState('ray_bot');

    sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false 
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            ultimoQrCodeString = qr;
            statusConexao = 'Aguardando leitura do QR Code';
            console.log('📱 Novo QR Code gerado! Acesse a URL web para escanear.');
            qrcodeTerminal.generate(qr, { small: true });
        }

        if (connection === 'connecting') {
            statusConexao = 'Conectando';
            console.log('⏳ Conectando a Ray ao WhatsApp...');
        }

        if (connection === 'open') {
            statusConexao = 'Conectado';
            ultimoQrCodeString = null;
            console.log('✅ WhatsApp conectado com sucesso! Ray operacional.');
        }

        if (connection === 'close') {
            statusConexao = 'Desconectado';
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const motivo = lastDisconnect?.error?.message || 'Desconhecido';
            
            console.warn(`⚠️ Conexão da Ray encerrada. Motivo: ${motivo} (Code: ${statusCode})`);

            const desconectadoPeloUsuario = statusCode === DisconnectReason.loggedOut;
            const falhaInternaOuTimeout = statusCode === DisconnectReason.connectionClosed || 
                                          statusCode === DisconnectReason.connectionLost || 
                                          statusCode === DisconnectReason.timedOut ||
                                          statusCode === 503 || 
                                          statusCode === 440 ||
                                          statusCode === 408;

            if (desconectadoPeloUsuario) {
                console.log('❌ Sessão desconectada ativamente pelo celular. Limpando BANCO DE DADOS...');
                ultimoQrCodeString = null;
                try {
                    await clearState(); // Apaga a sessão do DB
                } catch (e) {}
                setTimeout(() => conectarWhatsApp(), 2000);
            } else if (falhaInternaOuTimeout) {
                console.log(`🔄 Queda de servidor/rede detectada (Code: ${statusCode}). Reconectando em 5 segundos...`);
                setTimeout(() => conectarWhatsApp(), 5000);
            } else {
                console.log(`🔄 Reinício necessário (Code: ${statusCode}). Reconectando em 3 segundos...`);
                setTimeout(() => conectarWhatsApp(), 3000);
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // ============================================================================
    // OUVINDO MENSAGENS E ENVIANDO COTAÇÕES (LÓGICA DA RAY MANTIDA)
    // ============================================================================
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
                        respostaFinal += `🛡️ *${p.plano}*\n💰 TOTAL: R$ ${p.preco_total}\n〰️️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\n`;
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

                    respostaFinal += `📅 *Informações importantes sobre a implantação:*\n`;
                    respostaFinal += `* Vigência: 01 de ${nomeMesVigencia}\n`;
                    respostaFinal += `* A proposta é implantada após a contratação\n\n`;
                    
                    respostaFinal += `💳 *Pagamento:*\n`;
                    respostaFinal += `* A 1ª mensalidade (taxa de adesão) é paga no ato da contratação\n`;
                    respostaFinal += `* O primeiro boleto da operadora vence em 01 de ${nomeMesVigencia}\n\n`;
                    
                    // REGRAS DE CARÊNCIA ATUALIZADAS AQUI!
                    respostaFinal += `⏱️ *Liberação de uso (após o início da vigência):*\n`;
                    respostaFinal += `* Consultas, exames simples e urgência/emergência: 24 horas\n`;
                    respostaFinal += `* Demais procedimentos: a partir de 90 dias\n`;

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
