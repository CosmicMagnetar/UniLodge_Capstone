# 🔍 Code Reference - Quick Copy-Paste Guide

## ⚡ Quick Integration Guide

If you need to add the chat feature to a new page, use these snippets:

---

## 1️⃣ Add ChatWidget to a Page

### Create New File: `apps/frontend/src/app/chat/page.tsx`

```typescript
'use client'

import { ChatWidget } from '@/features/chat'

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">AI Chat Assistant</h1>
        <ChatWidget />
      </div>
    </div>
  )
}
```

Then visit: `http://localhost:3000/chat`

---

## 2️⃣ Use Chat in Room Listing Component

### Add to any room component:

```typescript
'use client'

import { useChat } from '@/features/chat'

export function RoomCard({ room }) {
  const { analyzeRoom, loading, response } = useChat()

  const handleAnalyze = async () => {
    await analyzeRoom(room, {
      budget: 500,
      preferences: ['WiFi', 'Kitchen']
    })
  }

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-bold">{room.name}</h3>
      <p className="text-gray-600">${room.pricePerNight}/night</p>

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        {loading ? 'Analyzing...' : 'Is This Right for Me?'}
      </button>

      {response && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">{response}</p>
        </div>
      )}
    </div>
  )
}
```

---

## 3️⃣ Get Room Recommendations

### Add to search/filter component:

```typescript
'use client'

import { useChat } from '@/features/chat'

export function RoomFinder() {
  const { getRoomRecommendations, response, loading } = useChat()

  const handleFindRooms = async () => {
    const recommendations = await getRoomRecommendations(
      500,                        // budget
      ['WiFi', 'Kitchen'],        // preferences
      'Near campus'               // location
    )
  }

  return (
    <div>
      <button onClick={handleFindRooms} disabled={loading}>
        Get AI Recommendations
      </button>
      {response && <p>{response}</p>}
    </div>
  )
}
```

---

## 4️⃣ Simple Message Input

### Add to any component:

```typescript
'use client'

import { useChat } from '@/features/chat'

export function QuickQuestion() {
  const [message, setMessage] = useState('')
  const { sendMessage, response, loading } = useChat()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message) {
      sendMessage(message)
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask me anything..."
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        Send
      </button>
      {response && <p>{response}</p>}
    </form>
  )
}
```

---

## 5️⃣ Backend API Call (if needed directly)

### To call from backend (Node.js):

```typescript
import axios from "axios";

const aiClient = axios.create({
  baseURL: process.env.API_BASE_URL || "http://localhost:3001/api",
});

// Send message
const response = await aiClient.post("/chat/message", {
  message: "What are good dorm features?",
  context: "Budget: $500",
});
console.log(response.data.response);

// Get recommendations
const recs = await aiClient.post("/chat/room-recommendations", {
  budget: 600,
  preferences: ["WiFi", "Kitchen"],
  location: "Downtown",
});
console.log(recs.data.recommendations);

// Analyze room
const analysis = await aiClient.post("/chat/analyze-room", {
  roomData: {
    name: "Room A",
    pricePerNight: 25,
    capacity: 2,
    amenities: ["WiFi", "Kitchen"],
  },
  userProfile: {
    budget: 500,
    preferences: ["WiFi"],
  },
});
console.log(analysis.data.analysis);
```

---

## 6️⃣ Direct Service Usage

### Use ChatService directly:

```typescript
import { chatService } from "@/features/chat";

// Send message
const response = await chatService.sendMessage({
  message: "What features should I look for?",
});

// Stream message (real-time)
for await (const chunk of chatService.streamMessage({
  message: "Tell me about accommodations",
})) {
  console.log(chunk); // Update UI with chunk
}

// Get recommendations
const recommendations = await chatService.getRoomRecommendations({
  budget: 500,
  preferences: ["WiFi"],
  location: "City Center",
});

// Analyze room
const analysis = await chatService.analyzeRoom({
  name: "Dorm A",
  pricePerNight: 25,
  capacity: 2,
  amenities: ["WiFi"],
});

// Get models
const models = await chatService.getAvailableModels();

// Switch model
await chatService.switchModel("openai/gpt-4");
```

---

## 🎨 Styling Examples

### Custom Styled Chat Container

```typescript
<div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
    <h2 className="text-white text-xl font-bold">AI Assistant</h2>
  </div>
  <ChatWidget />
</div>
```

### Embed in Page

