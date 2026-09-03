const fs = require('fs');
const path = require('path');
// O segredo está aqui: importamos a biblioteca e já pegamos a função certa
const pdf = require('pdf-parse-fork'); 

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Lendo a API_KEY diretamente do .env conforme solicitado
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const stateMap = {
    'acre': 'ac', 'alagoas': 'al', 'amapa': 'ap', 'amazonas': 'am', 'bahia': 'ba',
    'ceara': 'ce', 'distrito federal': 'df', 'espirito santo': 'es', 'goias': 'go',
    'maranhao': 'ma', 'mato grosso': 'mt', 'mato grosso do sul': 'ms', 'minas gerais': 'mg',
    'para': 'pa', 'paraiba': 'pb', 'parana': 'pr', 'pernambuco': 'pe', 'piaui': 'pi',
    'rio de janeiro': 'rj', 'rio grande do norte': 'rn', 'rio grande do sul': 'rs',
    'rondonia': 'ro', 'roraima': 'rr', 'santa catarina': 'sc', 'sao paulo': 'sp',
    'sergipe': 'se', 'tocantins': 'to'
};

const reverseStateMap = Object.entries(stateMap).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
}, {});

// Aliases comuns de clientes (digitar capital no lugar do estado)
const stateAliases = {
    'bh': 'minas gerais',
    'belo horizonte': 'minas gerais',
    'salvador': 'bahia',
    'recife': 'pernambuco',
    'fortaleza': 'ceara',
    'brasilia': 'distrito federal',
    'floripa': 'santa catarina',
    'florianopolis': 'santa catarina',
    'curitiba': 'parana',
    'poa': 'rio grande do sul',
    'porto alegre': 'rio grande do sul'
};

function normalizeString(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function findMatchingFolder(basePath, searchName, isState = false) {
    if (!fs.existsSync(basePath)) return null;

    let normalizedSearch = normalizeString(searchName);

    let possibleSearches = [normalizedSearch];
    if (isState) {
        if (stateAliases[normalizedSearch]) {
            normalizedSearch = stateAliases[normalizedSearch];
            possibleSearches.push(normalizedSearch);
        }
        if (stateMap[normalizedSearch]) possibleSearches.push(stateMap[normalizedSearch]);
        if (reverseStateMap[normalizedSearch]) possibleSearches.push(reverseStateMap[normalizedSearch]);
    }

    try {
        const folders = fs.readdirSync(basePath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const folder of folders) {
            const normalizedFolder = normalizeString(folder);
            if (possibleSearches.includes(normalizedFolder)) {
                return folder;
            }
        }
    } catch (e) {
        return null;
    }
    return null;
}

function buscarBookEstado(estadoUF) {
    if (!estadoUF) return null;
    const projectRoot = path.join(__dirname, '..', '..');
    const booksRoot = path.join(projectRoot, 'books', estadoUF);
    
    if (fs.existsSync(booksRoot)) {
        const files = fs.readdirSync(booksRoot);
        const pdfFile = files.find(file => file.toLowerCase().endsWith('.pdf'));
        if (pdfFile) {
            return path.join(booksRoot, pdfFile);
        }
    }
    return null;
}

/**
 * Função para extrair texto de um PDF local com marcadores de página
 * @param {string} pdfPath - Caminho do arquivo PDF
 */
function render_page(pageData) {
    let render_options = { normalizeWhitespace: false, disableCombineTextItems: false };
    return pageData.getTextContent(render_options).then(function (textContent) {
        let lastY, text = '';
        for (let item of textContent.items) {
            if (lastY == item.transform[5] || !lastY) {
                text += item.str;
            } else {
                text += '\n' + item.str;
            }
            lastY = item.transform[5];
        }
        return `\n\n[--- PÁGINA ${pageData.pageIndex + 1} ---]\n\n` + text;
    });
}

async function extractTextFromPDF(pdfPath) {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer); 
    return data.text;
}

async function getBestModel(apiKey) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();
        const validModels = data.models.filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"));
        let best = validModels.find(m => m.name.includes("1.5-flash-latest"));
        if (!best) best = validModels.find(m => m.name.includes("flash"));
        if (!best && validModels.length > 0) best = validModels[0];
        if (best) return best.name.replace("models/", "");
    } catch (err) {
        console.error("Aviso: Falha ao buscar modelos dinamicamente. Usando fallback.", err.message);
    }
    return "gemini-1.5-flash-latest";
}

