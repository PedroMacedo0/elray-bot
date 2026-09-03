// --- GRUPO 1: SALVADOR E REGIÃO METROPOLITANA ---
const precosSalvadorRegiao = {
    "aho_ce_gm_enf": {
        "nome": "NOSSO PLANO AHO CE GM ENF (Parcial)",
        "precos": {
            "0-18": 231.52, "19-23": 259.30, "24-28": 290.42, "29-33": 333.98,
            "34-38": 384.08, "39-43": 457.06, "44-48": 571.33, "49-53": 714.16,
            "54-58": 1214.07, "59+": 1359.76
        }
    }
};

// --- GRUPO 2: CAMAÇARI ---
const precosCamacari = {
    "aho_ce_gm_enf": {
        "nome": "NOSSO PLANO AHO CE GM ENF (Parcial)",
        "precos": {
            "0-18": 231.52, "19-23": 259.30, "24-28": 290.42, "29-33": 333.98,
            "34-38": 384.08, "39-43": 457.06, "44-48": 571.33, "49-53": 714.16,
            "54-58": 1214.07, "59+": 1359.76
        }
    }
};

// --- GRUPO 3: FEIRA DE SANTANA E REGIÃO ---
const precosFeiraERegiao = {
    "aho_ce_gm_enf": {
        "nome": "NOSSO PLANO AHO CE GM ENF (Parcial)",
        "precos": {
            "0-18": 290.47, "19-23": 325.33, "24-28": 364.37, "29-33": 419.03,
            "34-38": 481.88, "39-43": 573.44, "44-48": 716.80, "49-53": 896.00,
            "54-58": 1523.20, "59+": 1705.98
        }
    }
};

// MAPEAMENTO FINAL POR CIDADE (Página 7 de cada PDF)
module.exports = {
    // Tabela Salvador
    "salvador": precosSalvadorRegiao,
    "candeias": precosSalvadorRegiao,
    "lauro_de_freitas": precosSalvadorRegiao,
    "simoes_filho": precosSalvadorRegiao,
    "vera_cruz": precosSalvadorRegiao,

    // Tabela Camaçari
    "camacari": precosCamacari,

    // Tabela Feira de Santana
    "feira_de_santana": precosFeiraERegiao,
    "antonio_cardoso": precosFeiraERegiao,
    "conceicao_do_jacuipe": precosFeiraERegiao,
    "sao_goncalo_dos_campos": precosFeiraERegiao
};