```typescript
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    <ChatWidget />
  </div>
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="font-bold mb-4">Tips</h3>
    <ul className="space-y-2 text-sm">
      <li>✓ Ask about locations</li>
      <li>✓ Mention your budget</li>
      <li>✓ Ask for comparisons</li>
    </ul>
  </div>
</div>
```

---

## 🧪 Testing Code Snippets

### Test in Browser Console

```javascript
// Test API directly
fetch("http://localhost:3001/api/chat/message", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "What are the best dorm amenities?",
  }),
})
  .then((r) => r.json())
  .then((data) => console.log(data.response));
```

### Test with curl

```bash
# Basic message
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello!"}'

# With context
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message":"Is this suitable?",
    "context":"Budget: $500, Need WiFi"
  }'

# Recommendations
curl -X POST http://localhost:3001/api/chat/room-recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "budget":500,
    "preferences":["WiFi","Kitchen"]
  }'

# List models
curl http://localhost:3001/api/chat/models
```

---

## ⚙️ Configuration Reference

### Backend .env Values

```bash
# Required
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Optional (defaults shown)
OPENROUTER_MODEL=openai/gpt-3.5-turbo
OPENROUTER_TEMPERATURE=0.7
```

### Frontend .env.local Values

```bash
# Required
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Optional (default shown)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🔧 Troubleshooting Code

### Test API Connection

```typescript
// Simple test function
async function testChatAPI() {
  try {
    const response = await fetch("http://localhost:3001/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "test" }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ API working:", data.response);
    } else {
      console.error("❌ API error:", data.error);
    }
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
  }
}

// Call it
testChatAPI();
```

### Check Environment

```typescript
// Verify environment variables are loaded
console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
console.log("API Key present:", !!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY);
```

---

## 📦 Import Examples

### Import Variations

```typescript
// Option 1: Import everything
import { ChatWidget, useChat, chatService } from "@/features/chat";

// Option 2: Import specific items
import { ChatWidget } from "@/features/chat/components/ChatWidget";
import { useChat } from "@/features/chat/hooks/useChat";
import { chatService } from "@/features/chat/services/ChatService";

// Option 3: Import service
import { ChatService } from "@/features/chat";
const service = new ChatService();
```

---

## 🎯 Common Patterns

### Pattern 1: Message with Loading

```typescript
const [message, setMessage] = useState('')
const { sendMessage, loading, response } = useChat()

const handleSend = async () => {
  try {
    await sendMessage(message)
    setMessage('')
  } catch (error) {
    console.error('Error:', error)
  }
}

return (
  <>
    <input value={message} onChange={(e) => setMessage(e.target.value)} />
    <button onClick={handleSend} disabled={loading}>
      {loading ? 'Sending...' : 'Send'}
    </button>
    {response && <p>{response}</p>}
  </>
)
```

### Pattern 2: Analysis with State

```typescript
const [room, setRoom] = useState(null)
const { analyzeRoom, response } = useChat({
  onComplete: (analysis) => {
    console.log('Analysis complete:', analysis)
  }
})

const handleAnalyze = () => {
  analyzeRoom(room)
}

return (
  <>
    <button onClick={handleAnalyze}>Analyze</button>
    {response && <div>{response}</div>}
  </>
)
```

### Pattern 3: List with Options

```typescript
const [budget, setBudget] = useState(500)
const { getRoomRecommendations, response } = useChat()

const handleGetRecs = async () => {
  await getRoomRecommendations(
    budget,
    ['WiFi', 'Kitchen'],
    'Campus'
  )
}

return (
  <>
    <input
      type="number"
      value={budget}
      onChange={(e) => setBudget(Number(e.target.value))}
    />
    <button onClick={handleGetRecs}>Get Recommendations</button>
    {response && <p>{response}</p>}
  </>
)
```

---

## 📊 Response Handling

### Success Response Shape

```typescript
interface SuccessResponse {
  success: true;
  message?: string;
  response?: string;
  recommendations?: string;
  analysis?: string;
  models?: string[];
  currentModel?: string;
  timestamp?: string;
}
```

### Error Response Shape

```typescript
interface ErrorResponse {
  error: string;
  message?: string;
}
```

### Handling Both

```typescript
const response = await fetch(...).then(r => r.json())

if (response.success) {
  // Handle success
  console.log(response.response)
} else {
  // Handle error
  console.error(response.error, response.message)
}
```

---

## 🚀 Ready to Deploy!

All code above is production-ready. Just copy and paste into your files.

**No additional setup needed!** 🎉

---

_Generated April 13, 2026_
_UniLodge OpenRouter Chat Integration v1.0_