async function generateWithFallback(prompt) {
    const fallbackModels = [
        'gemini-2.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-pro'
    ];
    for (const modelName of fallbackModels) {
        console.log(`\nTentando modelo fallback: ${modelName}`);
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: "v1beta" });
                const result = await model.generateContent(prompt);
                console.log(`Modelo ${modelName} succeeded on attempt ${attempt}`);
                return { result, modelUsed: modelName };
            } catch (e) {
                if (e.message && e.message.includes('503')) {
                    console.warn(`Erro 503 no modelo ${modelName} (tentativa ${attempt}). Retentando em 2s...`);
                    await new Promise(res => setTimeout(res, 2000));
                } else {
                    console.warn(`Erro no modelo ${modelName}: ${e.message}. Pulando para próximo modelo.`);
                    break; // exit attempts loop, go to next model
                }
            }
        }
        console.warn(`Todas as tentativas falharam para o modelo ${modelName}.`);
    }
    throw new Error('Todos os modelos de fallback falharam.');
}

async function getAvailableModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();
        // Return only model names that support generateContent
        return data.models
            .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
            .map(m => m.name.replace('models/', ''));
    } catch (err) {
        console.error('Erro ao listar modelos disponíveis:', err.message);
        return [];
    }
}

async function generateWithFallback(prompt) {
    // Define priority order
    const priority = ['gemini-2.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro', 'gemini-1.5-flash'];
    const available = await getAvailableModels();
    const fallbackModels = priority.filter(m => available.includes(m));
    if (fallbackModels.length === 0) {
        console.warn('Nenhum modelo de fallback disponível. Usando lista completa.');
        fallbackModels.push(...available);
    }
    for (const modelName of fallbackModels) {
        console.log(`\nTentando modelo fallback: ${modelName}`);
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: "v1beta" });
                const result = await model.generateContent(prompt);
                console.log(`Modelo ${modelName} succeeded on attempt ${attempt}`);
                return { result, modelUsed: modelName };
            } catch (e) {
                if (e.message && e.message.includes('503')) {
                    console.warn(`Erro 503 no modelo ${modelName} (tentativa ${attempt}). Retentando em 2s...`);
                    await new Promise(res => setTimeout(res, 2000));
                } else {
                    console.warn(`Erro no modelo ${modelName}: ${e.message}. Pulando para próximo modelo.`);
                    break;
                }
            }
        }
        console.warn(`Todas as tentativas falharam para o modelo ${modelName}.`);
    }
    throw new Error('Todos os modelos de fallback falharam.');
}

// Load API keys from .env
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Simple rate‑limiter: minimum interval between API calls (in ms)
const MIN_INTERVAL_MS = 1000;
let lastApiCall = 0;

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call OpenAI Chat Completion API with retry logic.
 * Returns the assistant's content string.
 */
