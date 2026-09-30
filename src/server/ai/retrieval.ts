import { prisma } from '@/lib/prisma';
import {
  cosineSimilarity,
  createEmbedding,
  deserializeEmbedding,
  generateLocalFallbackEmbedding,
  serializeEmbedding,
} from './embeddings';
import { generateJSON, isGeminiAvailable } from './geminiClient';
import { RERANK_PROMPT } from './prompts';

export interface RetrievedChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  fileName: string;
  pageNumber: number;
  content: string;
  relevanceScore: number;
}

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  foundInKnowledgeBase: boolean;
}

// User Condition 3: Re-ranking is OFF by default to preserve free-tier quota & avoid live demo latency
const ENABLE_LLM_RERANKING = process.env.ENABLE_LLM_RERANKING === 'true';

const STOPWORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'or', 'by',
  'with', 'from', 'as', 'what', 'how', 'when', 'where', 'who', 'why', 'can', 'you', 'please',
  'tell', 'me', 'about', 'this', 'that', 'there', 'their', 'they', 'our', 'university', 'college',
  'more', 'than', 'happens', 'does', 'any', 'are', 'been', 'being', 'have', 'has', 'had', 'will',
  'would', 'should', 'could', 'into', 'under', 'over', 'per', 'also'
]);

function stemWord(word: string): string {
  const w = word.toLowerCase().trim();
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
  if (w.endsWith('es') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0, -1);
  return w;
}

function extractTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function calculateKeywordScore(
  chunk: { content: string; keywords?: string | null; title: string },
  queryTokens: string[],
  cleanQuery: string
): number {
  if (queryTokens.length === 0) return 0;

  const lowerContent = chunk.content.toLowerCase();
  const lowerKeywords = (chunk.keywords || '').toLowerCase();
  const lowerTitle = chunk.title.toLowerCase();
  const stemmedTokens = queryTokens.map(stemWord);

  let rawScore = 0;
  for (let i = 0; i < queryTokens.length; i++) {
    const token = queryTokens[i];
    const stem = stemmedTokens[i];

    // Priority match on curated document keywords
    if (lowerKeywords.includes(token) || lowerKeywords.includes(stem)) {
      rawScore += 5;
    }
    // Match on policy document title
    if (lowerTitle.includes(token) || lowerTitle.includes(stem)) {
      rawScore += 4;
    }
    // Match in chunk body text
    if (lowerContent.includes(token) || lowerContent.includes(stem)) {
      rawScore += 3;
    }
  }

  // Exact phrase boost
  if (cleanQuery.length > 8 && lowerContent.includes(cleanQuery)) {
    rawScore += 12;
  }

  // Normalize to 0.0 - 1.0 based on maximum achievable score for this query
  const maxPossible = Math.max(1, queryTokens.length * 8);
  return Math.min(1, rawScore / maxPossible);
}

/**
 * Hybrid Semantic Vector + Lexical Retrieval over University Document Chunks.
 */
