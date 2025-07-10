<<<<<<< HEAD
// Arquivo: netlify/functions/groq.js - VERSÃO DE DEBUGGING

exports.handler = async function(event, context) {
    console.log("--- INÍCIO DA EXECUÇÃO DA FUNÇÃO GROQ ---");

    if (event.httpMethod !== 'POST') {
        console.error("ERRO: Método HTTP não é POST. Recebido:", event.httpMethod);
=======
// VERSÃO 2 SEGURA do groq.js

// Pega as chaves da variável de ambiente do Netlify e as divide em um array
const apiKeys = (process.env.GROQ_API_KEYS || '').split(',').filter(Boolean);
let keyIndex = 0;

// Função para fazer o rodízio de chaves
function getNextApiKey() {
  if (apiKeys.length === 0) return null;
  const key = apiKeys[keyIndex];
  keyIndex = (keyIndex + 1) % apiKeys.length; // Avança para a próxima chave
  return key;
}

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
>>>>>>> a15c69ad49be1cf4ec572c5bb85e7dc39da27bc5
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
<<<<<<< HEAD
        // 1. Logar a variável de ambiente BRUTA
        const rawApiKeys = process.env.GROQ_API_KEYS;
        console.log("Variável de ambiente GROQ_API_KEYS (bruta):", rawApiKeys);

        if (!rawApiKeys) {
            console.error("ERRO CRÍTICO: Variável de ambiente GROQ_API_KEYS não encontrada ou vazia.");
            return { statusCode: 500, body: 'ERRO: Nenhuma chave de API configurada no servidor.' };
        }
        
        const apiKeys = rawApiKeys.split(',').filter(Boolean);
        console.log(`Encontradas ${apiKeys.length} chaves de API.`);

        if (apiKeys.length === 0) {
             console.error("ERRO CRÍTICO: Array de chaves de API está vazio após split/filter.");
             return { statusCode: 500, body: 'ERRO: Nenhuma chave de API válida encontrada no servidor.' };
        }

        // Vamos usar uma chave aleatória para distribuir melhor
        const randomKeyIndex = Math.floor(Math.random() * apiKeys.length);
        const groqApiKey = apiKeys[randomKeyIndex];
        console.log(`Usando a chave de API de índice: ${randomKeyIndex}`);

        // 2. Logar o corpo da requisição recebida
        const { prompt, maxTokens } = JSON.parse(event.body);
        console.log("Prompt recebido:", prompt ? "Sim" : "Não");
        console.log("maxTokens recebido:", maxTokens);

        if (!prompt) {
            console.error("ERRO: Prompt não foi recebido no corpo da requisição.");
            return { statusCode: 400, body: 'Missing prompt' };
        }

        console.log("Iniciando chamada fetch para a API da Groq...");
=======
        // Pega a próxima chave da nossa lista segura
        const groqApiKey = getNextApiKey();
        if (!groqApiKey) {
            return { statusCode: 500, body: 'Nenhuma chave de API configurada no servidor.' };
        }

        // Pega o prompt e maxTokens do corpo da requisição
        const { prompt, maxTokens } = JSON.parse(event.body);

        if (!prompt) {
            return { statusCode: 400, body: 'Missing prompt' };
        }
        
>>>>>>> a15c69ad49be1cf4ec572c5bb85e7dc39da27bc5
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama3-70b-8192',
                temperature: 0.7,
<<<<<<< HEAD
                max_tokens: maxTokens || 1024, // Adiciona um valor padrão
=======
                max_tokens: maxTokens,
>>>>>>> a15c69ad49be1cf4ec572c5bb85e7dc39da27bc5
                top_p: 1,
                stream: false
            })
        });
<<<<<<< HEAD
        console.log("Chamada fetch concluída. Status da resposta:", response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('ERRO DA API GROQ:', errorData);
=======

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Groq API Error:', errorData);
>>>>>>> a15c69ad49be1cf4ec572c5bb85e7dc39da27bc5
            return { statusCode: response.status, body: JSON.stringify(errorData) };
        }

        const data = await response.json();
<<<<<<< HEAD
        console.log("Sucesso! Retornando dados da Groq.");
        console.log("--- FIM DA EXECUÇÃO DA FUNÇÃO ---");
=======
>>>>>>> a15c69ad49be1cf4ec572c5bb85e7dc39da27bc5
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
<<<<<<< HEAD
        console.error('ERRO INESPERADO NO BLOCO CATCH:', error);
        console.log("--- FIM DA EXECUÇÃO COM ERRO ---");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erro interno inesperado no servidor proxy.' })
=======
        console.error('Proxy Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
>>>>>>> a15c69ad49be1cf4ec572c5bb85e7dc39da27bc5
        };
    }
};