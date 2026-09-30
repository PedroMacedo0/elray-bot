// =========================================================
// LINHA ADVANCE - PADRÃO SP CAPITAL (Coparticipação Parcial)
// =========================================================
const precosAdvanceCapital = {
    "advance_600_enf": { "nome": "ADVANCE 600 - ENFERMARIA (Parcial)", "precos": { "0-18": 662.20, "19-23": 726.59, "24-28": 746.72, "29-33": 829.69, "34-38": 857.39, "39-43": 943.14, "44-48": 1342.74, "49-53": 1362.76, "54-58": 1727.56, "59+": 2660.44 } },
    "advance_600_apt": { "nome": "ADVANCE 600 - APARTAMENTO (Parcial)", "precos": { "0-18": 827.75, "19-23": 908.24, "24-28": 933.40, "29-33": 1037.11, "34-38": 1071.74, "39-43": 1178.93, "44-48": 1678.43, "49-53": 1703.45, "54-58": 2159.45, "59+": 3325.55 } },
    "advance_700_enf": { "nome": "ADVANCE 700 - ENFERMARIA (Parcial)", "precos": { "0-18": 812.53, "19-23": 891.54, "24-28": 916.24, "29-33": 1018.05, "34-38": 1052.04, "39-43": 1157.26, "44-48": 1647.56, "49-53": 1672.13, "54-58": 2119.74, "59+": 3264.41 } },
    "advance_700_apt": { "nome": "ADVANCE 700 - APARTAMENTO (Parcial)", "precos": { "0-18": 1015.66, "19-23": 1114.43, "24-28": 1145.30, "29-33": 1272.56, "34-38": 1315.05, "39-43": 1446.58, "44-48": 2059.45, "49-53": 2090.16, "54-58": 2649.68, "59+": 4080.51 } }
};

// =========================================================
// LINHA SMART 200 UP+ (Coparticipação Parcial)
// =========================================================
const precosSmart200UP = {
    "smart_200_up_enf": { "nome": "SMART 200 UP+ - ENFERMARIA (Parcial)", "precos": { "0-18": 124.93, "19-23": 168.63, "24-28": 199.30, "29-33": 199.30, "34-38": 199.30, "39-43": 236.70, "44-48": 307.71, "49-53": 400.02, "54-58": 520.03, "59+": 749.52 } }
};

// =========================================================
// SMART 200 SP (Apenas Capital)
// =========================================================
const precosSmart200SP = {
    "smart_200_sp_enf": { "nome": "SMART 200 SP - ENFERMARIA (Parcial)", "precos": { "0-18": 112.33, "19-23": 151.62, "24-28": 179.19, "29-33": 179.19, "34-38": 179.19, "39-43": 212.82, "44-48": 276.67, "49-53": 359.67, "54-58": 467.57, "59+": 673.90 } }
};

// =========================================================
// SMART 200 ABC (ABC Paulista e Baixada Santista)
// =========================================================
const precosSmart200ABC = {
    "smart_200_abc_enf": { "nome": "SMART 200 ABC - ENFERMARIA (Parcial)", "precos": { "0-18": 172.42, "19-23": 232.73, "24-28": 275.04 , "29-33": 275.04, "34-38": 275.04, "39-43": 326.66, "44-48": 424.66, "49-53": 552.06, "54-58": 717.69, "59+": 1034.41 } }
};

// =========================================================
// OUTRAS REGIONAIS (Americana, Campinas, Jundiaí, Sorocaba)
// =========================================================
const precosSmart200Americana = { "smart_200_americana_enf": { "nome": "SMART 200 AMERICANA - ENFERMARIA (Parcial)", "precos": { "0-18": 167.77, "19-23": 226.46, "24-28": 267.62, "29-33": 267.62, "34-38": 267.62, "39-43": 317.86, "44-48": 413.23, "49-53": 537.20, "54-58": 698.36, "59+": 1006.53 } } };
const precosSmart200Campinas = { "smart_200_campinas_enf": { "nome": "SMART 200 CAMPINAS - ENFERMARIA (Parcial)", "precos": { "0-18": 147.84, "19-23": 199.55, "24-28": 235.83, "29-33": 235.83, "34-38": 235.83, "39-43": 280.09, "44-48": 364.11, "49-53": 473.34, "54-58": 615.34, "59+": 886.89 } } };
const precosSmart200Jundiai = { "smart_200_jundiai_enf": { "nome": "SMART 200 JUNDIAÍ - ENFERMARIA (Parcial)", "precos": { "0-18": 150.68, "19-23": 203.39, "24-28": 240.36, "29-33": 240.36, "34-38": 240.36, "39-43": 285.47, "44-48": 371.11, "49-53": 482.45, "54-58": 627.19, "59+": 903.96 } } };
const precosSmart200Sorocaba = { "smart_200_sorocaba_enf": { "nome": "SMART 200 SOROCABA - ENFERMARIA (Parcial)", "precos": { "0-18": 170.73, "19-23": 230.46, "24-28": 272.36, "29-33": 272.36, "34-38": 272.36, "39-43": 323.48, "44-48": 420.53, "49-53": 546.70, "54-58": 710.72, "59+": 1024.36 } } };

