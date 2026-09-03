// --- GRUPO 1: BELÉM E REGIÃO ---
const precosBelemRegiao = {
    "aho_ce_gm_enf": {
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "0-18": 260.95, "19-23": 292.26, "24-28": 327.33, "29-33": 376.43,
            "34-38": 432.89, "39-43": 515.14, "44-48": 643.93, "49-53": 804.91,
            "54-58": 1368.35, "59+": 1532.55
        }
    }
};

// --- GRUPO 2: PARAUAPEBAS E REGIÃO ---
const precosParauapebasRegiao = {
    "aho_ce_gm_enf": {
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "0-18": 317.93, "19-23": 356.08, "24-28": 398.81, "29-33": 458.63,
            "34-38": 527.42, "39-43": 627.63, "44-48": 784.54, "49-53": 980.68,
            "54-58": 1667.16, "59+": 1867.22
        }
    }
};

// MAPEAMENTO POR CIDADE (Conforme Área de Comercialização nas páginas 7 de cada PDF)
module.exports = {
    // Tabela Belém
    "belem": precosBelemRegiao,
    "ananindeua": precosBelemRegiao,

    // Tabela Parauapebas
    "parauapebas": precosParauapebasRegiao,
    "curionopolis": precosParauapebasRegiao
};