async function callOpenAI(prompt) {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Enforce rate limit
    const now = Date.now();
    const elapsed = now - lastApiCall;
    if (elapsed < MIN_INTERVAL_MS) await sleep(MIN_INTERVAL_MS - elapsed);
    lastApiCall = Date.now();

    try {
      console.log(`[OpenAI] Tentativa ${attempt} usando modelo gpt-3.5-turbo`);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Você é um assistente especialista em seguros de saúde da ELRAY Seguros. Responda estritamente em JSON conforme instruções.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        // 429 Too Many Requests or 503 Service Unavailable are temporary
        if (response.status === 429 || response.status === 503) {
          console.warn(`[OpenAI] Erro temporário ${response.status}: ${errText}`);
          if (attempt < maxAttempts) {
            await sleep(2000);
            continue;
          }
        }
        throw new Error(`OpenAI request failed: ${response.status} ${errText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      console.log('[OpenAI] Resposta recebida com sucesso');
      return content;
    } catch (e) {
      console.warn(`[OpenAI] Falha na tentativa ${attempt}: ${e.message}`);
      if (attempt < maxAttempts) {
        await sleep(2000);
        continue;
      }
      throw e;
    }
  }
  // Should never reach here
  throw new Error('Exhausted OpenAI retries');
}

/**
 * Unified AI response function.
 * Tries OpenAI first, falls back to Gemini (generateWithFallback) if OpenAI fails.
 */
async function getAIResponse(prompt) {
  try {
    const openAiResult = await callOpenAI(prompt);
    return { text: openAiResult, modelUsed: 'openai-gpt-3.5-turbo' };
  } catch (openErr) {
    console.warn('[Fallback] OpenAI falhou, tentando Gemini fallback:', openErr.message);
    // Gemini fallback – generateWithFallback already implements its own retry/fallback chain
    const { result, modelUsed } = await generateWithFallback(prompt);
    const text = result.response.text();
    return { text, modelUsed: `gemini-${modelUsed}` };
  }
}

async function cotarNotreDame(estado, cidadeCliente, idadeCliente) {
    // Inicializa a interface para ler o input do usuário via terminal


    try {
        console.log('=== Cotação Automática - Notre Dame Intermédica ===\n');

        // Pede os dados ao usuário

        // Constrói o caminho para o arquivo:
        const projectRoot = path.join(__dirname, '..', '..');
        const notreDameRoot = path.join(projectRoot, 'notre dame');

        const matchedEstado = findMatchingFolder(notreDameRoot, estado, true);
        if (!matchedEstado) {
            return { sucesso: false, erro: `Estado não encontrado para: '${estado}'` };
        }

        const estadoPath = path.join(notreDameRoot, matchedEstado);

        // Lê todas as pastas de região dentro do estado
        const regioes = fs.readdirSync(estadoPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        if (regioes.length === 0) {
            console.log(`\nNenhuma pasta de região encontrada dentro do estado ${matchedEstado}.`);
            return;
        }

        console.log(`\n[1/3] Iniciando busca pela cidade '${cidadeCliente}' nas ${regioes.length} regiões de ${matchedEstado}...`);

        let planosEncontrados = [];

        for (const regiao of regioes) {
            const pdfPath = path.join(estadoPath, regiao, 'tabela.pdf');

            if (!fs.existsSync(pdfPath)) {
                console.log(`- Pulando região '${regiao}' (tabela.pdf não encontrado)`);
                continue;
            }

            console.log(`\n[2/3] Analisando região: ${regiao}...`);
            const pdfText = await extractTextFromPDF(pdfPath);

            const prompt = `
            Você é um assistente especialista em seguros de saúde da ELRAY Seguros.
            Abaixo está o texto extraído de uma tabela de preços em PDF da Notre Dame Intermédica para a região de ${regiao} - ${estado}.
            
            PASSO 1: O texto do PDF foi processado e contém marcadores de página no formato [--- PÁGINA X ---]. Procure em todo o documento pelas seções de "Área de Comercialização", "Municípios de Abrangência" ou "Área de Abrangência" e valide se a cidade específica '${cidadeCliente}' está listada lá, ou se o plano abrange explicitamente todo o estado de ${estado}. Considere também válida a cobertura se o nome da cidade aparecer em destaque no título ou na capa do documento.
            ATENÇÃO: Olhe com muita atenção as páginas 7, 8 e 9, onde costumam estar as tabelas de cidades. Além disso, se a cidade solicitada for 'Salvador', procure também por termos como 'Capital' ou 'cidades do Grupo 1' no PDF para confirmar a cobertura.
            PASSO 2: O cliente forneceu a(s) seguinte(s) idade(s): ${idadeCliente}. Se a cidade ESTIVER listada (ou coberta pelo estado):
               - Descubra em qual faixa etária CADA idade se enquadra.
               - Encontre o preço individual para cada idade.
               - SOME todos os valores encontrados.
               - Extraia o nome dos planos disponíveis e retorne APENAS o preço total somado no campo 'preco_total'.
               - REGRA ESPECIAL: Se a cidade for 'Salvador', extraia OBRIGATORIAMENTE os valores da tabela de preços classificada como 'DCP' ou 'Coparticipativo'.
            PASSO 3: Se a cidade NÃO ESTIVER listada, NÃO extraia os preços. Retorne apenas uma mensagem informando que a cidade não tem cobertura neste PDF.
            
            Responda estritamente em formato JSON. Retorne APENAS um array JSON válido contendo **todos** os planos disponíveis para a cidade, incluindo todas as faixas de preço e modalidades.
            
            Exemplo se a cidade FOR atendida:
            [
                {
                    "cidade_coberta": true,
                    "plano": "Nome do Plano 1 (ex: Smart 200)",
                    "idades_processadas": "${idadeCliente}",
                    "preco_total": 450.00
                }
            ]
            
            Exemplo se a cidade NÃO FOR atendida:
            [
                {
                    "cidade_coberta": false,
                    "mensagem": "A cidade ${cidadeCliente} não está listada na área de comercialização desta tabela da região ${regiao}."
                }
            ]
            
            REGRAS DE FORMATAÇÃO DO NOME DO PLANO:
            1. Adicione SEMPRE a acomodação (Enfermaria ou Apartamento). ATENÇÃO: Todos os planos chamados "Nosso Plano" são OBRIGATORIAMENTE "Enfermaria". O PDF pode estar errado e dizer "Apartamento", mas você deve corrigir e extrair sempre como "Enfermaria" para qualquer "Nosso Plano".
            2. Adicione SEMPRE o tipo de coparticipação (ex: "Coparticipação Total" ou "Coparticipação Parcial").
            3. NÃO inclua termos como "com Odonto", "Incluso Odonto" ou "+ Odonto" no nome do plano.
            4. IGNORE COMPLETAMENTE e NUNCA extraia planos do tipo "Ambulatorial", "Ambulatorial + Odonto", exclusivamente ambulatoriais, ou planos da linha "Advance" que possuam "Reembolso Parcial". Traga apenas planos com cobertura hospitalar/completa e sem reembolso parcial.
            
            Texto da tabela:
            ${pdfText}
            `;

            try {
                const aiResponse = await getAIResponse(prompt);
                console.log(`Usando modelo/API: ${aiResponse.modelUsed}`);
                let responseText = aiResponse.text;
                // Limpeza de markdown caso o modelo tenha devolvido blocos de código
                responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
                const jsonArray = JSON.parse(responseText);

                // Verifica se a IA confirmou que a cidade está coberta
                if (jsonArray.length > 0 && jsonArray[0].cidade_coberta === true) {
                    console.log(`\n[BINGO!] Cidade encontrada na região/tabela: ${regiao}`);

                    // Injeta a região nos objetos JSON para o cliente saber de onde veio
                    const planosDaRegiao = jsonArray.map(plano => ({
                        ...plano,
                        regiao_tabela: regiao
                    }));

                    planosEncontrados.push(...planosDaRegiao);
                    // IMPORTANTE: Não damos 'break' aqui! Queremos continuar iterando nas outras pastas (ex: ler Regional e depois ler Todo RJ)
                } else {
                    console.log(`  -> Cidade não coberta nesta tabela.`);
                }
            } catch (e) {
                console.log(`  -> Erro na comunicação com a IA para esta região: ${e.message}`);
            }
        }

        if (planosEncontrados.length > 0) {
            // Remove duplicatas (mesmo plano e mesmo preço) que podem ter vindo de tabelas regionais diferentes
            const planosUnicos = planosEncontrados.reduce((acc, current) => {
                const isDuplicate = acc.find(item =>
                    item.plano === current.plano &&
                    item.preco_total === current.preco_total
                );
                if (!isDuplicate) {
                    acc.push(current);
                } else {
                    // Mescla o nome da região para não esconder de onde veio
                    if (!isDuplicate.regiao_tabela.includes(current.regiao_tabela)) {
                        isDuplicate.regiao_tabela += ` / ${current.regiao_tabela}`;
                    }
                }
                return acc;
            }, []);

            // Resolvendo UF para buscar o book
            let estadoUF = null;
            const ufStr = normalizeString(estado);
            const aliasStr = stateAliases[ufStr] || ufStr;
            if (stateMap[aliasStr]) {
                estadoUF = stateMap[aliasStr].toUpperCase();
            } else if (reverseStateMap[aliasStr]) {
                estadoUF = aliasStr.toUpperCase();
            } else if (matchedEstado) {
                const matchStr = normalizeString(matchedEstado);
                if (stateMap[matchStr]) estadoUF = stateMap[matchStr].toUpperCase();
                else if (reverseStateMap[matchStr]) estadoUF = matchStr.toUpperCase();
            }

            const caminhoBook = buscarBookEstado(estadoUF);

            return { sucesso: true, dados: { planos: planosUnicos, book_pdf: caminhoBook } };
        } else {
            return { sucesso: false, erro: `A cidade '${cidadeCliente}' não foi encontrada na abrangência de nenhum PDF do estado de ${matchedEstado}.` };
        }

    } catch (error) {
        return { sucesso: false, erro: error.message };
    }
}

// Executa a função principal
module.exports = { cotarNotreDame };
