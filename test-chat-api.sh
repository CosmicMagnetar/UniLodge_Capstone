#!/bin/bash

# UniLodge Chat API Test Suite
# Tests all chat endpoints to verify setup

set -e

API_URL="http://localhost:3001/api"
HEADER_JSON="Content-Type: application/json"

echo "🧪 UniLodge Chat API Test Suite"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if API is running
echo "📍 Checking if API is running..."
if ! curl -s "$API_URL/../health" > /dev/null 2>&1; then
    echo -e "${RED}❌ API is not running on $API_URL${NC}"
    echo "Please start the backend with: npm run dev:backend"
    exit 1
fi
echo -e "${GREEN}✓ API is running${NC}"
echo ""

# Test 1: Send basic message
echo "Test 1: Send Basic Message"
echo "--------------------------"
RESPONSE=$(curl -s -X POST "$API_URL/chat/message" \
  -H "$HEADER_JSON" \
  -d '{"message":"What are the best features for a student room?"}')

if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Success${NC}"
    echo "Response: $(echo "$RESPONSE" | jq '.response' -r | head -c 100)..."
else
    echo -e "${RED}✗ Failed${NC}"
    echo "Error: $(echo "$RESPONSE" | jq '.error' -r)"
fi
echo ""

# Test 2: Send message with context
echo "Test 2: Send Message with Context"
echo "-----------------------------------"
RESPONSE=$(curl -s -X POST "$API_URL/chat/message" \
  -H "$HEADER_JSON" \
  -d '{"message":"Is this suitable?","context":"I need WiFi and budget is $500"}')

if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Success${NC}"
    echo "Response: $(echo "$RESPONSE" | jq '.response' -r | head -c 100)..."
else
    echo -e "${RED}✗ Failed${NC}"
    echo "Error: $(echo "$RESPONSE" | jq '.error' -r)"
fi
echo ""

# Test 3: Get room recommendations
echo "Test 3: Get Room Recommendations"
echo "---------------------------------"
RESPONSE=$(curl -s -X POST "$API_URL/chat/room-recommendations" \
  -H "$HEADER_JSON" \
  -d '{"budget":500,"preferences":["WiFi","Kitchen"],"location":"Downtown"}')

if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Success${NC}"
    echo "Recommendations: $(echo "$RESPONSE" | jq '.recommendations' -r | head -c 100)..."
else
    echo -e "${RED}✗ Failed${NC}"
    echo "Error: $(echo "$RESPONSE" | jq '.error' -r)"
fi
echo ""

# Test 4: Get available models
echo "Test 4: Get Available Models"
echo "-----------------------------"
RESPONSE=$(curl -s "$API_URL/chat/models")

if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Success${NC}"
    MODEL_COUNT=$(echo "$RESPONSE" | jq '.models | length')
    echo "Found $MODEL_COUNT available models"
    echo "Current model: $(echo "$RESPONSE" | jq '.currentModel' -r)"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "Error: $(echo "$RESPONSE" | jq '.error' -r)"
fi
echo ""

# Test 5: Analyze room
echo "Test 5: Analyze Room"
echo "--------------------"
RESPONSE=$(curl -s -X POST "$API_URL/chat/analyze-room" \
  -H "$HEADER_JSON" \
  -d '{
    "roomData": {
      "name": "Student Room A",
      "pricePerNight": 25,
      "capacity": 2,
      "amenities": ["WiFi", "Kitchen", "Bathroom"],
      "location": "Near campus"
    },
    "userProfile": {
      "budget": 500,
      "preferences": ["WiFi", "Kitchen"]
    }
  }')

if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Success${NC}"
    echo "Analysis: $(echo "$RESPONSE" | jq '.analysis' -r | head -c 100)..."
else
    echo -e "${RED}✗ Failed${NC}"
    echo "Error: $(echo "$RESPONSE" | jq '.error' -r)"
fi
echo ""

# Summary
echo "=================================="
echo "✅ All tests completed!"
echo ""
echo "📌 Next steps:"
echo "1. Check API responses above"
echo "2. Start frontend: npm run dev:frontend"
echo "3. Add ChatWidget to a page:"
echo "   import { ChatWidget } from '@/features/chat'"
echo "   export default function Page() {"
echo "     return <ChatWidget />"
echo "   }"
echo "4. Visit http://localhost:3000/your-page"
echo ""
echo "📚 Documentation:"
echo "- CHAT_IMPLEMENTATION_COMPLETE.md"
echo "- OPENROUTER_INTEGRATION.md"
echo "- SERVERS_RUNNING.md"
