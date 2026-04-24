import express, { Router, Request, Response } from 'express';
import axios from 'axios';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';

const router: Router = express.Router();

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:3002';
const AI_TIMEOUT_MS = 120000;

/**
 * POST /api/chat/message
 * Proxy chat messages to the AI microservice.
 * The backend no longer imports AI libraries directly.
 */
router.post('/message', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { message, context } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string',
      });
    }

    const userId = req.user?.id || 'anonymous';
    const role = req.user?.role || 'GUEST';

    const response = await axios.post(
      `${AI_ENGINE_URL}/api/chat`,
      {
        message: context ? `Context: ${context}\n\nUser: ${message}` : message,
        userId,
        role,
      },
      { timeout: AI_TIMEOUT_MS }
    );

    res.json({
      success: true,
      message,
      response: response.data.response,
      model: response.data.model,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Chat proxy error:', error.message);

    // Handle AI service unavailable
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        error: 'AI service is temporarily unavailable. Please try again later.',
        fallback: true,
      });
    }

    // Handle rate limit from AI service
    if (error.response?.status === 429) {
      return res.status(429).json({
        error: error.response.data?.error || 'Rate limit exceeded',
        retryAfter: error.response.data?.retryAfter,
      });
    }

    res.status(500).json({
      error: 'Failed to generate response',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/chat/room-recommendations
 * Proxy room recommendation requests to AI service.
 */
router.post('/room-recommendations', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { budget, preferences, location } = req.body;

    const message = `Based on the following criteria, suggest the best student accommodation:
- Budget: $${budget} per month
- Preferences: ${preferences?.join(', ') || 'any'}
- Location: ${location || 'any'}

Please provide 3-5 recommendations with pros and cons for each.`;

    const response = await axios.post(
      `${AI_ENGINE_URL}/api/chat`,
      {
        message,
        userId: req.user?.id || 'anonymous',
        role: req.user?.role || 'GUEST',
      },
      { timeout: AI_TIMEOUT_MS }
    );

    res.json({
      success: true,
      recommendations: response.data.response,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'AI service is temporarily unavailable.' });
    }
    res.status(500).json({
      error: 'Failed to generate recommendations',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/chat/analyze-room
 * Proxy room analysis to AI service.
 */
router.post('/analyze-room', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { roomData, userProfile } = req.body;

    if (!roomData) {
      return res.status(400).json({ error: 'Room data is required' });
    }

    const message = `Analyze this student room listing:
- Name: ${roomData.name}
- Price: $${roomData.pricePerNight}/night
- Capacity: ${roomData.capacity} people
- Amenities: ${roomData.amenities?.join(', ') || 'none'}
- Location: ${roomData.location || 'unknown'}
${userProfile ? `\nUser Budget: $${userProfile.budget}, Preferences: ${userProfile.preferences?.join(', ')}` : ''}

Provide: Suitability score (1-10), value assessment, concerns, and recommendations.`;

    const response = await axios.post(
      `${AI_ENGINE_URL}/api/chat`,
      {
        message,
        userId: req.user?.id || 'anonymous',
        role: req.user?.role || 'GUEST',
      },
      { timeout: AI_TIMEOUT_MS }
    );

    res.json({
      success: true,
      analysis: response.data.response,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'AI service is temporarily unavailable.' });
    }
    res.status(500).json({
      error: 'Failed to analyze room',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/chat/health
 * Check AI service health.
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const response = await axios.get(`${AI_ENGINE_URL}/api/health`, { timeout: 5000 });
    res.json({ aiService: response.data });
  } catch {
    res.json({ aiService: { status: 'unavailable' } });
  }
});

export default router;
