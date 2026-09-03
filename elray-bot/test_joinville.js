const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');

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
    const pdfPath = path.join(__dirname, 'notre dame', 'Santa Catarina', 'Joinville_e_Regiao', 'tabela.pdf');
    if (!fs.existsSync(pdfPath)) {
        console.log("PDF não encontrado: " + pdfPath);
        return;
    }
    
    console.log("Lendo PDF...");
    const text = await extractTextFromPDF(pdfPath);
    
    // Procura por Joinville
    const lowerText = text.toLowerCase();
    const index = lowerText.indexOf('joinville');
    
    if (index !== -1) {
        console.log("ACHOU JOINVILLE! Contexto ao redor:");
        console.log(text.substring(Math.max(0, index - 200), Math.min(text.length, index + 200)));
    } else {
        console.log("Joinville NÃO encontrada no texto extraído do PDF!");
    }
}
runTest();
