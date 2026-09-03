// --- LINHA ADVANCE (Com Reembolso) ---
const precosAdvanceRJ = {
    "advance_600_enf": { 
        "nome": "ADVANCE 600 - ENFERMARIA", 
        "precos": { "0-18": 299.55, "19-23": 350.47, "24-28": 427.57, "29-33": 513.09, "34-38": 538.75, "39-43": 592.62, "44-48": 740.78, "49-53": 895.65, "54-58": 1120.32, "59+": 1782.44} 
    },
    "advance_600_apt": { 
        "nome": "ADVANCE 600 - APARTAMENTO", 
        "precos": { "0-18": 332.51, "19-23": 389.03, "24-28": 474.62, "29-33": 569.55, "34-38": 598.03, "39-43": 657.83, "44-48": 822.29, "49-53": 994.20, "54-58": 1243.59, "59+": 1978.56 } 
    },
    "advance_700_enf": { 
        "nome": "ADVANCE 700 - ENFERMARIA", 
        "precos": { "0-18": 340.88, "19-23": 398.83, "24-28": 486.56, "29-33": 583.88, "34-38": 613.08, "39-43": 674.39, "44-48": 842.99, "49-53": 1019.23, "54-58": 1274.89, "59+": 2028.37 } 
    },
    "advance_700_apt": { 
        "nome": "ADVANCE 700 - APARTAMENTO", 
        "precos": { "0-18": 378.38, "19-23": 442.70, "24-28": 540.09, "29-33": 648.12, "34-38": 680.53, "39-43": 748.57, "44-48": 935.72, "49-53": 1131.36, "54-58": 1415.14, "59+": 2251.51 } 
    }
};

// --- LINHA SMART (Cidades do Grande Rio) ---
const precosSmartRJ = {
    "smart_150_enf": { "nome": "SMART 150 GRANDE RIO - ENFERMARIA", "precos": { "0-18": 121.27, "19-23": 164.68, "24-28": 181.15, "29-33": 197.45, "34-38": 200.42, "39-43": 210.44, "44-48": 298.19, "49-53": 402.55, "54-58": 483.06, "59+": 727.48 } },
    "smart_rio_enf": { "nome": "SMART RIO - APARTAMENTO", "precos": { "0-18": 121.27, "19-23": 164.68, "24-28": 181.15, "29-33": 197.45, "34-38": 200.42, "39-43": 210.44, "44-48": 298.19, "49-53": 402.55, "54-58": 483.06, "59+": 727.48 } }
};

// União das tabelas para o RJ
const rjFinal = { ...precosAdvanceRJ, ...precosSmartRJ };

module.exports = {
    "rio_de_janeiro": rjFinal,
    "duque_de_caxias": rjFinal,
    "niteroi": rjFinal,
    "nova_iguacu": rjFinal,
    "sao_goncalo": rjFinal,
    "sao_joao_de_meriti": rjFinal,
    "belford_roxo": rjFinal,
    "itaborai": rjFinal,
    "mage": rjFinal,
    "marica": rjFinal,
    "mesquita": rjFinal,
    "nilopolis": rjFinal
};
