/**
 * VectorStoreService — Provider-agnostic vector database interface.
 * Default implementation uses @xenova/transformers for local embeddings.
 * Can be swapped for Qdrant, Supabase Vector, etc.
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

// ── Embedding Engine ───────────────────────────────────────────────────────

/**
 * Lazy-loaded transformer pipeline for local semantic embeddings.
 * Uses all-MiniLM-L6-v2 (384 dims) — runs on CPU, no GPU required.
 * The model downloads once (~23MB) and is cached in ~/.cache/huggingface.
 */
let _pipeline: any = null;
let _pipelineLoading: Promise<any> | null = null;

async function getEmbeddingPipeline(): Promise<any> {
  if (_pipeline) return _pipeline;

  if (!_pipelineLoading) {
    _pipelineLoading = (async () => {
      try {
        // Dynamic import — @xenova/transformers is an optional dependency
        const { pipeline } = await import('@xenova/transformers');
        _pipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
          quantized: true, // Use INT8 quantized model for speed
        });
        console.log('🧠 Loaded local embedding model: all-MiniLM-L6-v2');
        return _pipeline;
      } catch (err) {
        console.warn('⚠️  @xenova/transformers not available, falling back to character-frequency embeddings.');
        console.warn('   Install with: npm install @xenova/transformers');
        _pipeline = null;
        _pipelineLoading = null;
        return null;
      }
    })();
  }

  return _pipelineLoading;
}

/**
 * Generate a semantic embedding using the local transformer model.
 * Falls back to character-frequency if the model is not available.
 */
async function embed(text: string, dims: number = 384): Promise<number[]> {
  const pipe = await getEmbeddingPipeline();

  if (pipe) {
    // Real semantic embedding via all-MiniLM-L6-v2
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    // output.data is a Float32Array; convert to regular array
    return Array.from(output.data as Float32Array);
  }

  // Fallback: improved TF-IDF-style embedding (still not semantic, but
  // better than pure char-frequency). Only used if transformers is missing.
  return fallbackEmbed(text, dims);
}

/**
 * Fallback embedding using word-level frequency hashing.
 * This is NOT semantic — it exists only to keep the system functional
 * when @xenova/transformers is not installed.
 */
function fallbackEmbed(text: string, dims: number = 384): number[] {
  const embedding = new Array(dims).fill(0);
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);

  for (const word of words) {
    // FNV-1a hash for better distribution than charCodeAt
    let hash = 2166136261;
    for (let i = 0; i < word.length; i++) {
      hash ^= word.charCodeAt(i);
      hash = (hash * 16777619) >>> 0;
    }
    embedding[hash % dims] += 1;
  }

  // L2 normalize
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

// ── In-Memory Vector Store ─────────────────────────────────────────────────

/**
 * In-memory vector store for development.
 * Swap with PineconeVectorStore for production.
 */
export class InMemoryVectorStore implements IVectorStore {
  private documents: Map<string, VectorDocument> = new Map();

  async upsertDocument(id: string, text: string, metadata?: Record<string, any>): Promise<void> {
    const embedding = await embed(text);
    this.documents.set(id, { id, text, metadata, embedding });
  }

  async query(text: string, topK: number = 5): Promise<VectorQueryResult[]> {
    const queryEmbedding = await embed(text);
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

// ── Pinecone Vector Store ──────────────────────────────────────────────────

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
    const embedding = await embed(text, 384); // MiniLM uses 384 dims
    await this.index.upsert([{
      id,
      values: embedding,
      metadata: { ...metadata, text },
    }]);
  }

  async query(text: string, topK: number = 5): Promise<VectorQueryResult[]> {
    await this.ensureClient();
    const embedding = await embed(text, 384);
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

// ── Factory ────────────────────────────────────────────────────────────────

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
