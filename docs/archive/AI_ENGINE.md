# AI Engine Architecture & Guide

## Overview

The UniLodge AI Engine is a specialized service for **machine learning and natural language processing** capabilities. It provides intelligent room recommendations, preference analysis, and conversational AI to enhance the user experience. Built with **Node.js** and **TypeScript**, it integrates with **Hugging Face** APIs for text generation and embeddings.

**Technology Stack:**

- Framework: Express.js with TypeScript
- AI/ML Platform: Hugging Face Hub
- Vector Operations: Manual similarity calculations (future: vector DB)
- Testing: Vitest
- Environment: Node.js 22.x
- Port: 5000 (internal service)

## Project Structure

```
apps/ai-engine/
├── src/
│   ├── server.ts               # Express server setup
│   ├── services/
│   │   ├── huggingface.service.ts    # HF API wrapper
│   │   ├── recommendation.service.ts # Room recommendations
│   │   ├── preference.service.ts     # User preference analysis
│   │   ├── embedding.service.ts      # Text embeddings
│   │   └── chat.service.ts           # Conversational AI
│   ├── routes/
│   │   ├── chat.routes.ts            # Chat endpoints
│   │   └── recommendation.routes.ts   # Recommendation endpoints
│   ├── types/
│   │   └── index.ts                  # TypeScript types
│   ├── utils/
│   │   └── logger.ts                 # Logging utility
│   └── config/
│       └── environment.ts             # Config validation
├── tests/
│   ├── services.test.ts              # Service tests
│   └── integration.test.ts           # API tests
├── .env.example                      # Configuration template
├── tsconfig.json                     # TypeScript config
├── vitest.config.ts                  # Test configuration
└── package.json                      # Dependencies
```

## Services

### HuggingFaceService

Wrapper for Hugging Face API interactions. Handles text generation and embeddings.

```typescript
class HuggingFaceService {
  private apiKey: string;
  private baseUrl: string;
  private modelId: string;

  /**
   * Generate text based on prompt
   * @param prompt Initial text to continue
   * @returns Generated text completion
   */
  async generateText(prompt: string): Promise<string>;

  /**
   * Get vector embeddings for text
   * @param text Input text to embed
   * @returns Vector array (512, 768, or 1024 dimensions)
   */
  async getEmbeddings(text: string): Promise<number[]>;

  /**
   * Classify text into categories
   * @param text Text to classify
   * @returns Classification results with scores
   */
  async classify(text: string): Promise<Classification>;
}

// Usage
const service = new HuggingFaceService();
const response = await service.generateText(
  "Recommend a hotel room with: good views, near campus",
);
```

### RecommendationEngine

Intelligent room recommendation system based on user preferences and booking history.

```typescript
class RecommendationEngine {
  private huggingFaceService: HuggingFaceService;
  private roomData: Room[];

  /**
   * Generate personalized room recommendations
   * @param userId User ID for personalization
   * @param preferences User preferences object
   * @returns Top N recommended rooms
   */
  async generateRecommendations(
    userId: string,
    preferences: UserPreferences,
  ): Promise<Room[]>;

  /**
   * Score a single room based on preferences
   * Considers: price, amenities, location, reviews, etc.
   */
  private scoreRoom(room: Room, preferences: UserPreferences): number;

  /**
   * Rank rooms by score in descending order
   */
  private rankRooms(scores: Map<string, number>): Room[];

  /**
   * Apply hard filters to room list
   */
  private applyFilters(rooms: Room[], criteria: SearchCriteria): Room[];
}

// Scoring Algorithm
enum ScoringFactors {
  priceMatch = 0.25, // How well price matches budget
  amenityMatch = 0.3, // How many preferred amenities
  ratingMatch = 0.2, // Room rating alignment
  roomTypeMatch = 0.15, // Preferred room type
  locationMatch = 0.1, // Proximity to preferred university
}

// Usage
const engine = new RecommendationEngine(huggingFaceService);
const recommendations = await engine.generateRecommendations(userId, {
  budget: 150,
  roomType: "Double",
  amenities: ["WiFi", "AC", "Kitchen"],
  university: "Stanford",
});
```

