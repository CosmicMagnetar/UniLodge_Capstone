# 🚀 UniLodge-v2 Servers Running

## Status: ✅ ALL SERVICES ACTIVE

### 📱 Frontend Server

- **Port**: 3000
- **URL**: http://localhost:3000
- **Status**: ✅ Running (Next.js 14)
- **Framework**: React 19 + Next.js 14 + Tailwind CSS

### 🔌 Backend Server

- **Port**: 3001
- **URL**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API Base**: http://localhost:3001/api
- **Status**: ✅ Running (Express.js)
- **Database**: ✅ MongoDB Connected

### 🤖 AI Engine (OpenRouter)

- **Status**: ✅ Configured
- **Provider**: OpenRouter
- **Default Model**: openai/gpt-3.5-turbo
- **Available Models**:
  - `openai/gpt-4` (most capable)
  - `openai/gpt-3.5-turbo` (fast & cheap) ← Current
  - `meta-llama/llama-2-7b-chat` (open source)
  - `mistralai/mistral-7b` (open source)

---

## 🎯 What Was Changed

### 1. AI Engine Refactoring ✅

**From**: HuggingFace API  
**To**: OpenRouter API

**Changed Files**:

- `apps/ai-engine/src/models/index.ts` - Updated models to OpenRouter-compatible models
- `apps/ai-engine/src/services/index.ts` - Created `OpenRouterService` class
- `apps/ai-engine/package.json` - Added axios dependency

**New OpenRouterService Features**:

- ✅ Chat completions (generateText)
- ✅ Streaming responses (generateTextStream)
- ✅ Multiple model support
- ✅ Temperature control
- ✅ Error handling with try-catch
- ✅ Get available models list

### 2. Environment Configuration ✅

Updated `.env.example` files across all apps:

**Backend** (`apps/backend/.env.example`):

```
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=openai/gpt-3.5-turbo
OPENROUTER_TEMPERATURE=0.7
MONGODB_URI=mongodb://localhost:27017/unilodge
JWT_SECRET=your-jwt-secret-key-min-32-chars
PORT=3000  # Will be 3001 for backend
```

**Frontend** (`apps/frontend/.env.example`):

```
NEXT_PUBLIC_OPENROUTER_API_KEY=your-openrouter-api-key
NEXT_PUBLIC_OPENROUTER_MODEL=openai/gpt-3.5-turbo
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**AI Engine** (`apps/ai-engine/.env.example`):

```
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxx
OPENROUTER_MODEL=openai/gpt-3.5-turbo
```

---

## ⚙️ Quick Setup Checklist

### Step 1: Get OpenRouter API Key

1. Visit https://openrouter.ai
2. Sign up / Log in
3. Go to Keys https://openrouter.ai/keys
4. Create API key
5. Copy the key (starts with `sk-or-`)

### Step 2: Configure Environment Variables

1. **Backend**: Create `apps/backend/.env`

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   # Edit and add OPENROUTER_API_KEY
   ```

2. **Frontend**: Create `apps/frontend/.env.local`

   ```bash
   cp apps/frontend/.env.example apps/frontend/.env.local
   # Edit and add NEXT_PUBLIC_OPENROUTER_API_KEY
   ```

3. **AI Engine**: Create `apps/ai-engine/.env`
   ```bash
   cp apps/ai-engine/.env.example apps/ai-engine/.env
   # Edit and add OPENROUTER_API_KEY
   ```

### Step 3: Restart Services (if you modified .env)

```bash
# Kill current processes and restart
npm run dev:backend
npm run dev:frontend
```

---

## 🧪 Test the Setup

### Test Backend Health

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2026-04-13T10:30:00.000Z"
}
```

### Test AI Service (from Node.js)

```javascript
import { OpenRouterService } from "@unilodge/ai-engine";

const service = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY,
  model: "openai/gpt-3.5-turbo",
});

const response = await service.generateText(
  "What are the best student accommodations?",
);
console.log(response);
```

### Test Chat Endpoint (if implemented)

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, I need help finding accommodation"}'
```

---

## 📊 Available API Endpoints

### Auth Routes

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Room Routes

- `GET /api/rooms` - List all rooms
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms` - Create room (warden only)
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Booking Routes

- `GET /api/bookings` - List user bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/confirm` - Confirm booking
- `PUT /api/bookings/:id/cancel` - Cancel booking

### AI/Chat Routes (to be implemented)

- `POST /api/chat/message` - Send message to AI chatbot
- `GET /api/chat/history` - Get chat history
- `POST /api/chat/recommendations` - Get room recommendations from AI

