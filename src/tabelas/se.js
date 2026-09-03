// --- GRUPO: ARACAJU E REGIÃO ---
const precosAracajuRegiao = {
    "aho_ce_gm_enf": { 
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "0-18": 266.52,   // <- Preencha com o valor do PDF
            "19-23": 298.50,
            "24-28": 334.32,
            "29-33": 384.47,
            "34-38": 442.14,
            "39-43": 526.15,
            "44-48": 657.69,
            "49-53": 822.11,
            "54-58": 1397.59,
            "59+": 1565.30
        }
    }
};

// MAPEAMENTO POR CIDADE (Área de Comercialização SE)
module.exports = {
    "aracaju": precosAracajuRegiao,
    "barra_dos_coqueiros": precosAracajuRegiao,
    "nossa_senhora_do_socorro": precosAracajuRegiao,
    "sao_cristovao": precosAracajuRegiao,
    "itaporanga_d_ajuda": precosAracajuRegiao,
    "laranjeiras": precosAracajuRegiao
    // Se tiver mais alguma cidade na página 7 do PDF, é só seguir esse mesmo padrão
};
