// --- GRUPO: BRASÍLIA E REGIÃO DO ENTORNO (GO) ---
const precosBrasiliaERegiao = {
    "aho_ce_mun_enf": {
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "0-18": 168.16,
            "19-23": 188.34,
            "24-28": 210.94,
            "29-33": 242.58,
            "34-38": 278.97,
            "39-43": 331.97,
            "44-48": 414.96,
            "49-53": 518.70,
            "54-58": 881.79,
            "59+": 987.60
        }
    }
};

// MAPEAMENTO POR CIDADE (Página 7 - DF e GO)
module.exports = {
    // Distrito Federal
    "brasilia": precosBrasiliaERegiao,

    // Goiás (Cidades de Comercialização da Tabela Brasília)
    "aguas_lindas_de_goias": precosBrasiliaERegiao,
    "cidade_ocidental": precosBrasiliaERegiao,
    "formosa": precosBrasiliaERegiao,
    "novo_gama": precosBrasiliaERegiao,
    "planaltina": precosBrasiliaERegiao,
    "santo_antonio_do_descoberto": precosBrasiliaERegiao,
    "valparaiso_de_goias": precosBrasiliaERegiao
};
