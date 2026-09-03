// --- GRUPO: TERESINA E REGIÃO ---
const precosTeresinaRegiao = {
    "aho_ce_gm_enf": {
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "0-18": 155.42,
            "19-23": 174.07,
            "24-28": 194.96,
            "29-33": 224.20,
            "34-38": 257.83,
            "39-43": 306.82,
            "44-48": 383.53,
            "49-53": 479.41,
            "54-58": 815.00,
            "59+": 912.80
        }
    }
};

// MAPEAMENTO POR CIDADE (Página 7 - Área de Comercialização)
module.exports = {
    // Piauí
    "teresina": precosTeresinaRegiao,
    "demerval_lobao": precosTeresinaRegiao,
    "nazario": precosTeresinaRegiao,

    // Maranhão (Cidade atendida pela tabela de Teresina)
    "timon": precosTeresinaRegiao
};