### PreferenceAnalyzer

Analyzes user booking history and reviews to extract implicit preferences.

```typescript
class PreferenceAnalyzer {
  private huggingFaceService: HuggingFaceService;
  private embeddingService: EmbeddingService;

  /**
   * Analyze user's complete booking history
   * Extracts patterns in room selection, price points, locations
   */
  async analyzeUserHistory(
    bookings: Booking[]
  ): Promise<ExtractedPreferences>

  /**
   * Extract key preferences from user reviews
   * Uses NLP to identify valued amenities and features
   */
  async extractPreferencesFromReviews(
    reviews: Review[]
  ): Promise<string[]>

  /**
   * Compare two users' preferences for collaborative filtering
   * Returns similarity score (0-1)
   */
  async comparePreferences(
    userAId: string,
    userBId: string
  ): Promise<number>
}

// Data Flow
User Booking History
  ↓ (analyze patterns)
Price Point: $100-150 range
Room Type: Mostly Double rooms
Amenities: Wi-Fi, AC, Quiet
Location: Near campus
  ↓ (normalize)
Preferences {
  budget: 125,
  budgetRange: [100, 150],
  roomType: ['Double'],
  amenities: ['WiFi', 'AC'],
  university: 'Stanford'
}
```

### EmbeddingService

Text embedding service using Hugging Face models. Enables semantic similarity matching.

```typescript
class EmbeddingService {
  private huggingFaceService: HuggingFaceService;
  private cache: Map<string, number[]>;

  /**
   * Get embedding vector for text
   * Uses caching to avoid redundant API calls
   */
  async getEmbedding(text: string): Promise<number[]>

  /**
   * Calculate cosine similarity between two vectors
   * Returns score 0-1 (1 = identical, 0 = orthogonal)
   */
  cosineSimilarity(vec1: number[], vec2: number[]): number

  /**
   * Find N most similar texts from candidates
   * Useful for: similar rooms, comparable bookings, etc.
   */
  async findSimilar(
    text: string,
    candidates: string[],
    topN: number = 5
  ): Promise<Candidate[]>
}

// Example: Find rooms similar to user's ideal description
const roomDescriptions = rooms.map(r => r.description);
const similarRooms = await embeddingService.findSimilar(
  "Bright room with ocean view, close to beach, quiet neighborhood",
  roomDescriptions,
  topN: 5
);
```

### ChatService

Conversational AI powered by Hugging Face models. Maintains context and provides helpful suggestions.

```typescript
class ChatService {
  private huggingFaceService: HuggingFaceService;
  private conversationHistory: Message[];
  private userContext: UserContext;

  /**
   * Process user message and generate response
   * Maintains conversation history for context
   */
  async chat(userMessage: string): Promise<ChatResponse>

  /**
   * Add context about user (bookings, preferences)
   * Used to personalize responses
   */
  addContext(context: UserContext): void

  /**
   * Track conversation messages
   */
  private recordMessage(role: 'user' | 'assistant', content: string): void

  /**
   * Build system prompt incorporating context
   */
  private buildPrompt(): string

  /**
   * Clear conversation history and context
   */
  clearHistory(): void
}

// Conversation Flow
User: "I'm looking for a quiet room near Stanford"
  ↓ (add context about user's previous bookings)
System: "Based on your preference for [quiet], [double rooms], near [Stanford]..."
  ↓ (generate response)
Assistant: "I recommend Room 302 (Double) - quiet floor, 2min walk to campus"

User: "How much does it cost?"
  ↓ (use context from previous messages)
Assistant: "Room 302 is $125/night, which is within your typical budget..."
```

## API Endpoints

### Chat Endpoint

