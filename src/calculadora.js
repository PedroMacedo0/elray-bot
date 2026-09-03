// ==========================================
// IMPORTAÇÃO DAS TABELAS (OS 18 ESTADOS REAIS)
// ==========================================
const al = require('./tabelas/al');
const am = require('./tabelas/am');
const ba = require('./tabelas/ba');
const ce = require('./tabelas/ce');
const df = require('./tabelas/df');
const go = require('./tabelas/go');
const ma = require('./tabelas/ma');
const mg = require('./tabelas/mg');
const pa = require('./tabelas/pa');
const pb = require('./tabelas/pb');
const pe = require('./tabelas/pe');
const pi = require('./tabelas/pi');
const pr = require('./tabelas/pr');
const rj = require('./tabelas/rj');
const rn = require('./tabelas/rn');
const sc = require('./tabelas/sc');
const se = require('./tabelas/se');
const sp = require('./tabelas/sp');

// ==========================================
// ESTADOS ENGATILHADOS (Sem arquivo ainda)
// ==========================================
// const ac = require('./tabelas/ac');
// const ap = require('./tabelas/ap');
// const es = require('./tabelas/es');
// const ms = require('./tabelas/ms');
// const mt = require('./tabelas/mt');
// const ro = require('./tabelas/ro');
// const rr = require('./tabelas/rr');
// const rs = require('./tabelas/rs');
// const to = require('./tabelas/to');

// ==========================================
// DICIONÁRIO DE ESTADOS
// ==========================================
const tabelasPorEstado = {
    'al': al,
    'am': am,
    'ba': ba,
    'ce': ce,
    'df': df,
    'go': go,
    'ma': ma,
    'mg': mg,
    'pa': pa,
    'pb': pb,
    'pe': pe,
    'pi': pi,
    'pr': pr,
    'rj': rj,
    'rn': rn,
    'sc': sc,
    'se': se,
    'sp': sp,
    
    // 'ac': ac,
    // 'ap': ap,
    // 'es': es,
    // 'ms': ms,
    // 'mt': mt,
    // 'ro': ro,
    // 'rr': rr,
    // 'rs': rs,
    // 'to': to
};

// ==========================================
// MOTOR DE CÁLCULO
// ==========================================
function classificarFaixaEtaria(idade) {
    if (idade <= 18) return "0-18";
    if (idade <= 23) return "19-23";
    if (idade <= 28) return "24-28";
    if (idade <= 33) return "29-33";
    if (idade <= 38) return "34-38";
    if (idade <= 43) return "39-43";
    if (idade <= 48) return "44-48";
    if (idade <= 53) return "49-53";
    if (idade <= 58) return "54-58";
    return "59+";
}

function cotarPorCidade(estado, cidade, idades) {
    try {
        const baseEstado = tabelasPorEstado[estado.toLowerCase()];
        if (!baseEstado) return { sucesso: false, erro: "Desculpe, ainda não configuramos a tabela para este estado." };

        let cidadeFormatada = cidade.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_").toLowerCase();
        
        const planosCidade = baseEstado[cidadeFormatada];
        if (!planosCidade) return { sucesso: false, erro: "Não encontramos cobertura Notre Dame/Hapvida para esta cidade." };

        let planosFormatados = [];

        for (const chavePlano in planosCidade) {
            const plano = planosCidade[chavePlano];
            let valorTotal = 0;

            idades.forEach(idade => {
                const faixa = classificarFaixaEtaria(idade);
                valorTotal += plano.precos[faixa];
            });

            if (valorTotal > 0) {
                planosFormatados.push({
                    plano: plano.nome,
                    preco_total: valorTotal.toFixed(2)
                });
            }
        }

        if (planosFormatados.length === 0) return { sucesso: false, erro: "Valores não disponíveis para as idades." };

        return { sucesso: true, dados: { planos: planosFormatados } };

    } catch (error) {
        return { sucesso: false, erro: "Erro interno ao processar a cotação." };
    }
}

module.exports = { cotarPorCidade };
