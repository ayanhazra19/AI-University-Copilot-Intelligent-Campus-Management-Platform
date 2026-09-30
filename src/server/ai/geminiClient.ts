import { GoogleGenAI } from '@google/genai';

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export function isGeminiAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export interface GenerateTextOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  model?: string;
}

/**
 * Robust text generation using Gemini 2.5 Flash with graceful offline return on missing key or network failure.
 */
export async function generateText(options: GenerateTextOptions): Promise<string | null> {
  const ai = getClient();
  if (!ai) return null;

  try {
    const model = options.model || 'gemini-2.5-flash';
    const config: any = {};
    if (options.temperature !== undefined) {
      config.temperature = options.temperature;
    }
    if (options.systemInstruction) {
      config.systemInstruction = options.systemInstruction;
    }

    const response = await ai.models.generateContent({
      model,
      contents: options.prompt,
      config,
    });

    return response.text || null;
  } catch (error) {
    console.warn('[Gemini Client] Text generation failed, falling back gracefully:', (error as any)?.message || error);
    return null;
  }
}

/**
 * Structured JSON generation from Gemini with schema / parsing safety.
 */
export async function generateJSON<T = any>(options: {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  model?: string;
}): Promise<T | null> {
  const ai = getClient();
  if (!ai) return null;

  try {
    const model = options.model || 'gemini-2.5-flash';
    const config: any = {
      responseMimeType: 'application/json',
    };
    if (options.temperature !== undefined) {
      config.temperature = options.temperature;
    }
    if (options.systemInstruction) {
      config.systemInstruction = options.systemInstruction;
    }

    const response = await ai.models.generateContent({
      model,
      contents: options.prompt,
      config,
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch (error) {
    console.warn('[Gemini Client] JSON generation failed, falling back gracefully:', (error as any)?.message || error);
    return null;
  }
}

/**
 * Generate vector embeddings with text-embedding-004.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const ai = getClient();
  if (!ai) return null;

  try {
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: text,
    });

    if (response.embedding?.values) {
      return response.embedding.values;
    }
    return null;
  } catch (error) {
    console.warn('[Gemini Client] Embedding generation failed, falling back to local vectorizer:', (error as any)?.message || error);
    return null;
  }
}
