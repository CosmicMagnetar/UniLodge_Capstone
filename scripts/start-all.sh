#!/bin/bash

# Start all services for UniLodge v2

echo "🚀 Starting UniLodge v2 Services..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create logs directory
mkdir -p logs

# Function to check if port is available
check_port() {
  local port=$1
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${RED}✗${NC} Port $port is already in use"
    return 1
  else
    echo -e "${GREEN}✓${NC} Port $port is available"
    return 0
  fi
}

# Function to start service
start_service() {
  local name=$1
  local command=$2
  local port=$3
  local log_file="logs/${name,,}.log"

  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}Starting ${name}...${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  if [ -n "$port" ]; then
    echo "Check port: $port"
    if ! check_port $port; then
      echo -e "${RED}Cannot start ${name}: Port $port is in use${NC}"
      return 1
    fi
  fi

  # Start service in background
  eval "$command" > "$log_file" 2>&1 &
  local pid=$!

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} ${name} started (PID: $pid)"
    echo "   Log file: $log_file"
    return 0
  else
    echo -e "${RED}✗${NC} Failed to start ${name}"
    cat "$log_file"
    return 1
  fi
}

# Pre-flight checks
echo -e "${YELLOW}Running pre-flight checks...${NC}"
echo ""

# Check Node.js
if command -v node &> /dev/null; then
  echo -e "${GREEN}✓${NC} Node.js $(node --version)"
else
  echo -e "${RED}✗${NC} Node.js not found"
  exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
  echo -e "${GREEN}✓${NC} npm $(npm --version)"
else
  echo -e "${RED}✗${NC} npm not found"
  exit 1
fi

# Check dependencies
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
fi

echo ""
echo -e "${YELLOW}Port availability checks:${NC}"
check_port 3000  # Frontend
check_port 3001  # Backend (if running locally)
check_port 8000  # AI Engine

echo ""
echo -e "${YELLOW}Starting services...${NC}"

# Start Frontend (Next.js on port 3000)
start_service "Frontend" "npm run dev --workspace=apps/web" 3000

# Small delay to avoid race conditions
sleep 2

# Start Backend (API on port 3000 via Vercel Functions, but we can start locally)
start_service "Backend" "npm run dev --workspace=apps/backend" 3001

# Small delay
sleep 2

# Start AI Engine
start_service "AI Engine" "npm run dev --workspace=apps/ai-engine" 8000

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}All services started!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Services running:"
echo -e "  ${GREEN}Frontend${NC}   : http://localhost:3000"
echo -e "  ${GREEN}Backend${NC}    : http://localhost:3001"
echo -e "  ${GREEN}AI Engine${NC}  : http://localhost:8000"
echo ""
echo "Log files:"
echo "  Frontend   : ./logs/frontend.log"
echo "  Backend    : ./logs/backend.log"
echo "  AI Engine  : ./logs/ai-engine.log"
echo ""
echo "To stop all services, run: npm run stop:all"
echo ""
echo "Useful commands:"
echo "  npm run test              - Run unit tests"
echo "  npm run test:integration  - Run integration tests"
echo "  npm run test:e2e          - Run E2E tests"
echo "  npm run lint              - Check code quality"
echo ""
