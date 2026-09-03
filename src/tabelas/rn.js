// --- GRUPO 1: NATAL E REGIÃO ---
const precosNatalRegiao = {
    "aho_ce_gm_enf": {
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "0-18": 180.75, "19-23": 202.44, "24-28": 226.73, "29-33": 260.74,
            "34-38": 299.85, "39-43": 356.82, "44-48": 446.03, "49-53": 557.54,
            "54-58": 947.82, "59+": 1061.56
        }
    }
};

// --- GRUPO 2: MOSSORÓ E REGIÃO ---
const precosMossoroRegiao = {
    "aho_ce_gm_enf": {
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "0-18": 180.75, "19-23": 202.44, "24-28": 226.73, "29-33": 260.74,
            "34-38": 299.85, "39-43": 356.82, "44-48": 446.03, "49-53": 557.54,
            "54-58": 947.82, "59+": 1061.56
        }
    }
};

// MAPEAMENTO POR CIDADE (Conforme Área de Comercialização nas páginas 7 de cada PDF)
module.exports = {
    // Tabela Natal
    "natal": precosNatalRegiao,
    "parnamirim": precosNatalRegiao,
    "macaiba": precosNatalRegiao,
    "sao_goncalo_do_amarante": precosNatalRegiao,
    "extremoz": precosNatalRegiao,

    // Tabela Mossoró
    "mossoro": precosMossoroRegiao
};
