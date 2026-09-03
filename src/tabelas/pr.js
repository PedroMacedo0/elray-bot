// =========================================================
// TABELA PARANÁ (PR) - HAPVIDA NOSSO PLANO VAREJO
// =========================================================

const precosCuritibaRegiao = {
    "hapvida_nosso_plano_enf": {
        "nome": "HAPVIDA NOSSO PLANO VAREJO - ENFERMARIA",
        "precos": { 
            "0-18": 215.56, 
            "19-23": 238.50, 
            "24-28": 264.19, 
            "29-33": 300.16, 
            "34-38": 341.52, 
            "39-43": 401.77, 
            "44-48": 496.11, 
            "49-53": 614.04, 
            "54-58": 1026.78, 
            "59+": 1147.06 
        }
    }
};

// =========================================================
// MAPEAMENTO DAS CIDADES
// =========================================================
module.exports = {
    "curitiba": precosCuritibaRegiao,
    "londrina": precosCuritibaRegiao,
    "pinhais": precosCuritibaRegiao,
    "sao_jose_dos_pinhais": precosCuritibaRegiao
};
