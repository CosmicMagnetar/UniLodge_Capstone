import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenRouterService } from './services/index.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { getSystemPrompt } from './prompts/systemPrompts.js';
import { usageTracker, getUsageStats, checkDailyLimit } from './middleware/usageTracker.js';
import { RAGPipeline } from './services/ragPipeline.js';
import { createVectorStore, IVectorStore } from './services/vectorStore.js';

dotenv.config({ path: `${import.meta.dirname}/../.env` });

const app = express();
const PORT = process.env.AI_ENGINE_PORT || 3002;

app.use(cors());
app.use(express.json());

// ── Initialize AI service + RAG pipeline ───────────────────────────────────
const aiService = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  model: process.env.OPENROUTER_MODEL || 'google/gemma-4-31b-it:free',
  temperature: 0.7,
});

const vectorStore: IVectorStore = createVectorStore();
const ragEnabled = process.env.RAG_ENABLED !== 'false';
const ragPipeline = new RAGPipeline(vectorStore, aiService, {
  topK: parseInt(process.env.RAG_TOP_K || '20', 10),
  contextWindow: 80000, // Use the model's actual context budget
  includeScores: true,
});

// Seed the vector store with basic knowledge on startup
async function seedVectorStore() {
  const docs = [
    { id: 'policy-checkin', text: 'Check-in time is 2:00 PM. Early check-in may be available upon request. Guests must present valid ID at check-in.' },
    { id: 'policy-checkout', text: 'Check-out time is 11:00 AM. Late check-out is available until 2:00 PM for an additional charge.' },
    { id: 'policy-cancellation', text: 'Free cancellation up to 24 hours before check-in. Cancellations made within 24 hours are charged one night\'s stay.' },
    { id: 'policy-payment', text: 'We accept credit cards, debit cards, UPI, and bank transfers. Payment is required before check-in.' },
    { id: 'facility-wifi', text: 'Complimentary high-speed Wi-Fi is available in all rooms and common areas. Connect using your booking confirmation code.' },
    { id: 'facility-mess', text: 'The campus mess hall serves breakfast (7-9 AM), lunch (12-2 PM), and dinner (7-9 PM). Digital mess cards are available through UniLodge.' },
    { id: 'facility-laundry', text: 'Self-service laundry facilities are available on each floor. Coin-operated washers and dryers are open 24/7.' },
    { id: 'room-single', text: 'Single rooms accommodate 1 guest with a single bed, desk, chair, and private or shared bathroom. Prices start from $50/night.' },
    { id: 'room-double', text: 'Double rooms accommodate 2 guests with twin or double beds, desk, TV, and private bathroom. Prices start from $80/night.' },
    { id: 'room-suite', text: 'Suites accommodate up to 3 guests with a separate living area, kitchenette, balcony, and premium amenities. Prices start from $120/night.' },
    { id: 'security-gate', text: 'Gate access requires a valid digital pass from your booking confirmation. 24/7 security personnel are stationed at all entry points.' },
  ];

  for (const doc of docs) {
    await vectorStore.upsertDocument(doc.id, doc.text, { type: 'policy' });
  }
  console.log(`📚 Seeded vector store with ${docs.length} knowledge documents`);
}

seedVectorStore().catch(err => console.warn('Vector store seeding failed:', err));

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-engine',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.OPENROUTER_API_KEY,
    ragEnabled,
    vectorStoreSize: (vectorStore as any).size ?? 'unknown',
  });
});

// ── Chat endpoint ──────────────────────────────────────────────────────────
app.post('/api/chat', rateLimiter, checkDailyLimit, usageTracker, async (req, res): Promise<void> => {
  try {
    const { message, userId, role } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    console.log('Received chat request:', { message: message.substring(0, 100), userId, role });

    if (!process.env.OPENROUTER_API_KEY) {
      // Mock response when no API key
      res.json({
        response: `[Mock AI] I received your message: "${message}". Configure OPENROUTER_API_KEY for real responses.`,
        model: 'mock',
        userId,
      });
      return;
    }

    let response: string;

    if (ragEnabled) {
      // Use RAG pipeline for context-augmented responses
      const ragResult = await ragPipeline.query(message, role || 'GUEST');
      response = ragResult.response;
    } else {
      // Direct LLM call without RAG
      const systemPrompt = getSystemPrompt(role || 'GUEST');
      const fullPrompt = `${systemPrompt}\n\nUser (${role || 'GUEST'}): ${message}`;
      response = await aiService.generateText(fullPrompt);
    }

    res.json({
      response,
      model: process.env.OPENROUTER_MODEL || 'google/gemma-4-31b-it:free',
      userId,
    });
  } catch (error) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'AI service error', details: message });
  }
});

// ── Usage stats endpoint ───────────────────────────────────────────────────
app.get('/api/usage/:userId', (req, res) => {
  const stats = getUsageStats(req.params.userId);
  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`🤖 AI Engine running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chat endpoint: POST http://localhost:${PORT}/api/chat`);
  console.log(`🧠 RAG pipeline: ${ragEnabled ? 'ENABLED' : 'DISABLED'}`);
});

export { app };
