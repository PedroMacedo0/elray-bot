// Preços fixos para o Grupo de Maceió e Região (Ajustado: Apenas Enfermaria)
const precosMaceioERegiao = {
    "aho_ce_gm_enf": {
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "0-18": 280.43,
            "19-23": 314.08,
            "24-28": 351.77,
            "29-33": 404.54,
            "34-38": 465.22,
            "39-43": 553.61,
            "44-48": 692.01,
            "49-53": 865.01,
            "54-58": 1470.52,
            "59+": 1646.98
        }
    }
};

// Mapeamento das cidades de Alagoas (Página 7)
module.exports = {
    "maceio": precosMaceioERegiao,
    "coqueiro_seco": precosMaceioERegiao,
    "marechal_deodoro": precosMaceioERegiao,
    "paripueira": precosMaceioERegiao,
    "rio_largo": precosMaceioERegiao,
    "santa_luzia_do_norte": precosMaceioERegiao,
    "satuba": precosMaceioERegiao
};
