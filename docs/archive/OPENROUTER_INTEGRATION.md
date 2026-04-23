# 🤖 OpenRouter Integration Guide

## Quick Start: Implement Chat Endpoint

### 1. Create Chat Routes

Create `apps/backend/src/routes/chatRoutes.ts`:

```typescript
import express, { Router, Request, Response } from "express";
import { OpenRouterService } from "@unilodge/ai-engine";

const router: Router = express.Router();

// Initialize OpenRouter service
const aiService = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY,
  model: process.env.OPENROUTER_MODEL || "openai/gpt-3.5-turbo",
  temperature: parseFloat(process.env.OPENROUTER_TEMPERATURE || "0.7"),
});

/**
 * POST /api/chat/message
 * Send a message to the AI chatbot
 */
router.post("/message", async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;

    // Validate input
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required and must be a string",
      });
    }

    // Build prompt with context
    let prompt = message;
    if (context) {
      prompt = `Context: ${context}\n\nUser: ${message}`;
    }

    // Generate response
    const response = await aiService.generateText(prompt);

    res.json({
      success: true,
      message,
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Failed to generate response",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/chat/stream
 * Send a message and stream the response
 */
router.post("/stream", async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required and must be a string",
      });
    }

    // Set up streaming response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Build prompt
    let prompt = message;
    if (context) {
      prompt = `Context: ${context}\n\nUser: ${message}`;
    }

    // Stream response
    let fullResponse = "";
    for await (const chunk of aiService.generateTextStream(prompt)) {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ chunk, isDone: false })}\n\n`);
    }

    // Send completion event
    res.write(`data: ${JSON.stringify({ isDone: true, fullResponse })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Stream error:", error);
    res.status(500).json({
      error: "Failed to stream response",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/chat/room-recommendations
 * Get AI recommendations for room matching
 */
router.post("/room-recommendations", async (req: Request, res: Response) => {
  try {
    const { budget, preferences, location } = req.body;

    const prompt = `Based on the following criteria, suggest the best student accommodation:
- Budget: $${budget} per month
- Preferences: ${preferences?.join(", ") || "any"}
- Location: ${location || "any"}

Please provide 3-5 recommendations with pros and cons for each.`;

    const response = await aiService.generateText(prompt);

    res.json({
      success: true,
      recommendations: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({
      error: "Failed to generate recommendations",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/chat/analyze-room
 * Analyze a specific room using AI
 */
router.post("/analyze-room", async (req: Request, res: Response) => {
  try {
    const { roomData, userProfile } = req.body;

    if (!roomData) {
      return res.status(400).json({ error: "Room data is required" });
    }

    const prompt = `Analyze this student room listing and provide insights:

Room Details:
- Name: ${roomData.name}
- Price: $${roomData.pricePerNight}/night
- Capacity: ${roomData.capacity} people
- Amenities: ${roomData.amenities?.join(", ") || "none"}
- Location: ${roomData.location || "unknown"}

${userProfile ? `User Profile:\n- Budget: $${userProfile.budget}\n- Preferences: ${userProfile.preferences?.join(", ")}` : ""}

Provide:
1. Suitability score (1-10)
2. Value for money assessment
3. Potential concerns
4. Recommendations`;

    const analysis = await aiService.generateText(prompt);

    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      error: "Failed to analyze room",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/chat/models
 * List available models
 */
router.get("/models", async (req: Request, res: Response) => {
  try {
    const models = await aiService.getAvailableModels();
    res.json({
      success: true,
      models,
      currentModel: process.env.OPENROUTER_MODEL || "openai/gpt-3.5-turbo",
    });
  } catch (error) {
    console.error("Models error:", error);
    res.status(500).json({
      error: "Failed to fetch models",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/chat/switch-model
 * Switch AI model for subsequent requests
 */
router.post("/switch-model", async (req: Request, res: Response) => {
  try {
    const { model } = req.body;

    if (!model) {
      return res.status(400).json({ error: "Model name is required" });
    }

    // In production, you might want to validate the model exists
    process.env.OPENROUTER_MODEL = model;

    res.json({
      success: true,
      message: `Switched to model: ${model}`,
      currentModel: model,
    });
  } catch (error) {
    console.error("Switch model error:", error);
    res.status(500).json({
      error: "Failed to switch model",
    });
  }
});

export default router;
```

### 2. Register Routes in server.ts

Add to `apps/backend/src/server.ts`:

```typescript
import chatRoutes from "./routes/chatRoutes.js";

// Add this with other route registrations (around line 53)
app.use("/api/chat", chatRoutes);
```

---

## Frontend Integration

### 1. Create Chat Service

Create `apps/frontend/src/features/chat/services/ChatService.ts`:

```typescript
import axios, { AxiosInstance } from "axios";

interface ChatMessage {
  message: string;
  context?: string;
}

interface RoomRecommendationParams {
  budget: number;
  preferences?: string[];
  location?: string;
}

export class ChatService {
  private client: AxiosInstance;

  constructor(
    apiBaseUrl: string = process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3001/api",
  ) {
    this.client = axios.create({
      baseURL: apiBaseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Send a message and get a response
   */
  async sendMessage(params: ChatMessage): Promise<string> {
    const response = await this.client.post("/chat/message", params);
    return response.data.response;
  }

  /**
   * Stream a message response
   */
  async *streamMessage(params: ChatMessage): AsyncGenerator<string> {
    const response = await this.client.post("/chat/stream", params, {
      responseType: "stream",
    });

    // Parse Server-Sent Events
    const reader = response.data.toString().split("\n");
    for (const line of reader) {
      if (line.startsWith("data: ")) {
        const data = JSON.parse(line.slice(6));
        if (data.isDone) break;
        if (data.chunk) yield data.chunk;
      }
    }
  }

  /**
   * Get AI room recommendations
   */
  async getRoomRecommendations(
    params: RoomRecommendationParams,
  ): Promise<string> {
    const response = await this.client.post(
      "/chat/room-recommendations",
      params,
    );
    return response.data.recommendations;
  }

  /**
   * Analyze a specific room
   */
  async analyzeRoom(roomData: any, userProfile?: any): Promise<string> {
    const response = await this.client.post("/chat/analyze-room", {
      roomData,
      userProfile,
    });
    return response.data.analysis;
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    const response = await this.client.get("/chat/models");
    return response.data.models;
  }

  /**
   * Switch to a different model
   */
  async switchModel(model: string): Promise<void> {
    await this.client.post("/chat/switch-model", { model });
  }
}

export const chatService = new ChatService();
```

### 2. Create Custom Hook

Create `apps/frontend/src/features/chat/hooks/useChat.ts`:

```typescript
import { useState, useCallback } from "react";
import { chatService } from "../services/ChatService";

interface UseChatOptions {
  onStreamChunk?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
}

export function useChat(options: UseChatOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string>("");

  const sendMessage = useCallback(
    async (message: string, context?: string) => {
      setLoading(true);
      setError(null);
      setResponse("");

      try {
        const result = await chatService.sendMessage({ message, context });
        setResponse(result);
        options.onComplete?.(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options],
  );

  const streamMessage = useCallback(
    async (message: string, context?: string) => {
      setLoading(true);
      setError(null);
      setResponse("");

      try {
        let fullResponse = "";
        for await (const chunk of chatService.streamMessage({
          message,
          context,
        })) {
          fullResponse += chunk;
          setResponse(fullResponse);
          options.onStreamChunk?.(chunk);
        }
        options.onComplete?.(fullResponse);
        return fullResponse;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to stream message";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options],
  );

  const getRoomRecommendations = useCallback(
    async (budget: number, preferences?: string[], location?: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await chatService.getRoomRecommendations({
          budget,
          preferences,
          location,
        });
        setResponse(result);
        options.onComplete?.(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to get recommendations";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options],
  );

  return {
    sendMessage,
    streamMessage,
    getRoomRecommendations,
    loading,
    error,
    response,
  };
}
```

### 3. Create Chat Component

Create `apps/frontend/src/features/chat/components/ChatWidget.tsx`:

```typescript
import { useState } from 'react'
import { useChat } from '../hooks/useChat'

export function ChatWidget() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const { sendMessage, loading, error, response } = useChat({
    onComplete: (response) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: response }])
    },
  })

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: input }])
    setInput('')

    try {
      await sendMessage(input)
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-2xl bg-white rounded-lg shadow-lg">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>Start a conversation with AI</p>
            <p className="text-sm">Ask about rooms, get recommendations, etc.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-black p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-100 text-red-700 p-3 rounded-lg">
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI about rooms, booking, etc..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
```

---

## Environment Setup

### Backend .env

```bash
OPENROUTER_API_KEY=sk-or-your-actual-key
OPENROUTER_MODEL=openai/gpt-3.5-turbo
OPENROUTER_TEMPERATURE=0.7
```

### Frontend .env.local

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Testing

### Test with cURL

```bash
# Test basic message
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need a room near the university with WiFi"
  }'

# Test room recommendations
curl -X POST http://localhost:3001/api/chat/room-recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "budget": 500,
    "preferences": ["WiFi", "Kitchen", "Near bus stop"],
    "location": "Downtown"
  }'

# Get available models
curl http://localhost:3001/api/chat/models
```

### Test from JavaScript

```javascript
const message = {
  message: "What are the best features for a student room?",
};

const response = await fetch("http://localhost:3001/api/chat/message", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(message),
});

const data = await response.json();
console.log(data.response);
```

---

## Costs

OpenRouter offers transparent pricing. Check for each request:

```typescript
// Response includes pricing info
const response = await this.client.post("/chat/message", params);
// response.headers['x-cost'] includes cost per request
```

---

## Tips & Best Practices

1. **Cache responses** to reduce API calls:

   ```typescript
   const cache = new Map();
   if (cache.has(prompt)) return cache.get(prompt);
   ```

2. **Use streaming** for better UX:

   ```typescript
   for await (const chunk of service.generateTextStream(prompt)) {
     updateUI(chunk);
   }
   ```

3. **Fallback to cheaper models**:

   ```typescript
   try {
     response = await service.generateText(prompt, "openai/gpt-4");
   } catch {
     response = await service.generateText(prompt, "openai/gpt-3.5-turbo");
   }
   ```

4. **Add user feedback loop**:
   ```typescript
   const feedback = await captureUserFeedback(response);
   // Store for model fine-tuning
   ```

---

## Next Steps

1. ✅ Implement chat routes in backend
2. ✅ Create ChatService in frontend
3. ✅ Test with cURL
4. ✅ Build ChatWidget component
5. ✅ Add to room listings page
6. ✅ Collect user feedback
7. ✅ Monitor costs on OpenRouter

Good luck! 🚀
