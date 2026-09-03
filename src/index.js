const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { extractPricingFromPDF } = require('./services/gemini');

// Inicializa o cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(), // Mantém a sessão salva
});

// Evento gerado quando o QR Code está pronto para ser escaneado
client.on('qr', (qr) => {
    console.log('Por favor, escaneie o QR Code abaixo para conectar o WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Evento gerado quando a conexão é estabelecida com sucesso
client.on('ready', () => {
    console.log('Cliente WhatsApp está pronto e conectado!');
    console.log('Bot da ELRAY Seguros inicializado com sucesso.');
});

// Evento de mensagens recebidas
client.on('message', async (msg) => {
    // Exemplo básico de resposta
    if (msg.body === '!ping') {
        msg.reply('pong! Bot da ELRAY Seguros funcionando.');
    }
    
    // Aqui adicionaremos a lógica de cotação futuramente
    if (msg.body.toLowerCase().includes('cotação') || msg.body.toLowerCase().includes('cotacao')) {
        msg.reply('Olá! Sou o assistente da ELRAY Seguros. Em breve poderei realizar cotações da Notre Dame Intermédica para você.');
    }
});

// Exemplo de uso para testar o Gemini localmente (isso não será executado ao receber mensagens no momento)
async function testGeminiExtraction() {
    // Para testar, coloque um arquivo PDF na pasta raiz do projeto e atualize o nome aqui
    const testPdfPath = './tabela-teste.pdf';
    
    const fs = require('fs');
    if (fs.existsSync(testPdfPath)) {
        console.log('Iniciando teste de extração do PDF...');
        try {
            const result = await extractPricingFromPDF(testPdfPath);
            console.log('Resultado do teste:', result);
        } catch (error) {
            console.error('Erro no teste:', error);
        }
    } else {
        console.log(`Para testar a extração com Gemini, adicione um arquivo '${testPdfPath}' na raiz do projeto.`);
    }
}

// Inicializa o cliente
client.initialize();

// Opcional: testar a integração do Gemini ao iniciar
// testGeminiExtraction();
