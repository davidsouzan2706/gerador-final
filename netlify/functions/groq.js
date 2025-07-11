// Arquivo: netlify/functions/groq.js - VERSÃO 3 COM RODÍZIO ALEATÓRIO

// Este pacote é necessário para fazer chamadas HTTP.
const fetch = require('node-fetch');

// Pega as chaves da variável de ambiente e as transforma em um array limpo.
const apiKeys = (process.env.GROQ_API_KEYS || '').split(',').filter(Boolean);

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // --- INÍCIO DA LÓGICA DE RODÍZIO ALEATÓRIO ---
        if (apiKeys.length === 0) {
            console.error("Nenhuma chave de API da Groq foi configurada no ambiente.");
            return { statusCode: 500, body: 'Erro de configuração do servidor: Chaves de API não encontradas.' };
        }

        // Escolhe uma chave de API aleatoriamente da lista.
        const randomIndex = Math.floor(Math.random() * apiKeys.length);
        const groqApiKey = apiKeys[randomIndex];
        // --- FIM DA LÓGICA DE RODÍZIO ALEATÓRIO ---

        const { prompt, maxTokens } = JSON.parse(event.body);

        if (!prompt) {
            return { statusCode: 400, body: 'Missing prompt' };
        }

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
                max_tokens: maxTokens || 1024,
                top_p: 1,
                stream: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Groq API Error:', errorData);
            return { statusCode: response.status, body: JSON.stringify(errorData) };
        }

        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('Proxy Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};