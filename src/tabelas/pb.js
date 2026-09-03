// --- GRUPO 1: JOÃO PESSOA E REGIÃO ---
const precosJoaoPessoaRegiao = {
    "aho_ce_gm_enf": {
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "0-18": 326.92, "19-23": 366.15, "24-28": 410.09, "29-33": 471.60,
            "34-38": 542.34, "39-43": 645.38, "44-48": 806.73, "49-53": 1008.41,
            "54-58": 1714.34, "59+": 1920.02
        }
    }
};

// --- GRUPO 2: CAMPINA GRANDE E REGIÃO ---
// Nota: O PDF de Campina Grande apresenta apenas plano Ambulatorial (JN 090).
// Conforme sua regra de não vender ambulatorial, este grupo retornará erro até que
// a tabela de Enfermaria (JN 093) seja fornecida para esta região.
const precosCampinaGrandeRegiao = {
    "aho_ce_gm_enf": {
        "nome": "HAPVIDA NOSSO PLANO - ENFERMARIA (Parcial)",
        "precos": {
            "aviso": "Tabela de Enfermaria não disponível para esta região no momento."
        }
    }
};

// MAPEAMENTO POR CIDADE (Página 7 de cada PDF)
module.exports = {
    // Tabela João Pessoa
    "joao_pessoa": precosJoaoPessoaRegiao,
    "bayeux": precosJoaoPessoaRegiao,
    "cabedelo": precosJoaoPessoaRegiao,
    "conde": precosJoaoPessoaRegiao,
    "santa_rita": precosJoaoPessoaRegiao,

    // Tabela Campina Grande
    "campina_grande": precosCampinaGrandeRegiao,
    "fagundes": precosCampinaGrandeRegiao,
    "lagoa_seca": precosCampinaGrandeRegiao,
    "massaranduba": precosCampinaGrandeRegiao,
    "puxinana": precosCampinaGrandeRegiao,
    "queimadas": precosCampinaGrandeRegiao
};
