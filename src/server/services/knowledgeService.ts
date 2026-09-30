import { prisma } from '@/lib/prisma';
import { retrieveChunks } from '../ai/retrieval';
import { createEmbedding, serializeEmbedding } from '../ai/embeddings';
import { generateText, isGeminiAvailable } from '../ai/geminiClient';
import { buildRagPrompt, RAG_GROUNDING_SYSTEM_INSTRUCTION } from '../ai/prompts';
import { recordAuditLog } from './auditService';

export interface RAGSourceCitation {
  documentId: string;
  documentTitle: string;
  fileName: string;
  pageNumber: number;
  relevanceScore: number;
  excerpt: string;
}

export interface RAGResponse {
  answer: string;
  sources: RAGSourceCitation[];
  foundInKnowledgeBase: boolean;
  queryCategory: string;
}

export async function searchKnowledgeBase(query: string, maxResults: number = 3): Promise<RAGResponse> {
  const retrieval = await retrieveChunks(query, maxResults);

  if (!retrieval.foundInKnowledgeBase || retrieval.chunks.length === 0) {
    return {
      answer: "I couldn't find this specific information in the available university documents. Please refer directly to the University Administration or consult the Department Academic Coordinator.",
      sources: [],
      foundInKnowledgeBase: false,
      queryCategory: 'University Knowledge Base',
    };
  }

  const sources: RAGSourceCitation[] = retrieval.chunks.map((c) => ({
    documentId: c.documentId,
    documentTitle: c.documentTitle,
    fileName: c.fileName,
    pageNumber: c.pageNumber,
    relevanceScore: c.relevanceScore,
    excerpt: c.content.length > 200 ? c.content.substring(0, 197) + '...' : c.content,
  }));

  // Grounded Answer Generation
  let answer: string | null = null;

  if (isGeminiAvailable()) {
    const prompt = buildRagPrompt(
      query,
      retrieval.chunks.map((c) => ({
        title: c.documentTitle,
        pageNumber: c.pageNumber,
        content: c.content,
      }))
    );

    answer = await generateText({
      prompt,
      systemInstruction: RAG_GROUNDING_SYSTEM_INSTRUCTION,
      temperature: 0.1,
    });
  }

  // Graceful offline fallback if Gemini was unavailable or returned empty
  if (!answer) {
    const topChunk = retrieval.chunks[0];
    answer = `Based on **${topChunk.documentTitle}** [p. ${topChunk.pageNumber}]:\n\n${topChunk.content}`;
    if (retrieval.chunks.length > 1) {
      answer += `\n\nAdditional official provision from **${retrieval.chunks[1].documentTitle}** [p. ${retrieval.chunks[1].pageNumber}]:\n\n${retrieval.chunks[1].content}`;
    }
  }

  return {
    answer,
    sources,
    foundInKnowledgeBase: true,
    queryCategory: 'University Knowledge Base (RAG)',
  };
}

export async function listKnowledgeDocuments() {
  return prisma.knowledgeDocument.findMany({
    include: {
      chunks: {
        select: {
          id: true,
          chunkIndex: true,
          pageNumber: true,
          keywords: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

function extractKeywordsFromText(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3)
    )
  );
}

export async function uploadAndIndexDocument(
  input: {
    title: string;
    fileName?: string;
    fileType?: string;
    department?: string;
    category?: string;
    content: string;
  },
  user: { id: string; name: string; role: string }
) {
  const paragraphs = input.content.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const chunkList = paragraphs.length > 0 ? paragraphs : [input.content];

  // Generate embeddings for all chunks
  const chunkData = await Promise.all(
    chunkList.map(async (chunkText, index) => {
      const embedding = await createEmbedding(chunkText);
      const keywords = extractKeywordsFromText(chunkText).slice(0, 8).join(', ');

      return {
        chunkIndex: index,
        pageNumber: Math.floor(index / 2) + 1,
        keywords,
        content: chunkText,
        embeddingJson: serializeEmbedding(embedding),
      };
    })
  );

  const doc = await prisma.knowledgeDocument.create({
    data: {
      title: input.title,
      fileName: input.fileName || `${input.title.replace(/\s+/g, '_')}.pdf`,
      fileType: input.fileType || 'PDF',
      department: input.department || 'General Administration',
      category: input.category || 'Academic',
      fileSize: Buffer.byteLength(input.content, 'utf-8'),
      processingStatus: 'PROCESSED',
      chunkCount: chunkData.length,
      summary: `Document indexed with ${chunkData.length} chunks covering ${input.category || 'Academic'}.`,
      chunks: {
        create: chunkData,
      },
    },
    include: {
      chunks: true,
    },
  });

  await recordAuditLog({
    userId: user.id,
    userName: user.name,
    role: user.role,
    action: 'DOCUMENT_UPLOAD',
    entity: 'KnowledgeDocument',
    details: `Uploaded and indexed "${doc.title}" with ${chunkData.length} semantic chunks.`,
  });

  return doc;
}

export async function deleteKnowledgeDocument(id: string, user: { id: string; name: string; role: string }) {
  const doc = await prisma.knowledgeDocument.delete({
    where: { id },
  });

  await recordAuditLog({
    userId: user.id,
    userName: user.name,
    role: user.role,
    action: 'DOCUMENT_DELETE',
    entity: 'KnowledgeDocument',
    details: `Deleted knowledge document "${doc.title}".`,
  });

  return doc;
}
