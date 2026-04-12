# Setup Guide - UnilodgeV2 Onboarding

## 🎯 Quick Start (5 minutes)

```bash
# 1. Clone and install
cd unilodge-v2
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Start dev environment
npm run dev
```

**Frontend:** http://localhost:3000
**Backend (Supabase):** http://localhost:54322
**API Docs:** http://localhost:3000/api

---

## 🔧 Detailed Setup

### Step 1: Prerequisites

```bash
# Check Node version (need 18+)
node --version

# Install npm workspaces support (npm 7+)
npm --version

# Optional: Install Supabase CLI for backend development
npm install -g @supabase/cli

# Optional: Install Vercel CLI for frontend deployment
npm install -g vercel
```

### Step 2: Clone & Install

```bash
git clone https://github.com/your-org/unilodge-v2.git
cd unilodge-v2

# Install root dependencies
npm install

# This also installs dependencies in all workspaces:
# - apps/frontend
# - apps/backend
# - apps/ai-engine
# - packages/shared
```

### Step 3: Environment Configuration

#### `/apps/frontend/.env.local`

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Frontend API URL (optional, use Next.js API routes)
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Feature flags
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_PRICE_SUGGESTIONS=true
```

**How to get Supabase keys:**

1. Go to https://supabase.com → Create project
2. Copy `Project URL` and `Anon Public Key` from Settings → API
3. Paste into .env.local

#### `/apps/backend/.env.local`

```env
# Supabase Access
SUPABASE_ACCESS_TOKEN=sbp_xxxx... # From Supabase dashboard
SUPABASE_DB_PASSWORD=your-password
SUPABASE_PROJECT_ID=your-project
SUPABASE_PROJECT_URL=https://your-project.supabase.co

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-secret-key-here
```

#### `/apps/ai-engine/.env.local`

```env
# Hugging Face Configuration
HUGGING_FACE_API_KEY=hf_xxxx... # From https://huggingface.co/settings/tokens

# Model Selection
HF_MODEL_CHAT=HuggingFaceH4/zephyr-7b-beta
HF_MODEL_EMBEDDINGS=sentence-transformers/all-MiniLM-L6-v2

# Rate limiting
HF_RATE_LIMIT=100
HF_RATE_WINDOW_MS=60000
```

**How to get HF API key:**

1. Go to https://huggingface.co/settings/tokens
2. Create new token with `read` permission
3. Copy and paste into .env.local

### Step 4: Database Setup

```bash
# Navigate to backend
cd apps/backend

# Link to Supabase project (first time only)
supabase link --project-ref your-project-id

# Push migrations to your Supabase project
supabase db push

# Seed initial data (rooms, etc.)
supabase db seed ./seeds/01_initial_data.sql

# Verify schema was created
supabase db list
```

### Step 5: Run Development Server

```bash
# From project root
npm run dev

# This starts:
# - Frontend: http://localhost:3000
# - Backend: Supabase local (if running "supabase start")
# - AI Engine: Ready for use

# Or start each service individually:
npm run dev --workspace=@unilodge/frontend
npm run dev --workspace=@unilodge/backend
npm run dev --workspace=@unilodge/ai-engine
```

### Step 6: Verify Setup

Open browser and check:

- ✅ Frontend: http://localhost:3000 (should load home page)
- ✅ API Health: http://localhost:3000/api/health
- ✅ Supabase Dashboard: http://localhost:54322

---

## 👥 Team-Specific Setup

### For Kavya (Frontend Engineer)

```bash
# Install dependencies
cd apps/frontend && npm install

# Start Next.js dev server
npm run dev

# Open http://localhost:3000

# Useful commands:
npm run build      # Build for production
npm run lint       # Check code style
npm run test       # Run tests
```

**Frontend Stack:**

- Next.js 14 (App Router)
- React 19
- Tailwind CSS
- Supabase Client SDK
- Zod (validation)

**Key Files to Know:**

- `app/layout.tsx` - Root layout
- `app/page.tsx` - Home page
- `app/api/` - API routes
- `lib/supabase.ts` - Supabase client
- `components/` - Reusable components
- `actions/` - Server actions

### For Aditya Rana (Backend Engineer)

```bash
# Install dependencies
cd apps/backend && npm install

# Start Supabase local environment
supabase start

# Link to your Supabase project (production)
supabase link --project-ref your-project-id

# Push schema changes
supabase db push

# View database
supabase db list

