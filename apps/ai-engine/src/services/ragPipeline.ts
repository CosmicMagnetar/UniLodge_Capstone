/**
 * RAG Pipeline — Retrieval-Augmented Generation
 *
 * Flow: User Query → Vector Search → Context Augmentation → LLM → Response
 */

import { IVectorStore, VectorQueryResult } from './vectorStore.js';
import { OpenRouterService } from './index.js';
import { getSystemPrompt } from '../prompts/systemPrompts.js';

export interface RAGConfig {
  topK: number;
  contextWindow: number; // max characters for retrieved context
  includeScores: boolean;
}

const DEFAULT_CONFIG: RAGConfig = {
  topK: 20,
  contextWindow: 80000,
  includeScores: true,
};

export class RAGPipeline {
  private vectorStore: IVectorStore;
  private aiService: OpenRouterService;
  private config: RAGConfig;

  constructor(
    vectorStore: IVectorStore,
    aiService: OpenRouterService,
    config?: Partial<RAGConfig>
  ) {
    this.vectorStore = vectorStore;
    this.aiService = aiService;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute the full RAG pipeline:
   * 1. Query vector store for relevant documents
   * 2. Build augmented prompt with context
   * 3. Send to LLM
   * 4. Return response
   */
  async query(
    userQuery: string,
    role: string = 'GUEST'
  ): Promise<{ response: string; sources: VectorQueryResult[] }> {
    // Step 1: Retrieve relevant context
    let sources: VectorQueryResult[] = [];
    let contextBlock = '';

    try {
      sources = await this.vectorStore.query(userQuery, this.config.topK);

      if (sources.length > 0) {
        // Build context from retrieved documents, respecting token window
        let totalLength = 0;
        const contextParts: string[] = [];

        for (const source of sources) {
          if (totalLength + source.text.length > this.config.contextWindow) break;
          contextParts.push(`- ${source.text}`);
          totalLength += source.text.length;
        }

        contextBlock = `\n\nRelevant context from our knowledge base:\n${contextParts.join('\n')}\n`;
      }
    } catch (err) {
      console.warn('Vector store query failed, falling back to non-RAG response:', err);
    }

    // Step 2: Build augmented prompt
    const systemPrompt = getSystemPrompt(role);
    const fullPrompt = [
      systemPrompt,
      contextBlock,
      `\nUser (${role}): ${userQuery}`,
      '\nProvide a helpful, accurate response based on the context above when available.',
    ].join('\n');

    // Step 3: Send to LLM
    const response = await this.aiService.generateText(fullPrompt);

    return { response, sources };
  }

  /**
   * Simple non-RAG fallback for when vector store is unavailable.
   */
  async directQuery(userQuery: string, role: string = 'GUEST'): Promise<string> {
    const systemPrompt = getSystemPrompt(role);
    return this.aiService.generateText(`${systemPrompt}\n\nUser: ${userQuery}`);
  }
}
