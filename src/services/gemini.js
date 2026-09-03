require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

/**
 * Função para ler e extrair dados da tabela de preços em PDF
 * @param {string} filePath - Caminho para o arquivo PDF
 */
async function extractPricingFromPDF(filePath) {
    try {
        console.log(`Enviando arquivo ${filePath} para o Gemini...`);
        
        // Upload do arquivo usando o File API do Gemini
        const uploadResult = await fileManager.uploadFile(filePath, {
            mimeType: 'application/pdf',
            displayName: 'Tabela de Precos Notre Dame',
        });

        console.log(`Arquivo enviado com sucesso. URI: ${uploadResult.file.uri}`);

        // Inicializa o modelo
        // gemini-1.5-flash ou gemini-1.5-pro são recomendados para extração de dados
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        const prompt = `
            Você é um assistente especialista em seguros de saúde da ELRAY Seguros.
            Extraia todas as informações de preços, faixas etárias e regiões desta tabela de preços da Notre Dame Intermédica.
            Por favor, estruture os dados em um formato JSON claro que possa ser usado pelo nosso sistema para realizar cotações.
        `;

        console.log('Processando o documento...');
        
        const result = await model.generateContent([
            uploadResult.file,
            prompt
        ]);

        const responseText = result.response.text();
        console.log('Extração concluída com sucesso!');
        
        return responseText;

    } catch (error) {
        console.error('Erro ao processar o PDF no Gemini:', error);
        throw error;
    }
}

module.exports = {
    extractPricingFromPDF
};