# Deploy to production
supabase deploy
```

**Backend Stack:**

- Supabase (PostgreSQL)
- Edge Functions (Deno)
- Row-Level Security (RLS)
- Drizzle ORM (optional)

**Key Files to Know:**

- `migrations/` - SQL schema changes
- `functions/` - Edge Function handlers (Deno)
- `policies/` - RLS policies
- `seeds/` - Test data
- `lib/` - Shared utilities

**Migration Workflow:**

1. Create SQL file in `migrations/`
2. Test locally: `supabase db push`
3. Deploy: `supabase deploy`

### For Krishna (AI Engine & Project Manager)

```bash
# Install dependencies
cd apps/ai-engine && npm install

# Start development
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Publish to npm (optional)
npm publish
```

**AI Engine Stack:**

- Hugging Face Inference API
- Prompt Management System
- RAG (Retrieval-Augmented Generation)
- Embedding Models
- Rate Limiting

**Key Files to Know:**

- `src/prompts/index.ts` - System prompts
- `src/services/huggingface.ts` - HF API wrapper
- `src/services/rag.ts` - RAG retrieval logic
- `src/models/` - TypeScript interfaces
- `src/utils/` - Rate limiting, token counting

**Features to Implement:**

1. Price suggestion engine
2. Customer support chatbot
3. Room recommendation system
4. Embeddings & RAG backend

---

## 🗄️ Database Operations

### View Database Schema

```bash
cd apps/backend

# List all tables
supabase db list

# View table structure
supabase db execute \
  "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"

# View specific table
supabase db execute \
  "DESCRIBE public.rooms;"
```

### Seed Sample Data

```bash
cd apps/backend

# Run seed script
supabase db seed ./seeds/01_initial_data.sql

# Or manually insert:
supabase db execute "
  INSERT INTO public.rooms (room_number, type, base_price, university, capacity)
  VALUES ('101', 'Single', 150, 'MIT', 1)
"
```

### Reset Database (Development Only)

⚠️ **WARNING:** This deletes all data!

```bash
cd apps/backend
supabase db reset

# Or reset and reseed:
supabase db reset
supabase db seed ./seeds/01_initial_data.sql
```

---

## 🧪 Testing

### Run All Tests

```bash
npm run test
```

### Run Tests by Workspace

```bash
# Frontend tests
npm run test --workspace=@unilodge/frontend

# Backend tests
npm run test --workspace=@unilodge/backend

# AI Engine tests
npm run test --workspace=@unilodge/ai-engine
```

### E2E Testing (Playwright)

```bash
# Install Playwright browsers (first time)
npm install -D @playwright/test

# Run E2E tests
npm run test:e2e

# Run tests in UI mode
npm run test:e2e -- --ui

# Run specific test file
npm run test:e2e tests/e2e/booking-flow.spec.ts
```

---

## 🚀 Deployment

### Deploy Frontend to Vercel

```bash
cd apps/frontend

# Install Vercel CLI (if not already)
npm install -g vercel

# Deploy
vercel --prod

# Or connect GitHub repo to Vercel dashboard for auto-deployment
```

### Deploy Backend to Supabase

```bash
cd apps/backend

# Deploy migrations
supabase deploy

# Deploy Edge Functions
supabase functions deploy

# Check deployment status
supabase projects list
```

### Deploy AI Engine

The AI Engine is consumed as an npm package:

```bash
cd apps/ai-engine

# Build
npm run build

# Publish to npm
npm publish

# Other services will install via:
npm install @unilodge/ai-engine
```

---

## 🐛 Troubleshooting

### Issue: `NEXT_PUBLIC_SUPABASE_URL is undefined`

**Solution:** Check `.env.local` file in `/apps/frontend/` has correct keys

### Issue: `Port 3000 already in use`

**Solution:**

```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

### Issue: Database migrations fail

**Solution:**

```bash
# Check migration status
supabase migration list

# Reset and try again
supabase db reset
supabase db push

# View Supabase dashboard for errors
# https://supabase.com/dashboard
```

### Issue: AI API key not working

**Solution:**

1. Verify key in `.env.local`
2. Check key is valid at https://huggingface.co/settings/tokens
3. Check rate limits not exceeded
4. Try free model: `gpt2` or `distilgpt2`

---

## 📚 Additional Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Hugging Face API:** https://huggingface.co/docs/api-inference
- **Tailwind CSS:** https://tailwindcss.com/docs
- **PostgreSQL:** https://www.postgresql.org/docs/

---

## 🆘 Getting Help

1. Check documentation in `/docs/`
2. Search existing GitHub issues
3. Ask in team Slack channel
4. Schedule pair programming session

---

**Ready to build? Let's go! 🚀**
