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
    const text = await extractTextFromPDF(pdfPath);
    
    const lowerText = text.toLowerCase();
    let index = lowerText.indexOf('joinville');
    
    while (index !== -1) {
        console.log("ACHOU JOINVILLE! Contexto ao redor:");
        console.log(text.substring(Math.max(0, index - 50), Math.min(text.length, index + 50)));
        console.log("------------------------");
        index = lowerText.indexOf('joinville', index + 1);
    }
}
runTest();
