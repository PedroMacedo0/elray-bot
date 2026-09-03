// --- GRUPO 1: GOIÂNIA E REGIÃO ---
const precosGoianiaRegiao = {
    "aho_ce_gm_enf": {
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "0-18": 235.84,
            "19-23": 264.14,
            "24-28": 295.84,
            "29-33": 340.22,
            "34-38": 391.25,
            "39-43": 465.59,
            "44-48": 581.99,
            "49-53": 727.49,
            "54-58": 1236.73,
            "59+": 1385.14
        }
    }
};

// --- GRUPO 2: ANÁPOLIS E REGIÃO ---
const precosAnapolisRegiao = {
    "aho_ce_gm_enf": {
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "0-18": 248.01,
            "19-23": 277.77,
            "24-28": 311.10,
            "29-33": 357.77,
            "34-38": 411.43,
            "39-43": 489.60,
            "44-48": 612.00,
            "49-53": 765.00,
            "54-58": 1300.50,
            "59+": 1456.56
        }
    }
};

// MAPEAMENTO POR CIDADE (Página 7 de cada PDF)
module.exports = {
    // Tabela Goiânia
    "goiania": precosGoianiaRegiao,
    "aparecida_de_goiania": precosGoianiaRegiao,
    "senador_canedo": precosGoianiaRegiao,
    "trindade": precosGoianiaRegiao,

    // Tabela Anápolis
    "anapolis": precosAnapolisRegiao,
    "abadiania": precosAnapolisRegiao,
    "alexania": precosAnapolisRegiao,
    "pirenopolis": precosAnapolisRegiao
};
