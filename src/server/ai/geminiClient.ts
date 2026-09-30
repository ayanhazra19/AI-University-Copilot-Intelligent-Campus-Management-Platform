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

const DEFAULT_TEXT_MODELS = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

/**
 * Robust text generation using Gemini with multi-model failover and graceful offline return on network failure.
 */
export async function generateText(options: GenerateTextOptions): Promise<string | null> {
  const ai = getClient();
  if (!ai) return null;

  const candidateModels = options.model ? [options.model] : DEFAULT_TEXT_MODELS;

  for (const model of candidateModels) {
    try {
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

      if (response.text) return response.text;
    } catch (error) {
      console.warn(`[Gemini Client] Model ${model} generation failed, attempting next:`, (error as any)?.message || error);
    }
  }

  return null;
}

/**
 * Structured JSON generation from Gemini with schema / parsing safety and model failover.
 */
export async function generateJSON<T = any>(options: {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  model?: string;
}): Promise<T | null> {
  const ai = getClient();
  if (!ai) return null;

  const candidateModels = options.model ? [options.model] : DEFAULT_TEXT_MODELS;

  for (const model of candidateModels) {
    try {
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
      if (text) {
        return JSON.parse(text) as T;
      }
    } catch (error) {
      console.warn(`[Gemini Client] Model ${model} JSON generation failed, attempting next:`, (error as any)?.message || error);
    }
  }

  return null;
}

/**
 * Generate vector embeddings with gemini-embedding-2.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const ai = getClient();
  if (!ai) return null;

  try {
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: text,
    });

    const values = response.embeddings?.[0]?.values || (response as any).embedding?.values;
    if (values && Array.isArray(values)) {
      return values;
    }
    return null;
  } catch (error) {
    console.warn('[Gemini Client] Embedding generation failed, falling back to local vectorizer:', (error as any)?.message || error);
    return null;
  }
}
