// --- GRUPO 1: FORTALEZA E REGIÃO ---
const precosFortalezaRegiao = {
    "aho_ce_gm_enf": {
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "0-18": 193.39, "19-23": 216.60, "24-28": 242.59, "29-33": 278.98,
            "34-38": 320.83, "39-43": 381.79, "44-48": 477.24, "49-53": 596.55,
            "54-58": 1014.14, "59+": 1135.84
        }
    }
};

// --- GRUPO 2: JUAZEIRO DO NORTE E REGIÃO ---
const precosJuazeiroRegiao = {
    "aho_ce_gm_enf": {
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "0-18": 318.22, "19-23": 356.41, "24-28": 399.18, "29-33": 459.06,
            "34-38": 527.92, "39-43": 628.22, "44-48": 785.28, "49-53": 981.60,
            "54-58": 1668.72, "59+": 1868.97
        }
    }
};

// MAPEAMENTO POR CIDADE (Página 7 de cada PDF)
module.exports = {
    // Tabela Fortaleza
    "fortaleza": precosFortalezaRegiao,
    "aquiraz": precosFortalezaRegiao,
    "caucaia": precosFortalezaRegiao,
    "eusebio": precosFortalezaRegiao,
    "maracanau": precosFortalezaRegiao,

    // Tabela Juazeiro do Norte
    "juazeiro_do_norte": precosJuazeiroRegiao,
    "barbalha": precosJuazeiroRegiao,
    "crato": precosJuazeiroRegiao,
    "caririacu": precosJuazeiroRegiao,
    "missao_velha": precosJuazeiroRegiao
};
