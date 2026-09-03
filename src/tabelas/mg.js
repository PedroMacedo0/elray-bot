// --- GRUPO 1: BELO HORIZONTE E REGIÃO METROPOLITANA ---
const precosBeloHorizonteRegiao = {
    "aho_ce_gm_enf": {
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "0-18": 187.93, "19-23": 210.48, "24-28": 235.74, "29-33": 271.10,
            "34-38": 311.77, "39-43": 371.01, "44-48": 463.76, "49-53": 579.70,
            "54-58": 985.49, "59+": 1103.75
        }
    }
};

// --- GRUPO 2: UBERABA ---
const precosUberaba = {
    "aho_ce_mun_enf": {
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "0-18": 196.10, "19-23": 219.63, "24-28": 245.99, "29-33": 282.89,
            "34-38": 325.32, "39-43": 387.13, "44-48": 483.91, "49-53": 604.89,
            "54-58": 1028.31, "59+": 1151.71
        }
    }
};

// --- GRUPO 3: UBERLÂNDIA ---
const precosUberlandia = {
    "aho_ce_gm_enf": {
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "0-18": 196.10, "19-23": 219.63, "24-28": 245.99, "29-33": 282.89,
            "34-38": 325.32, "39-43": 387.13, "44-48": 483.91, "49-53": 604.89,
            "54-58": 1028.31, "59+": 1151.71
        }
    }
};

// MAPEAMENTO POR CIDADE (Conforme Área de Comercialização nas páginas 7 de cada PDF)
module.exports = {
    // Tabela Belo Horizonte (Abrange 29 municípios)
    "belo_horizonte": precosBeloHorizonteRegiao,
    "contagem": precosBeloHorizonteRegiao,
    "betim": precosBeloHorizonteRegiao,
    "santa_luzia": precosBeloHorizonteRegiao,
    "ibirite": precosBeloHorizonteRegiao,
    "sabara": precosBeloHorizonteRegiao,
    "nova_lima": precosBeloHorizonteRegiao,
    "vespasiano": precosBeloHorizonteRegiao,
    "ribeirao_das_neves": precosBeloHorizonteRegiao,
    "lagoa_santa": precosBeloHorizonteRegiao,
    "brumadinho": precosBeloHorizonteRegiao,
    "esmeraldas": precosBeloHorizonteRegiao,
    "itabirito": precosBeloHorizonteRegiao,
    "mateus_leme": precosBeloHorizonteRegiao,

    // Tabela Uberaba
    "uberaba": precosUberaba,

    // Tabela Uberlândia
    "uberlandia": precosUberlandia
};
