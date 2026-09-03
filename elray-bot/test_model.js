const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function run() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash'
    }, { apiVersion: 'v1' });

    try {
        console.log("Chamando a API v1 com o modelo gemini-1.5-flash...");
        const result = await model.generateContent("Olá");
        console.log("Sucesso:", result.response.text());
    } catch (e) {
        console.log("Erro capturado:", e.message);
    }
}
run();
