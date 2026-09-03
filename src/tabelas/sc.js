// --- GRUPO: JOINVILLE E REGIÃO ---
const precosJoinvilleRegiao = {
    // Altere a chave abaixo se o código ANS/Segmentação do plano for diferente
    "aho_ce_gm_enf": { 
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "0-18": 246.24,   // <- Digite o valor real aqui
            "19-23": 275.79,  // <- Digite o valor real aqui
            "24-28": 308.88,  // <- Digite o valor real aqui
            "29-33": 355.21,  // <- Digite o valor real aqui
            "34-38": 408.49,  // <- Digite o valor real aqui
            "39-43": 486.10,  // <- Digite o valor real aqui
            "44-48": 607.63,  // <- Digite o valor real aqui
            "49-53": 759.54,  // <- Digite o valor real aqui
            "54-58": 1291.22,  // <- Digite o valor real aqui
            "59+": 1446.17  // <- Digite o valor real aqui
        }
    }
};

// MAPEAMENTO POR CIDADE (Área de Comercialização SC)
module.exports = {
    "joinville": precosJoinvilleRegiao,
    "araquari": precosJoinvilleRegiao,
    "balneario_barra_do_sul": precosJoinvilleRegiao,
    "garuva": precosJoinvilleRegiao,
    "itapoa": precosJoinvilleRegiao,
    "sao_francisco_do_sul": precosJoinvilleRegiao
};
