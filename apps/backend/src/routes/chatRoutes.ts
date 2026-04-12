import express, { Router, Request, Response } from 'express'
import { OpenRouterService } from '@unilodge/ai-engine'

const router: Router = express.Router()

// Initialize OpenRouter service
const aiService = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  model: process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo',
  temperature: parseFloat(process.env.OPENROUTER_TEMPERATURE || '0.7'),
})

/**
 * POST /api/chat/message
 * Send a message to the AI chatbot
 */
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string',
      })
    }

    // Build prompt with context
    let prompt = message
    if (context) {
      prompt = `Context: ${context}\n\nUser: ${message}`
    }

    // Generate response
    const response = await aiService.generateText(prompt)

    res.json({
      success: true,
      message,
      response,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({
      error: 'Failed to generate response',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

/**
 * POST /api/chat/stream
 * Send a message and stream the response
 */
router.post('/stream', async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string',
      })
    }

    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // Build prompt
    let prompt = message
    if (context) {
      prompt = `Context: ${context}\n\nUser: ${message}`
    }

    // Stream response
    let fullResponse = ''
    for await (const chunk of aiService.generateTextStream(prompt)) {
      fullResponse += chunk
      res.write(
        `data: ${JSON.stringify({ chunk, isDone: false })}\n\n`
      )
    }

    // Send completion event
    res.write(`data: ${JSON.stringify({ isDone: true, fullResponse })}\n\n`)
    res.end()
  } catch (error) {
    console.error('Stream error:', error)
    res.status(500).json({
      error: 'Failed to stream response',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

/**
 * POST /api/chat/room-recommendations
 * Get AI recommendations for room matching
 */
router.post('/room-recommendations', async (req: Request, res: Response) => {
  try {
    const { budget, preferences, location } = req.body

    const prompt = `Based on the following criteria, suggest the best student accommodation:
- Budget: $${budget} per month
- Preferences: ${preferences?.join(', ') || 'any'}
- Location: ${location || 'any'}

Please provide 3-5 recommendations with pros and cons for each.`

    const response = await aiService.generateText(prompt)

    res.json({
      success: true,
      recommendations: response,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Recommendation error:', error)
    res.status(500).json({
      error: 'Failed to generate recommendations',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

/**
 * POST /api/chat/analyze-room
 * Analyze a specific room using AI
 */
router.post('/analyze-room', async (req: Request, res: Response) => {
  try {
    const { roomData, userProfile } = req.body

    if (!roomData) {
      return res.status(400).json({ error: 'Room data is required' })
    }

    const prompt = `Analyze this student room listing and provide insights:

Room Details:
- Name: ${roomData.name}
- Price: $${roomData.pricePerNight}/night
- Capacity: ${roomData.capacity} people
- Amenities: ${roomData.amenities?.join(', ') || 'none'}
- Location: ${roomData.location || 'unknown'}

${
  userProfile
    ? `User Profile:\n- Budget: $${userProfile.budget}\n- Preferences: ${userProfile.preferences?.join(', ')}`
    : ''
}

Provide:
1. Suitability score (1-10)
2. Value for money assessment
3. Potential concerns
4. Recommendations`

    const analysis = await aiService.generateText(prompt)

    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Analysis error:', error)
    res.status(500).json({
      error: 'Failed to analyze room',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

/**
 * GET /api/chat/models
 * List available models
 */
router.get('/models', async (req: Request, res: Response) => {
  try {
    const models = await aiService.getAvailableModels()
    res.json({
      success: true,
      models,
      currentModel: process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo',
    })
  } catch (error) {
    console.error('Models error:', error)
    res.status(500).json({
      error: 'Failed to fetch models',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

/**
 * POST /api/chat/switch-model
 * Switch AI model for subsequent requests
 */
router.post('/switch-model', async (req: Request, res: Response) => {
  try {
    const { model } = req.body

    if (!model) {
      return res.status(400).json({ error: 'Model name is required' })
    }

    // In production, you might want to validate the model exists
    process.env.OPENROUTER_MODEL = model

    res.json({
      success: true,
      message: `Switched to model: ${model}`,
      currentModel: model,
    })
  } catch (error) {
    console.error('Switch model error:', error)
    res.status(500).json({
      error: 'Failed to switch model',
    })
  }
})

export default router