---

## 🔧 Troubleshooting

### Port Already in Use

If port 3000 or 3001 is already in use:

```bash
# Find process using the port
lsof -i :3000  # or :3001

# Kill the process
kill -9 <PID>
```

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

Solution:

```bash
# Make sure MongoDB is running
brew services start mongodb-community

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### OpenRouter API Key Error

```
Error: Unauthorized - Invalid API key
```

Solution:

1. Check API key in `.env` file
2. Ensure key starts with `sk-or-`
3. Go to https://openrouter.ai/keys to verify key is active

### Environment Variables Not Loading

```bash
# Restart the servers after updating .env
npm run dev:backend
npm run dev:frontend
```

---

## 📚 Documentation References

- **Architecture Design**: `docs/DESIGN_PATTERNS_AND_SOLID.md`
- **Backend Implementation**: `docs/BACKEND_ARCHITECTURE_IMPLEMENTATION.md`
- **Frontend Implementation**: `docs/FRONTEND_ARCHITECTURE_IMPLEMENTATION.md`
- **AI Engine & Shared**: `docs/AI_ENGINE_AND_SHARED_REFACTORING.md`
- **Implementation Roadmap**: `docs/COMPLETE_IMPLEMENTATION_ROADMAP.md`
- **Refactoring Summary**: `REFACTORING_COMPLETE.md`

---

## 🎓 Next Steps

1. ✅ **Frontend & Backend Running** - DONE
2. ✅ **AI Engine Using OpenRouter** - DONE
3. 📋 **Implement Chat Endpoint** - Ready to code
   - Create `apps/backend/src/routes/chatRoutes.ts`
   - Create `POST /api/chat/message` endpoint
   - Integrate `OpenRouterService`

4. 📋 **Integrate AI Chat in Frontend** - Ready to code
   - Create `apps/frontend/src/features/chat/` directory
   - Create `ChatService` using OpenRouter
   - Build Chat UI component

5. 📋 **Test Full Workflow**
   - Send message from frontend
   - Route through backend
   - Call OpenRouter API
   - Return response to frontend

---

## 💡 Using OpenRouter in Your Code

### Backend Example

```typescript
import { OpenRouterService } from "@unilodge/ai-engine";

const aiService = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY,
  model: "openai/gpt-3.5-turbo",
  temperature: 0.7,
});

// Generate response
const response = await aiService.generateText(
  "Help me find accommodation near the university",
);

// Or stream response
for await (const chunk of aiService.generateTextStream(prompt)) {
  console.log(chunk);
}
```

### Frontend Example

```typescript
import { OpenRouterService } from "@unilodge/ai-engine";

const service = new OpenRouterService({
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  model: "openai/gpt-3.5-turbo",
});

const response = await service.generateText("What are the best rooms?");
```

---

## 🚀 Performance Tips

1. **Use Streaming** for real-time chat:

   ```typescript
   // Better for user experience
   for await (const chunk of service.generateTextStream(prompt)) {
     displayChunk(chunk);
   }
   ```

2. **Cache Responses**:

   ```typescript
   const cache = new Map();
   if (cache.has(prompt)) return cache.get(prompt);
   const response = await service.generateText(prompt);
   cache.set(prompt, response);
   ```

3. **Use Cheaper Models when Possible**:
   - `meta-llama/llama-2-7b-chat` for simple queries
   - `openai/gpt-3.5-turbo` for complex queries
   - `openai/gpt-4` for critical decisions

---

## ❓ FAQ

**Q: Can I switch models at runtime?**  
A: Yes! Use the `model` parameter:

```typescript
await service.generateText(prompt, "openai/gpt-4");
```

**Q: How do I enable streaming in the UI?**  
A: Use `generateTextStream()` and update UI as chunks arrive

**Q: What's the cost difference between models?**  
A: Check https://openrouter.ai/docs/models for pricing

**Q: Can I filter by cost or latency?**  
A: Yes, OpenRouter API returns cost and latency metrics

---

## 📝 Summary

✅ **Frontend**: Running on http://localhost:3000  
✅ **Backend**: Running on http://localhost:3001  
✅ **AI Engine**: Configured with OpenRouter  
✅ **All Environment Files**: Updated with new config  
✅ **Ready for**: Chat endpoint implementation

**Time to Production**: ~2-4 hours for full chat feature  
**Complexity**: Medium (straightforward OpenRouter API integration)

Enjoy! 🎉
