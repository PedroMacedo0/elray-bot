// --- GRUPO: RECIFE E REGIÃO METROPOLITANA ---
const precosRecifeRegiao = {
    "aho_ce_gm_enf": {
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "0-18": 240.62,
            "19-23": 269.49,
            "24-28": 301.83,
            "29-33": 347.10,
            "34-38": 399.17,
            "39-43": 475.01,
            "44-48": 593.76,
            "49-53": 742.20,
            "54-58": 1261.74,
            "59+": 1413.15
        }
    }
};

// MAPEAMENTO POR CIDADE (Página 7 - Área de Comercialização)
module.exports = {
    "recife": precosRecifeRegiao,
    "abreu_e_lima": precosRecifeRegiao,
    "cabo_de_santo_agostinho": precosRecifeRegiao,
    "camaragibe": precosRecifeRegiao,
    "igarassu": precosRecifeRegiao,
    "itapissuma": precosRecifeRegiao,
    "jaboatao_dos_guararapes": precosRecifeRegiao,
    "moreno": precosRecifeRegiao,
    "olinda": precosRecifeRegiao,
    "paulista": precosRecifeRegiao,
    "sao_lourenco_da_mata": precosRecifeRegiao
};
