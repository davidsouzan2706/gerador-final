// Arquivo: netlify/functions/gemini-tts.js - VERSÃO 3, SIMPLIFICADA E CORRIGIDA

// A chave da API é lida de forma segura das variáveis de ambiente.
const GOOGLE_API_KEY = process.env.GEMINI_API_KEY;

// Endpoint da API de Text-to-Speech do Google Cloud.
const TTS_API_ENDPOINT = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`;

// Define a função handler no formato moderno.
exports.handler = async (event, context) => {
    // Permite apenas requisições do tipo POST.
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { textToSpeak, voiceName, audioTemp } = JSON.parse(event.body);

        if (!textToSpeak) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing textToSpeak' }) };
        }

        const requestBody = {
            input: {
                text: textToSpeak
            },
            voice: {
                languageCode: voiceName.substring(0, 5),
                name: voiceName || 'pt-BR-Wavenet-B'
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 1.0 + ((parseFloat(audioTemp) - 0.7) * 0.1),
                pitch: 0.0
            }
        };

        // O 'fetch' já está disponível globalmente no ambiente Netlify, não precisa de 'require'.
        const response = await fetch(TTS_API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();

        if (!response.ok) {
            console.error("Google TTS API Error:", data);
            throw new Error(data.error?.message || 'Falha na API do Google TTS.');
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audioBase64: data.audioContent }),
        };

    } catch (error) {
        console.error("TTS Function Error:", error.toString());
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};