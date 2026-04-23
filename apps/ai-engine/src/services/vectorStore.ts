/**
 * VectorStoreService — Provider-agnostic vector database interface.
 * Default implementation uses Pinecone. Can be swapped for Qdrant, Supabase Vector, etc.
 */

export interface VectorDocument {
  id: string;
  text: string;
  metadata?: Record<string, any>;
  embedding?: number[];
}

export interface VectorQueryResult {
  id: string;
  score: number;
  text: string;
  metadata?: Record<string, any>;
}

export interface IVectorStore {
  upsertDocument(id: string, text: string, metadata?: Record<string, any>): Promise<void>;
  query(text: string, topK?: number): Promise<VectorQueryResult[]>;
  deleteDocument(id: string): Promise<void>;
}

/**
 * Simple embedding function using character frequency as a poor-man's embedding.
 * Replace with OpenRouter/OpenAI embedding API in production.
 */
function simpleEmbed(text: string, dims: number = 384): number[] {
  const embedding = new Array(dims).fill(0);
  const lower = text.toLowerCase();
  for (let i = 0; i < lower.length; i++) {
    embedding[lower.charCodeAt(i) % dims] += 1;
  }
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum: number, v: number) => sum + v * v, 0));
  return magnitude > 0 ? embedding.map((v: number) => v / magnitude) : embedding;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
}

/**
 * In-memory vector store for development.
 * Swap with PineconeVectorStore for production.
 */
export class InMemoryVectorStore implements IVectorStore {
  private documents: Map<string, VectorDocument> = new Map();

  async upsertDocument(id: string, text: string, metadata?: Record<string, any>): Promise<void> {
    this.documents.set(id, {
      id,
      text,
      metadata,
      embedding: simpleEmbed(text),
    });
  }

  async query(text: string, topK: number = 5): Promise<VectorQueryResult[]> {
    const queryEmbedding = simpleEmbed(text);
    const results: VectorQueryResult[] = [];

    for (const doc of this.documents.values()) {
      if (!doc.embedding) continue;
      const score = cosineSimilarity(queryEmbedding, doc.embedding);
      results.push({ id: doc.id, score, text: doc.text, metadata: doc.metadata });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id);
  }

  get size(): number {
    return this.documents.size;
  }
}

/**
 * Pinecone-backed vector store (requires @pinecone-database/pinecone).
 * Install: npm install @pinecone-database/pinecone
 * 
 * To use, set environment variables:
 *   PINECONE_API_KEY, PINECONE_INDEX, PINECONE_ENVIRONMENT
 */
export class PineconeVectorStore implements IVectorStore {
  private client: any;
  private index: any;

  constructor() {
    // Lazy init — only fail if actually used without config
  }

  private async ensureClient() {
    if (this.client) return;

    const apiKey = process.env.PINECONE_API_KEY;
    const indexName = process.env.PINECONE_INDEX;

    if (!apiKey || !indexName) {
      throw new Error(
        'Pinecone not configured. Set PINECONE_API_KEY and PINECONE_INDEX env vars.'
      );
    }

    try {
      // @ts-ignore — optional dependency, only required when Pinecone is configured
      const { Pinecone } = await import('@pinecone-database/pinecone');
      this.client = new Pinecone({ apiKey });
      this.index = this.client.index(indexName);
    } catch (err) {
      throw new Error('Failed to initialize Pinecone. Is @pinecone-database/pinecone installed?');
    }
  }

  async upsertDocument(id: string, text: string, metadata?: Record<string, any>): Promise<void> {
    await this.ensureClient();
    const embedding = simpleEmbed(text, 1536); // Pinecone commonly uses 1536 dims
    await this.index.upsert([{
      id,
      values: embedding,
      metadata: { ...metadata, text },
    }]);
  }

  async query(text: string, topK: number = 5): Promise<VectorQueryResult[]> {
    await this.ensureClient();
    const embedding = simpleEmbed(text, 1536);
    const results = await this.index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
    });

    return (results.matches || []).map((match: any) => ({
      id: match.id,
      score: match.score,
      text: match.metadata?.text || '',
      metadata: match.metadata,
    }));
  }

  async deleteDocument(id: string): Promise<void> {
    await this.ensureClient();
    await this.index.deleteOne(id);
  }
}

/**
 * Factory: create vector store based on environment.
 */
export function createVectorStore(): IVectorStore {
  if (process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX) {
    console.log('📦 Using Pinecone vector store');
    return new PineconeVectorStore();
  }

  console.log('📦 Using in-memory vector store (dev mode)');
  return new InMemoryVectorStore();
}
