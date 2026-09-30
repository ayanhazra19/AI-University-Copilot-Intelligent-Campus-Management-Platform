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
  'tell', 'me', 'about', 'this', 'that', 'there', 'their', 'they', 'our', 'university', 'college'
]);

function extractTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function calculateKeywordScore(text: string, queryTokens: string[], cleanQuery: string): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const token of queryTokens) {
    if (lower.includes(token)) score += 2;
  }
  if (lower.includes(cleanQuery)) {
    score += 10;
  }
  return score;
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

  // 3. Score chunks using Hybrid Similarity: 0.70 Vector Cosine + 0.30 Lexical/Keyword
  const scoredList = await Promise.all(
    chunks.map(async (c) => {
      let chunkVector = deserializeEmbedding(c.embeddingJson);

      // If chunk does not have embedding saved yet, compute & store lazily in background
      if (!chunkVector || chunkVector.length === 0) {
        chunkVector = await createEmbedding(c.content + ' ' + (c.keywords || '') + ' ' + c.document.title);
        // Persist back to DB without blocking
        prisma.documentChunk
          .update({
            where: { id: c.id },
            data: { embeddingJson: serializeEmbedding(chunkVector) },
          })
          .catch(() => {});
      }

      const cosineSim = Math.max(0, cosineSimilarity(queryVector, chunkVector));

      const combinedText = `${c.content} ${c.keywords || ''} ${c.document.title}`;
      const keywordRaw = calculateKeywordScore(combinedText, queryTokens, cleanQuery);
      const normalizedKeyword = Math.min(1, keywordRaw / (queryTokens.length * 3 + 1));

      // Weighted hybrid relevance (scale 0..100)
      const hybridRaw = 0.65 * cosineSim + 0.35 * normalizedKeyword;
      const relevanceScore = Math.min(99, Math.round(hybridRaw * 100));

      return {
        id: c.id,
        documentId: c.document.id,
        documentTitle: c.document.title,
        fileName: c.document.fileName,
        pageNumber: c.pageNumber,
        content: c.content,
        relevanceScore,
        rawCosine: cosineSim,
        rawKeyword: normalizedKeyword,
      };
    })
  );

  // Filter positive relevance and sort descending
  let topCandidates = scoredList
    .filter((c) => c.relevanceScore > 20 || c.rawKeyword > 0.2)
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
  const foundInKnowledgeBase = finalChunks.length > 0 && finalChunks[0].relevanceScore >= 35;

  return {
    chunks: finalChunks,
    foundInKnowledgeBase,
  };
}
