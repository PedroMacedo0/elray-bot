const { gerarCotacao } = require('./src/calculadora');

console.log("⏳ Iniciando os testes do Motor de Cálculo...\n");

// TESTE 1: Cliente de Americana pedindo plano Smart para 3 pessoas
console.log("=========================================");
console.log("🟢 TESTE 1: Americana (Smart 200)");
console.log("=========================================");
const cotacaoAmericana = gerarCotacao('sp', 'americana', 'smart_200_americana_enf', [15, 40, 62]);
console.log(cotacaoAmericana);
console.log("\n");

// TESTE 2: Cliente de São Paulo pedindo plano Advance (Apartamento) para 2 pessoas
console.log("=========================================");
console.log("🔵 TESTE 2: São Paulo (Advance 600 Apt)");
console.log("=========================================");
const cotacaoSP = gerarCotacao('sp', 'sao_paulo', 'advance_600_apt', [25, 30]);
console.log(cotacaoSP);
console.log("\n");