export async function retrieveChunks(query: string, maxResults: number = 3): Promise<RetrievalResult> {
  const queryTokens = extractTokens(query);
  const cleanQuery = query.toLowerCase().trim();

  // 1. Fetch chunks with document metadata
  const chunks = await prisma.documentChunk.findMany({
    include: {
      document: true,
    },
  });

  if (!chunks || chunks.length === 0) {
    return { chunks: [], foundInKnowledgeBase: false };
  }

  // 2. Generate embedding for query
  const queryVector = await createEmbedding(query);

  // 3. Score chunks using Hybrid Similarity: 0.55 Vector Cosine + 0.45 Lexical/Keywords
  const scoredList = await Promise.all(
    chunks.map(async (c) => {
      let chunkVector = deserializeEmbedding(c.embeddingJson);

      // If chunk does not have embedding saved yet, compute & store lazily
      if (!chunkVector || chunkVector.length === 0) {
        chunkVector = await createEmbedding(c.content + ' ' + (c.keywords || '') + ' ' + c.document.title);
        prisma.documentChunk
          .update({
            where: { id: c.id },
            data: { embeddingJson: serializeEmbedding(chunkVector) },
          })
          .catch(() => {});
      }

      const isDenseCloud = queryVector.length > 512;
      const rawCosine = Math.max(0, cosineSimilarity(queryVector, chunkVector));
      // Calibrate dense vector baseline floor (~0.40) so unrelated queries scale to ~0.0
      const effectiveCosine = isDenseCloud
        ? Math.max(0, (rawCosine - 0.40) / 0.60)
        : rawCosine;

      const normalizedKeyword = calculateKeywordScore(
        { content: c.content, keywords: c.keywords, title: c.document.title },
        queryTokens,
        cleanQuery
      );

      // Weighted hybrid relevance (scale 0..100)
      const hybridRaw = 0.50 * effectiveCosine + 0.50 * normalizedKeyword;
      const relevanceScore = Math.min(99, Math.round(hybridRaw * 100));

      return {
        id: c.id,
        documentId: c.document.id,
        documentTitle: c.document.title,
        fileName: c.document.fileName,
        pageNumber: c.pageNumber,
        content: c.content,
        relevanceScore,
        rawCosine,
        effectiveCosine,
        rawKeyword: normalizedKeyword,
      };
    })
  );

  // Filter positive relevance and sort descending
  const isDense = queryVector.length > 512;
  const MIN_RELEVANCE = isDense ? 22 : 18;

  let topCandidates = scoredList
    .filter((c) => c.relevanceScore >= MIN_RELEVANCE || c.rawKeyword >= 0.20)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, Math.max(maxResults, 5));

  if (topCandidates.length === 0) {
    return { chunks: [], foundInKnowledgeBase: false };
  }

  // 4. Optional LLM Re-Ranking (disabled by default per Condition 3)
  if (ENABLE_LLM_RERANKING && isGeminiAvailable() && topCandidates.length > 1) {
    try {
      const prompt = `QUERY: ${query}\n\nCANDIDATES:\n` +
        topCandidates.map((c, i) => `[${i}] Title: ${c.documentTitle} (Page ${c.pageNumber})\nExcerpt: ${c.content.slice(0, 200)}...`).join('\n\n');

      const rerankResult = await generateJSON<{ scores: Array<{ index: number; score: number }> }>({
        prompt: `${RERANK_PROMPT}\n\n${prompt}`,
        temperature: 0.1,
      });

      if (rerankResult?.scores && Array.isArray(rerankResult.scores)) {
        topCandidates = topCandidates.sort((a, b) => {
          const scoreA = rerankResult.scores.find((s) => s.index === topCandidates.indexOf(a))?.score ?? 5;
          const scoreB = rerankResult.scores.find((s) => s.index === topCandidates.indexOf(b))?.score ?? 5;
          return scoreB - scoreA;
        });
      }
    } catch {
      // Gracefully maintain vector ranking if re-rank call fails
    }
  }

  const finalChunks = topCandidates.slice(0, maxResults);
  const top = finalChunks[0];

  // Robust Evidence Gate:
  // Requires either:
  // 1. Keyword grounding (matched terms in keywords/title/content) with positive similarity
  // 2. High calibrated semantic relevance (relevanceScore >= 30 or effectiveCosine >= 0.40)
  const isGrounded =
    finalChunks.length > 0 &&
    Boolean(
      (top.rawKeyword >= 0.18 && top.effectiveCosine >= 0.08) ||
      top.relevanceScore >= 30 ||
      (top.rawKeyword >= 0.10 && top.relevanceScore >= 22)
    );

  if (!isGrounded) {
    return {
      chunks: [],
      foundInKnowledgeBase: false,
    };
  }

  return {
    chunks: finalChunks,
    foundInKnowledgeBase: true,
  };
}
