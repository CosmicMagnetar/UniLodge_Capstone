import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenRouterService } from './services/index.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { getSystemPrompt } from './prompts/systemPrompts.js';
import { usageTracker, getUsageStats, checkDailyLimit } from './middleware/usageTracker.js';

dotenv.config({ path: `${import.meta.dirname}/../.env` });

const app = express();
const PORT = process.env.AI_ENGINE_PORT || 3002;

app.use(cors());
app.use(express.json());

// Initialize AI service
const aiService = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  model: process.env.OPENROUTER_MODEL || 'google/gemma-4-31b-it:free',
  temperature: 0.7,
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-engine',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.OPENROUTER_API_KEY,
  });
});

// Chat endpoint
app.post('/api/chat', rateLimiter, checkDailyLimit, usageTracker, async (req, res): Promise<void> => {
  try {
    const { message, userId, role } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const systemPrompt = getSystemPrompt(role || 'GUEST');

    const fullPrompt = `${systemPrompt}\n\nUser (${role || 'GUEST'}): ${message}`;

    console.log('Received chat request:', { message, userId, role });
    console.log('OPENROUTER_API_KEY type:', typeof process.env.OPENROUTER_API_KEY);
    console.log('OPENROUTER_API_KEY length:', process.env.OPENROUTER_API_KEY?.length);

    if (!process.env.OPENROUTER_API_KEY) {
      // Mock response when no API key
      res.json({
        response: `[Mock AI] I received your message: "${message}". Configure OPENROUTER_API_KEY for real responses.`,
        model: 'mock',
        userId,
      });
      return;
    }

    const response = await aiService.generateText(fullPrompt);

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

// Usage stats endpoint
app.get('/api/usage/:userId', (req, res) => {
  const stats = getUsageStats(req.params.userId);
  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`🤖 AI Engine running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chat endpoint: POST http://localhost:${PORT}/api/chat`);
});

export { app };
