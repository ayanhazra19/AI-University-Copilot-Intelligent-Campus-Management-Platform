import { generateEmbedding } from './geminiClient';

/**
 * Computes cosine similarity between two numerical vectors.
 * Returns value between -1.0 and 1.0 (typically 0.0 to 1.0 for normalized text embeddings).
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;

  // Handle dimensional mismatch gracefully (e.g. if one was generated with local fallback)
  const len = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function fnv1a(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Deterministic local vectorizer used when GEMINI_API_KEY is omitted or offline.
 * Produces a normalized 256-dimensional frequency and n-gram hash vector with strong text separation.
 */
export function generateLocalFallbackEmbedding(text: string, dimensions: number = 256): number[] {
  const vector = new Array(dimensions).fill(0);
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (words.length === 0) return vector;

  for (const word of words) {
    const h1 = fnv1a(word) % dimensions;
    const h2 = (fnv1a(word + '_alt') ^ (h1 << 5)) % dimensions;
    vector[Math.abs(h1)] += 1.5;
    vector[Math.abs(h2)] += 0.8;

    // Character 3-grams for sub-word matching
    for (let i = 0; i < word.length - 2; i++) {
      const gram = word.substring(i, i + 3);
      const hg = fnv1a(gram) % dimensions;
      vector[Math.abs(hg)] += 0.35;
    }
  }

  // L2 Normalize
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

/**
 * Creates an embedding using Gemini text-embedding-004 if available,
 * otherwise transparently falls back to local deterministic embedding.
 */
export async function createEmbedding(text: string): Promise<number[]> {
  const cleanText = text.trim();
  if (!cleanText) return generateLocalFallbackEmbedding('empty');

  const geminiVec = await generateEmbedding(cleanText);
  if (geminiVec && geminiVec.length > 0) {
    return geminiVec;
  }

  return generateLocalFallbackEmbedding(cleanText);
}

export function serializeEmbedding(vec: number[]): string {
  return JSON.stringify(vec);
}

export function deserializeEmbedding(json: string | null | undefined): number[] | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