// =========================================================
// COMBOS DE PRODUTOS
// =========================================================
const pacotaoCapital = { ...precosSmart200SP, ...precosSmart200UP, ...precosAdvanceCapital };
const pacotaoGuarulhos = { ...precosSmart200UP, ...precosAdvanceCapital };
const pacotaoAltoTiete = { ...precosSmart200UP, ...precosAdvanceCapital };
const pacotaoArujaMogi = { ...precosSmart200UP, ...precosAdvanceCapital };
const pacotaoABC = { ...precosSmart200ABC, ...precosSmart200UP, ...precosAdvanceCapital };
const pacotaoAmericana = { ...precosSmart200Americana, ...precosSmart200UP, ...precosAdvanceCapital };
const pacotaoCampinas = { ...precosSmart200Campinas, ...precosSmart200UP, ...precosAdvanceCapital };
const pacotaoJundiai = { ...precosSmart200Jundiai, ...precosSmart200UP, ...precosAdvanceCapital };
const pacotaoSorocaba = { ...precosSmart200Sorocaba, ...precosSmart200UP, ...precosAdvanceCapital };
const pacotaoInteriorRM = { ...precosSmart200UP, ...precosAdvanceCapital };

// =========================================================
// MAPEAMENTO FINAL (COM FILTRO INTELIGENTE PARA CIDADES NOVAS)
// =========================================================
const mapeamentoCidades = {
    // São Paulo
    "sao_paulo": pacotaoCapital,
    "atibaia": precosAdvanceCapital,
    "braganca_paulista": precosAdvanceCapital,
    "maripora": precosAdvanceCapital,
    
    // Guarulhos
    "guarulhos": pacotaoGuarulhos,

    // Cidades que têm tanto tabela Alto Tietê quanto GRU-Mogi
    "aruja": pacotaoArujaMogi,
    "mogi_das_cruzes": pacotaoArujaMogi,
    
    // Região Alto Tietê
    "ferraz_de_vasconcelos": pacotaoAltoTiete,
    "guararema": pacotaoAltoTiete,
    "itaquaquecetuba": pacotaoAltoTiete,
    "poa": pacotaoAltoTiete,
    "santa_isabel": pacotaoAltoTiete,
    "suzano": pacotaoAltoTiete,

    // Região ABC Paulista e Baixada Santista
    "cubatao": pacotaoABC,
    "diadema": pacotaoABC,
    "guaruja": pacotaoABC,
    "maua": pacotaoABC,
    "ribeirao_pires": pacotaoABC,
    "santo_andre": pacotaoABC,
    "santos": pacotaoABC,
    "sao_bernardo_do_campo": pacotaoABC,
    "sao_caetano_do_sul": pacotaoABC,
    "sao_vicente": pacotaoABC,

    // Região Americana
    "americana": pacotaoAmericana,
    "nova_odessa": pacotaoAmericana,
    "santa_barbara_d_oeste": pacotaoAmericana,
    "sumare": pacotaoAmericana,

    // Região Campinas
    "campinas": pacotaoCampinas,
    "hortolandia": pacotaoCampinas,

    // Região Jundiaí
    "cajamar": pacotaoJundiai,
    "campo_limpo_paulista": pacotaoJundiai,
    "itupeva": pacotaoJundiai,
    "jundiai": pacotaoJundiai,
    "louveira": pacotaoJundiai,
    "varzea_paulista": pacotaoJundiai,
    "vinhedo": pacotaoJundiai,

    // Região Sorocaba
    "itu": pacotaoSorocaba,
    "sorocaba": pacotaoSorocaba,
    "votorantim": pacotaoSorocaba,

    // Demais cidades mapeadas (UP+ e Advance)
    "osasco": pacotaoInteriorRM,
    "barueri": pacotaoInteriorRM,
    "caieiras": pacotaoInteriorRM,
    "carapicuiba": pacotaoInteriorRM,
    "cotia": pacotaoInteriorRM,
    "itapevi": pacotaoInteriorRM,
    "taboao_da_serra": pacotaoInteriorRM,
    "jandira": pacotaoInteriorRM,
    "embu_das_artes": pacotaoInteriorRM
};

// A MÁGICA ACONTECE AQUI: O Proxy intercepta qualquer pedido de cidade
module.exports = new Proxy(mapeamentoCidades, {
    get: function(lista, cidadePedida) {
        // Se a cidade estiver na lista acima, entrega o pacote dela
        if (cidadePedida in lista) {
            return lista[cidadePedida];
        }
        
        // Ignora processos internos do Node.js
        if (typeof cidadePedida === 'symbol' || cidadePedida === 'default') {
            return lista[cidadePedida];
        }
        
        // SE A CIDADE NÃO ESTIVER NA LISTA (Curinga), ENTREGA O ADVANCE!
        console.log(`⚠️ Cidade de SP não mapeada: ${String(cidadePedida)}. Acionando tabela Advance Capital como padrão.`);
        return precosAdvanceCapital;
    }
});
