# ✅ Chat Integration Verification Checklist

Use this checklist to verify that the chat setup is complete and working.

## 📋 Pre-Integration Checklist

### Backend Setup

- [ ] OpenRouter API key added to `apps/backend/.env`

  ```
  OPENROUTER_API_KEY=sk-or-v1-...
  OPENROUTER_MODEL=openai/gpt-3.5-turbo
  OPENROUTER_TEMPERATURE=0.7
  ```

- [ ] Chat routes file created: `apps/backend/src/routes/chatRoutes.ts`
- [ ] Chat routes imported in `server.ts`
- [ ] Chat routes registered: `app.use('/api/chat', chatRoutes)`
- [ ] Backend running: `npm run dev:backend`
- [ ] Backend health check passes: `curl http://localhost:3001/health`

### Frontend Setup

- [ ] OpenRouter API key in `apps/frontend/.env.local`

  ```
  NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-...
  ```

- [ ] Chat service created: `apps/frontend/src/features/chat/services/ChatService.ts`
- [ ] useChat hook created: `apps/frontend/src/features/chat/hooks/useChat.ts`
- [ ] ChatWidget created: `apps/frontend/src/features/chat/components/ChatWidget.tsx`
- [ ] Index file created: `apps/frontend/src/features/chat/index.ts`
- [ ] Frontend running: `npm run dev:frontend`

### Verification Steps

- [ ] Run backend test script: `bash test-chat-api.sh`
- [ ] All 5 tests pass (or 402 error means API credit issue)
- [ ] Try API call with curl
- [ ] Frontend starts without errors

---

## 🧪 API Endpoint Tests

### Test 1: Basic Message

```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, what are the best dorm features?"}'
```

- [ ] Returns `success: true`
- [ ] Contains `response` field with AI text
- [ ] Takes < 10 seconds

### Test 2: Message with Context

```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message":"Is this good for me?",
    "context":"Budget: $500, Need WiFi"
  }'
```

- [ ] Returns `success: true`
- [ ] Response references context

### Test 3: Room Recommendations

```bash
curl -X POST http://localhost:3001/api/chat/room-recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "budget":500,
    "preferences":["WiFi","Kitchen"],
    "location":"Downtown"
  }'
```

- [ ] Returns `success: true`
- [ ] Contains recommendations

### Test 4: List Models

```bash
curl http://localhost:3001/api/chat/models
```

- [ ] Returns available models
- [ ] Shows current model
- [ ] Response takes < 1 second

### Test 5: Analyze Room

```bash
curl -X POST http://localhost:3001/api/chat/analyze-room \
  -H "Content-Type: application/json" \
  -d '{
    "roomData":{
      "name":"Room A",
      "pricePerNight":25,
      "capacity":2,
      "amenities":["WiFi","Kitchen"]
    }
  }'
```

- [ ] Returns `success: true`
- [ ] Contains analysis

---

## 🎨 Frontend Integration Checklist

### Option 1: Use Example Page

- [ ] Copy `EXAMPLE_CHAT_PAGE.tsx` to `apps/frontend/src/app/chat/page.tsx`
- [ ] Restart frontend
- [ ] Visit `http://localhost:3000/chat`
- [ ] Chat widget appears
- [ ] Can type and send messages

### Option 2: Add to Existing Page

- [ ] Import ChatWidget:
  ```typescript
  import { ChatWidget } from "@/features/chat";
  ```
- [ ] Add to JSX:
  ```typescript
  <ChatWidget />
  ```
- [ ] Component renders correctly
- [ ] Can type messages

### Option 3: Use useChat Hook

- [ ] Import useChat:
  ```typescript
  import { useChat } from "@/features/chat";
  ```
- [ ] Use in component:
  ```typescript
  const { sendMessage, loading, response } = useChat();
  ```
- [ ] Send messages programmatically
- [ ] Receive responses

---

## 🔧 Troubleshooting Checklist

If something doesn't work, check these:

### API Key Issues

- [ ] Key is in `.env` file (backend) / `.env.local` (frontend)
- [ ] Key starts with `sk-or-v1-`
- [ ] Key is not truncated or has typos
- [ ] Key is active on OpenRouter.ai
- [ ] Account has credits

### Connection Issues

- [ ] Backend is running: `curl http://localhost:3001/health`
- [ ] Frontend is running: `curl http://localhost:3000`
- [ ] No firewall blocking ports 3000/3001
- [ ] CORS is configured in `server.ts`

### File Issues

- [ ] All files created in correct locations
- [ ] Import paths are correct
- [ ] No circular dependencies
- [ ] TypeScript compiles without errors

### Runtime Issues

- [ ] Check browser console for errors
- [ ] Check browser network tab (Network > Fetch/XHR)
- [ ] Check backend terminal for errors
- [ ] Check frontend terminal for warnings

---

## ✨ Feature Verification Checklist

Once basic setup works, verify features:

### Chat Message Feature

- [ ] Can type in chat input
- [ ] Message appears as user bubble
- [ ] AI response appears as assistant bubble
- [ ] Loading spinner shows while waiting
- [ ] Error message shows on failure

### Room Recommendations Feature

- [ ] Can request recommendations
- [ ] Results are formatted properly
- [ ] Takes relevant factors into account

### Room Analysis Feature

- [ ] Can analyze a room
- [ ] Analysis includes: suitability score, value, concerns, recommendations
- [ ] Takes user preferences into account

### Streaming Feature

- [ ] Message streaming works (if implemented)
- [ ] Text appears character by character
- [ ] Better UX for long responses

---

## 📊 Performance Checklist

- [ ] API response time < 10 seconds
- [ ] No memory leaks in frontend
- [ ] No console warnings
- [ ] Chat loads instantly
- [ ] UI is responsive while loading

---

## 🚀 Deployment Checklist

When ready to deploy:

- [ ] Production API key is secure (use env vars)
- [ ] OpenRouter API key is not in code
- [ ] Error handling is comprehensive
- [ ] Rate limiting is considered
- [ ] Cost monitoring is in place
- [ ] Logging is enabled

---

## 📝 Documentation Checklist

- [ ] README updated with chat feature
- [ ] API documentation created
- [ ] Frontend component props documented
- [ ] Hook usage documented
- [ ] Examples provided for common uses

---

## ✅ Final Sign-Off

When all checkboxes are marked:

```
✅ Backend API is working
✅ Frontend can communicate with API
✅ ChatWidget component is functional
✅ All features are tested
✅ No errors or warnings
✅ Ready for production
```

---

## 🎯 What's Next

Once verified, you can:

1. **Integrate into pages** - Add ChatWidget to room listings, profile, etc.
2. **Add to chat history** - Save conversations to database
3. **Add user authentication** - Link chat to user accounts
4. **Monitor usage** - Track API calls and costs
5. **Improve prompts** - Fine-tune AI responses for your domain
6. **Add feedback** - Let users rate AI responses

---

## ❓ Questions & Support

If you get stuck:

1. Check `CHAT_IMPLEMENTATION_COMPLETE.md` for detailed docs
2. Review `OPENROUTER_INTEGRATION.md` for API details
3. Check browser console for errors
4. Try the test script: `bash test-chat-api.sh`
5. Verify `.env` files are correct

Good luck! 🚀
