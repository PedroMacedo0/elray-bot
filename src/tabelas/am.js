// Preços fixos para o Grupo de Manaus e Região (Hapvida/Affix)
const precosManausERegiao = {
    "aho_ce_gm_enf": {
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "0-18": 257.01,
            "19-23": 287.85,
            "24-28": 322.39,
            "29-33": 370.75,
            "34-38": 426.36,
            "39-43": 507.37,
            "44-48": 634.21,
            "49-53": 792.76,
            "54-58": 1347.69,
            "59+": 1506.41
        }
    }
};

// Mapeamento das cidades do Amazonas (Página 7 do PDF)
module.exports = {
    "manaus": precosManausERegiao,
    "careiro_da_varzea": precosManausERegiao,
    "iranduba": precosManausERegiao
};
