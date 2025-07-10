// VERSÃO FINAL CORRIGIDA do groq.js

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
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
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
                max_tokens: maxTokens || 1024, // Mantive o fallback para segurança
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