```http
POST /api/chat
  Headers: { Authorization: Bearer token }
  Body: {
    message: string,
    userId?: string,
    context?: {
      bookingHistory?: Booking[],
      preferences?: UserPreferences
    }
  }

  Response: {
    reply: string,
    suggestions?: string[],
    confidence: number
  }
```

### Recommendations Endpoint

```http
GET /api/recommendations
  Query: ?userId=xxx&limit=5&filter=active
  Headers: { Authorization: Bearer token }

  Response: {
    rooms: Room[],
    reasoning: string,
    similar_users_also_liked?: Room[]
  }
```

### Preferences Endpoint

```http
POST /api/preferences
  Headers: { Authorization: Bearer token }
  Body: {
    userId: string,
    preferences: UserPreferences
  }

  Response: {
    saved: boolean,
    extractedFrom: string,
    preferences: UserPreferences
  }
```

### Analysis Endpoint

```http
POST /api/analysis/user-history
  Body: {
    bookings: Booking[],
    reviews: Review[]
  }

  Response: {
    preferences: ExtractedPreferences,
    patterns: string[],
    insights: string[]
  }
```

## Integration with Backend

The AI Engine is called from the main backend service for chat and recommendations:

```typescript
// Backend: apps/backend/src/services/ai.service.ts
class AIChatService {
  private aiEngineUrl = process.env.AI_ENGINE_URL || "http://localhost:5000";

  async generateResponse(message: string): Promise<string> {
    const response = await fetch(`${this.aiEngineUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    return data.reply;
  }

  async getRecommendations(userId: string): Promise<Room[]> {
    const response = await fetch(
      `${this.aiEngineUrl}/api/recommendations?userId=${userId}`,
      { method: "GET" },
    );

    const data = await response.json();
    return data.rooms;
  }
}

// Usage in Backend Controllers
router.get("/chat/recommendations", async (req, res) => {
  const userId = req.user._id;
  const recommendations = await aiService.getRecommendations(userId);
  res.json({ rooms: recommendations });
});
```

## Recommendation Algorithm

```
Step 1: Extract User Preferences
  - Analyze booking history (price, room type, location)
  - Extract from reviews (amenities, features valued)
  - Consider explicit preferences if provided

Step 2: Candidate Pool Selection
  - Filter rooms: available in date range, approved status
  - Apply hard constraints: budget, room type, location
  - Result: ~50-200 candidate rooms

Step 3: Scoring & Ranking
  For each candidate room:
    price_score = 1 - |room_price - user_budget| / user_budget
    amenity_score = matching_amenities / total_user_amenities
    rating_score = room_rating / 5.0
    location_score = 1 if user_university else 0.5

    final_score =
      0.25 * price_score +
      0.30 * amenity_score +
      0.20 * rating_score +
      0.15 * room_type_match +
      0.10 * location_score

  Sort by final_score (descending)

Step 4: Personalization
  - Boost rooms similar to previously booked rooms
  - Apply collaborative filtering (users like you also booked...)
  - Diversify results (avoid all same type)

Step 5: Return Top N
  - Return top 5-10 recommendations
  - Include reasoning for each recommendation
```

## Machine Learning Models

### Hugging Face Models Used

```typescript
// Text Generation Model
Model: mistralai/Mistral-7B-Instruct-v0.1
Task: Text generation, conversation
Input: User query, context
Output: Natural language response

// Embedding Model
Model: sentence-transformers/all-MiniLM-L6-v2
Task: Text embeddings (semantic similarity)
Dimensions: 384
Use case: Finding similar rooms, preference comparison

// Classification Model (Future)
Model: tabulr-team/distilbert-base-uncased-finetuned-emotion
Task: Sentiment/preference classification
Input: User reviews, comments
Output: Sentiment score, key themes
```

## Performance & Optimization

### Caching Strategy

```typescript
// Cache embeddings (512 MB limit)
const embeddingCache = new Map<
  string,
  {
    vector: number[];
    timestamp: Date;
    ttl: number;
  }
>();

