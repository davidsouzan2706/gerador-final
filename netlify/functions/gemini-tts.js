// Arquivo: netlify/functions/gemini-tts.js - VERSÃO FINAL E CORRIGIDA

// Este pacote é necessário para fazer chamadas HTTP em ambientes Node.js como o das Funções Netlify.
const fetch = require('node-fetch');

// Lê a sua chave de API de forma segura das variáveis de ambiente do Netlify.
const GOOGLE_API_KEY = process.env.GEMINI_API_KEY;

// Este é o endpoint correto e público da API de Text-to-Speech do Google Cloud.
const TTS_API_ENDPOINT = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`;

exports.handler = async function(event) {
    // Permite apenas requisições do tipo POST, como antes.
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Extrai os dados enviados pelo nosso site.
        const { textToSpeak, voiceName, audioTemp } = JSON.parse(event.body);

        // Validação para garantir que o texto foi enviado.
        if (!textToSpeak) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing "textToSpeak" parameter' }) };
        }

        // --- INÍCIO DA CORREÇÃO PRINCIPAL ---
        // Monta o corpo da requisição SEGUINDO A DOCUMENTAÇÃO OFICIAL da API de TTS.
        const requestBody = {
            input: {
                text: textToSpeak
            },
            voice: {
                languageCode: voiceName.substring(0, 5), // Extrai 'pt-BR' ou 'en-US' do nome da voz
                name: voiceName || 'pt-BR-Wavenet-B'     // Usa a voz escolhida ou um padrão seguro
            },
            audioConfig: {
                audioEncoding: 'MP3', // Pede o áudio em formato MP3.
                speakingRate: 1 + ((audioTemp - 0.7) * 0.1), // Converte 0.5-1.0 para uma taxa de fala sutil
                pitch: 0.0
            }
        };
        // --- FIM DA CORREÇÃO PRINCIPAL ---

        // Faz a chamada para a API do Google.
        const response = await fetch(TTS_API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        // Trata erros que venham da API do Google.
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