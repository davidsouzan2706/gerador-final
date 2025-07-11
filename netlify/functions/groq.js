// Arquivo: netlify/functions/groq.js - VERSÃO 4: SEM DEPENDÊNCIAS

// A chave da API é lida de forma segura das variáveis de ambiente.
const apiKeys = (process.env.GROQ_API_KEYS || '').split(',').filter(Boolean);

// Define a função handler no formato moderno.
exports.handler = async (event) => {
    // Permite apenas requisições do tipo POST.
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        if (!apiKeys || apiKeys.length === 0) {
            throw new Error("Nenhuma chave de API da Groq foi configurada no ambiente do servidor.");
        }

        // Escolhe uma chave de API aleatoriamente da lista.
        const randomIndex = Math.floor(Math.random() * apiKeys.length);
        const groqApiKey = apiKeys[randomIndex];

        const { prompt, maxTokens } = JSON.parse(event.body);

        if (!prompt) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing prompt' }) };
        }

        // Usa o 'fetch' global, que já existe no ambiente Netlify.
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
        
        const data = await response.json();

        if (!response.ok) {
            console.error("Groq API Error:", data);
            throw new Error(data.error?.message || 'Falha na API da Groq.');
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error("Groq Function Error:", error.toString());
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};