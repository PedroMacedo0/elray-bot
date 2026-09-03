const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdf = require('pdf-parse');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function render_page(pageData) {
    let render_options = { normalizeWhitespace: false, disableCombineTextItems: false };
    return pageData.getTextContent(render_options).then(function(textContent) {
        let lastY, text = '';
        for (let item of textContent.items) {
            if (lastY == item.transform[5] || !lastY) {
                text += item.str;
            } else {
                text += '\n' + item.str;
            }
            lastY = item.transform[5];
        }
        return `\n\n[--- PÁGINA ${pageData.pageIndex + 1} ---]\n\n` + text;
    });
}

async function extractTextFromPDF(pdfPath) {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer, { pagerender: render_page });
    return data.text;
}

async function runTest() {
    const estado = 'Bahia';
    const estadoPath = path.join(__dirname, 'notre dame', 'Bahia');
    const regioes = ['Camaçari'];
    
    const cidadeCliente = 'Salvador';
    const idadeCliente = '25';

    const model = genAI.getGenerativeModel({
        model: 'models/gemini-flash-latest',
        generationConfig: { responseMimeType: "application/json" }
    });

    for (const regiao of regioes) {
        console.log(`\nTestando região: ${regiao}`);
        const pdfPath = path.join(estadoPath, regiao, 'tabela.pdf');
        if (!fs.existsSync(pdfPath)) continue;

        const pdfText = await extractTextFromPDF(pdfPath);
        const prompt = `
            Você é um assistente especialista em seguros de saúde da ELRAY Seguros.
            Abaixo está o texto extraído de uma tabela de preços em PDF da Notre Dame Intermédica para a região de ${regiao} - ${estado}.
            
            PASSO 1: O texto do PDF foi processado e contém marcadores de página no formato [--- PÁGINA X ---]. Leia a página 7 (ou a página correspondente à lista de municípios de abrangência) e valide se a cidade específica '${cidadeCliente}' está listada lá, ou se o plano abrange explicitamente todo o estado de ${estado}.
            PASSO 2: O cliente forneceu a(s) seguinte(s) idade(s): ${idadeCliente}. Se a cidade ESTIVER listada (ou coberta pelo estado):
               - Descubra em qual faixa etária CADA idade se enquadra.
               - Encontre o preço individual para cada idade.
               - SOME todos os valores encontrados.
               - Extraia o nome dos planos disponíveis e retorne APENAS o preço total somado no campo 'preco_total'.
            PASSO 3: Se a cidade NÃO ESTIVER listada, NÃO extraia os preços. Retorne apenas uma mensagem informando que a cidade não tem cobertura neste PDF.
            
            Retorne APENAS um array JSON válido com a seguinte estrutura.
            
            Exemplo se a cidade FOR atendida:
            [
                {
                    "cidade_coberta": true,
                    "plano": "Nome do Plano 1 (ex: Smart 200)",
                    "idades_processadas": "${idadeCliente}",
                    "preco_total": 450.00
                }
            ]
            
            Exemplo se a cidade NÃO FOR atendida:
            [
                {
                    "cidade_coberta": false,
                    "mensagem": "A cidade ${cidadeCliente} não está listada na página de municípios de abrangência desta tabela da região ${regiao}."
                }
            ]
            
            REGRAS DE FORMATAÇÃO DO NOME DO PLANO:
            1. Adicione SEMPRE a acomodação (Enfermaria ou Apartamento). ATENÇÃO: Todos os planos chamados "Nosso Plano" são OBRIGATORIAMENTE "Enfermaria". O PDF pode estar errado e dizer "Apartamento", mas você deve corrigir e extrair sempre como "Enfermaria" para qualquer "Nosso Plano".
            2. Adicione SEMPRE o tipo de coparticipação (ex: "Coparticipação Total" ou "Coparticipação Parcial").
            3. NÃO inclua termos como "com Odonto", "Incluso Odonto" ou "+ Odonto" no nome do plano.
            4. IGNORE COMPLETAMENTE e NUNCA extraia planos do tipo "Ambulatorial", "Ambulatorial + Odonto" ou que sejam exclusivamente ambulatoriais. Traga apenas planos com cobertura hospitalar/completa.

            Texto da tabela:
            ${pdfText}
        `;
        const result = await model.generateContent(prompt);
        console.log("RAW RESPONSE:");
        console.log(result.response.text());
    }
}
runTest();