// Auto-cleanup old cached items (> 1 hour)
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of embeddingCache) {
      if (now - value.timestamp.getTime() > value.ttl * 1000) {
        embeddingCache.delete(key);
      }
    }
  },
  15 * 60 * 1000,
); // Every 15 minutes
```

### Rate Limiting

```typescript
// Hugging Face API has rate limits
// Implement exponential backoff
async function callWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
```

### Model Selection for Efficiency

```typescript
// Small model for chat (lower latency)
chat_model: "mistralai/Mistral-7B-Instruct-v0.1"
latency: ~2-3 seconds
cost: $0.00015 per 1K tokens

// Small embedding model (fast, sufficient for semantic search)
embedding_model: "sentence-transformers/all-MiniLM-L6-v2"
latency: ~100ms
dimensions: 384 (vs 1536 for larger models)
```

## Testing

### Unit Tests

```typescript
// tests/services.test.ts
describe("RecommendationEngine", () => {
  it("should score rooms based on preferences", () => {
    const room: Room = {
      price: 120,
      type: "Double",
      amenities: ["WiFi", "AC"],
      rating: 4.5,
      // ...
    };

    const preferences = {
      budget: 125,
      roomType: ["Double"],
      amenities: ["WiFi"],
    };

    const score = engine.scoreRoom(room, preferences);
    expect(score).toBeGreaterThan(0.7); // Good match
  });

  it("should rank rooms by score", () => {
    const scores = new Map([
      [room1._id, 0.9],
      [room2._id, 0.6],
      [room3._id, 0.8],
    ]);

    const ranked = engine.rankRooms(scores);
    expect(ranked[0]._id).toBe(room1._id); // Highest score first
  });
});

describe("EmbeddingService", () => {
  it("should calculate cosine similarity correctly", () => {
    const vec1 = [1, 0, 0];
    const vec2 = [1, 0, 0];
    expect(service.cosineSimilarity(vec1, vec2)).toBe(1); // Identical

    const vec3 = [0, 1, 0];
    expect(service.cosineSimilarity(vec1, vec3)).toBe(0); // Orthogonal
  });
});
```

### Integration Tests

```typescript
describe("AI Engine API", () => {
  it("should generate room recommendations with reasoning", async () => {
    const response = await request(app)
      .get("/api/recommendations")
      .query({ userId: testUserId, limit: 5 });

    expect(response.status).toBe(200);
    expect(response.body.rooms).toHaveLength(5);
    expect(response.body.reasoning).toBeDefined();
  });

  it("should handle chat with context persistence", async () => {
    // First message
    let response = await request(app)
      .post("/api/chat")
      .send({ message: "I like quiet rooms" });
    expect(response.status).toBe(200);

    // Second message (should remember context)
    response = await request(app)
      .post("/api/chat")
      .send({ message: "Show me options" });
    expect(response.body.reply).toContain("quiet");
  });
});
```

## Running the AI Engine

```bash
# Development
npm run dev                # Runs on localhost:5000

# Build
npm run build

# Start production
npm start

# Testing
npm run test              # Unit & integration tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Type checking
npm run type-check

# Linting
npm run lint
```

## Environment Variables

```bash
# .env
HUGGING_FACE_API_KEY=your_api_key
# Select model IDs if needed
MODEL_ID=mistralai/Mistral-7B-Instruct-v0.1
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

NODE_ENV=development
PORT=5000
```

## Future Enhancements

1. **Vector Database**: Use Pinecone/Weaviate for better similarity search
2. **Fine-tuning**: Train custom model on UniLodge booking data
3. **Real-time Updates**: WebSocket for live recommendation updates
4. **A/B Testing**: Compare recommendation strategies and measure improvement
5. **User Feedback Loop**: Learn from user interactions to improve recommendations
6. **Multi-modal AI**: Image processing for room photos analysis
7. **Sentiment Analysis**: Analyze reviews to identify important features
8. **Predictive Analytics**: Forecast demand, price optimization
