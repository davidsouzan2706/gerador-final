// Arquivo: netlify/functions/gemini-tts.js

// Este código usa o pacote 'node-fetch' para fazer a chamada à API.
// O Netlify o instala automaticamente durante o deploy.
const fetch = require('node-fetch');

// A chave da API é lida de forma segura das variáveis de ambiente do Netlify.
const GOOGLE_API_KEY = process.env.GEMINI_API_KEY;

// Endpoint da API de Text-to-Speech do Google Cloud.
const TTS_API_ENDPOINT = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`;

exports.handler = async function(event) {
    // Permite apenas requisições do tipo POST.
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { textToSpeak } = JSON.parse(event.body);

        // Validação para garantir que o texto foi enviado.
        if (!textToSpeak) {
            return { statusCode: 400, body: 'Missing "textToSpeak" parameter' };
        }

        // Monta o corpo da requisição para a API do Google.
        const requestBody = {
            input: {
                text: textToSpeak
            },
            voice: {
                languageCode: 'pt-BR', // Define o idioma para português do Brasil.
                name: 'pt-BR-Wavenet-B' // Escolhe uma voz WaveNet feminina de alta qualidade.
            },
            audioConfig: {
                audioEncoding: 'MP3' // Pede o áudio em formato MP3.
            }
        };

        // Faz a chamada para a API do Google.
        const response = await fetch(TTS_API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        // Trata erros da API.
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Google TTS API Error:", errorData);
            throw new Error(`API Error: ${errorData.error.message}`);
        }

        const data = await response.json();

        // A API retorna o áudio como uma string Base64 na chave 'audioContent'.
        // Nós a enviamos de volta para o nosso site dentro de um objeto JSON.
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audioBase64: data.audioContent }),
        };

    } catch (error) {
        console.error("TTS Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Internal Server Error' })
        };
    }
};