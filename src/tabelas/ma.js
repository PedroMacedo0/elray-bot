// --- GRUPO: SÃO LUÍS E REGIÃO ---
const precosSaoLuisRegiao = {
    "aho_ce_gm_enf": {
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "0-18": 192.37,
            "19-23": 215.45,
            "24-28": 241.30,
            "29-33": 277.50,
            "34-38": 319.13,
            "39-43": 379.76,
            "44-48": 474.70,
            "49-53": 593.38,
            "54-58": 1008.75,
            "59+": 1129.80
        }
    }
};

// MAPEAMENTO POR CIDADE (Página 7 do PDF)
module.exports = {
    "sao_luis": precosSaoLuisRegiao,
    "paco_do_lumiar": precosSaoLuisRegiao,
    "raposa": precosSaoLuisRegiao,
    "sao_jose_de_ribamar": precosSaoLuisRegiao
};
