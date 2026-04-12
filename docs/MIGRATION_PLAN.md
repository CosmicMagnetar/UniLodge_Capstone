# UniLodge Migration Plan: Monolith → Serverless Architecture

## PHASE 1: DEEP ANALYSIS & COMPONENT MAPPING

### 1.1 Current Architecture (./unilodge)

#### Frontend Layer

| Component          | Type             | Count                        | Target Location                       |
| ------------------ | ---------------- | ---------------------------- | ------------------------------------- |
| Pages              | React Components | 13                           | `/apps/frontend/app/[pages]`          |
| UI Components      | React Components | 24+                          | `/apps/frontend/components`           |
| Feature Components | Specialized      | 8                            | `/apps/frontend/components/[feature]` |
| Contexts           | React Context    | 1 (ThemeContext)             | `/apps/frontend/context`              |
| Hooks              | Custom Hooks     | 1 (useToast)                 | `/apps/frontend/hooks`                |
| Services           | API Client       | 2 (api.ts, geminiService.ts) | `/apps/frontend/lib/services`         |
| Utilities          | Helpers          | 1 (permissions.ts)           | `/apps/frontend/lib/utils`            |
| Styling            | Tailwind + CSS   | Global                       | `/apps/frontend/styles`               |

**Frontend Analysis:**

- **Tech Stack:** React 19.2 + Vite + Tailwind CSS
- **State Management:** React hooks + localStorage
- **Authentication:** JWT token in localStorage
- **API Calls:** Fetch-based with custom client (api.ts)
- **Real-time:** None currently
- **Forms & Validation:** Custom implementations
- **Goal:** Migrate to Next.js 14+ with App Router, Server Components, Supabase client

#### Backend Layer

| Module      | Type             | Count | Target Location           |
| ----------- | ---------------- | ----- | ------------------------- |
| Routes      | Express Handlers | 7     | Supabase Edge Functions   |
| Controllers | Business Logic   | 6     | Functions logic           |
| Models      | Mongoose Schemas | 7     | PostgreSQL migrations     |
| Middleware  | Auth/Error       | 2     | RLS policies + middleware |
| Config      | Database Setup   | 1     | Supabase config           |
| Scripts     | Utilities        | 8     | Supabase seed scripts     |

**Backend Analysis:**

- **Current Tech:** Express 4.21 + Mongoose 8.19 + MongoDB
- **Database:** 7 collections with relationships
- **Authentication:** JWT + bcryptjs
- **Validation:** Zod schemas
- **Models:**
  1. **User** - id, name, email, password, role (GUEST|ADMIN|WARDEN), createdAt
  2. **Room** - roomNumber, type (Single|Double|Suite), price, amenities, rating, imageUrl, isAvailable, university, description, capacity
  3. **Booking** - roomId, userId, checkInDate, checkOutDate, status (Confirmed|Pending|Cancelled), paymentStatus, totalPrice
  4. **BookingRequest** - roomId, userId, checkInDate, checkOutDate, message, status, warden details
  5. **Review** - userId, roomId, rating, comment
  6. **Contact** - name, email, subject, message, status
  7. **Notification** - userId, message, type, read status, createdAt

**Backend Migration Strategy:**

- MongoDB schemas → PostgreSQL migrations (using Drizzle-ORM or raw SQL)
- Express controllers → Supabase Edge Functions (Deno-based)
- JWT + bcrypt → Supabase Auth (built-in)
- Mongoose validation → Zod schemas in Edge Functions
- Database seeding → Supabase CLI seed scripts

#### AI/ML Layer

| Component               | Purpose              | Current Tech                           | Target Tech                               |
| ----------------------- | -------------------- | -------------------------------------- | ----------------------------------------- |
| Price Suggestion Engine | Dynamic pricing      | OpenRouter API (arcee-ai/trinity-mini) | Hugging Face Inference (HF_INFERENCE_API) |
| Chat Assistant          | Customer support bot | OpenRouter streaming                   | Hugging Face Inference with streaming     |
| System Prompts          | AI behavior control  | Hardcoded in geminiService.ts          | `/apps/ai-engine/prompts`                 |

**AI Analysis:**

- **Current:** Frontend directly calls OpenRouter API
- **Current Flow:** geminiService.ts → OpenRouter → LLM response
- **Issues:**
  - API key exposed in frontend
  - No RAG or knowledge base
  - No logging/monitoring
  - Rate limiting client-side only

**AI Migration Strategy:**

- API key → Supabase Edge Function (server-side)
- OpenRouter → Hugging Face Inference API (free tier available)
- New: Implement prompt versioning in `/apps/ai-engine/prompts`
- New: Add RAG support for room recommendations
- New: Implement cost tracking per request

---

### 1.2 Database Schema Mapping

#### Current MongoDB Collections → PostgreSQL Tables

```
MongoDB: users
├─ _id: ObjectId
├─ name: String
├─ email: String (unique)
├─ password: String (hashed)
├─ role: String (GUEST|ADMIN|WARDEN)
├─ createdAt: Date

PostgreSQL: auth.users (Supabase)
├─ id: UUID
├─ email: String (unique)
└─ metadata: { name, role }

PostgreSQL: public.user_profiles
├─ id: UUID (FK auth.users.id)
├─ full_name: String
├─ role: TEXT (GUEST|ADMIN|WARDEN)
├─ created_at: TIMESTAMP

---

MongoDB: rooms
├─ _id: ObjectId
├─ roomNumber: String
├─ type: String (Single|Double|Suite)
├─ price: Number
├─ amenities: [String]
├─ rating: Number
├─ imageUrl: String
├─ isAvailable: Boolean
├─ university: String
├─ description: String
├─ capacity: Number

PostgreSQL: public.rooms
├─ id: UUID
├─ room_number: VARCHAR
├─ type: ENUM (Single|Double|Suite)
├─ base_price: DECIMAL
├─ amenities: TEXT[] (or JSON)
├─ rating: FLOAT
├─ image_url: VARCHAR
├─ is_available: BOOLEAN
├─ university: VARCHAR
├─ description: TEXT
├─ capacity: INT
├─ created_at: TIMESTAMP
├─ updated_at: TIMESTAMP

---

MongoDB: bookings
├─ _id: ObjectId
├─ roomId: ObjectId (ref: rooms)
├─ userId: ObjectId (ref: users)
├─ checkInDate: Date
├─ checkOutDate: Date
├─ status: String (Confirmed|Pending|Cancelled)
├─ paymentStatus: String (paid|pending|failed)
├─ totalPrice: Number

PostgreSQL: public.bookings
├─ id: UUID
├─ room_id: UUID (FK rooms.id)
├─ user_id: UUID (FK auth.users.id)
├─ check_in_date: DATE
├─ check_out_date: DATE
├─ status: ENUM (Confirmed|Pending|Cancelled)
├─ payment_status: ENUM (paid|pending|failed)
├─ total_price: DECIMAL
├─ created_at: TIMESTAMP
└─ updated_at: TIMESTAMP

(Similar mappings for: booking_requests, reviews, contacts, notifications)
```

---

### 1.3 API Endpoint Mapping

#### Current Express Routes → Next.js API Routes / Supabase Edge Functions

```
Current: POST /api/auth/register
→ Next.js: Supabase Auth signup
→ Function: pages/api/auth/signup.ts
→ Backend: Supabase Auth (built-in)

Current: POST /api/auth/login
→ Next.js: Supabase Auth signin
→ Function: pages/api/auth/signin.ts
→ Backend: Supabase Auth (built-in)

Current: GET /api/rooms
→ Next.js: Server Component + Supabase RLS
→ Function: app/api/rooms/route.ts
→ Backend: Edge Function with Supabase client

Current: POST /api/bookings
→ Next.js: Server Action
→ Function: app/actions/bookings.ts
→ Backend: Edge Function with transaction safety

Current: GET /api/analytics
→ Next.js: Cached API route
→ Function: app/api/analytics/route.ts
→ Backend: Supabase Realtime subscriptions (future)

(All AI endpoints now server-side in Edge Functions)
```

---

### 1.4 Frontend Architecture Transformation

#### Current: React SPA (Vite)

```
index.tsx → App.tsx → pages + components
└─ localStorage token
└─ Direct fetch to Backend
└─ Frontend renders all HTML
```

#### Target: Next.js Full-Stack

```
app/layout.tsx (Server Component)
├─ app/page.tsx (HomePage)
├─ app/login/page.tsx
├─ app/dashboard/page.tsx
├─ app/(auth)/page.tsx
├─ app/api/[routes] (Edge Functions)
└─ components/ (Client Components)
    ├─ <ServerComponent/> (data fetching)
    └─ <ClientComponent/> (interactivity)
```

**Benefits:**

- Server-side rendering for SEO
- Reduced JavaScript shipped to client
- Automatic code splitting
- Built-in image optimization
- Built-in font optimization
- Streaming HTML responses

---

### 1.5 AI Integration Architecture

#### Current Architecture

```
Frontend (React)
  ├─ geminiService.ts
  │   └─ OpenRouter API call
  │       └─ LLM response
  └─ Display result
```

**Issues:** API key in frontend, no RAG, no audit trail.

#### Target Architecture

```
Frontend (Next.js)
  └─ Server Action or API Route
      └─ Edge Function (Supabase)
          ├─ Prompt management
          ├─ RAG retrieval (Hugging Face embeddings)
          ├─ Hugging Face Inference API call
          ├─ Response validation
          ├─ Cost tracking
          └─ Return to frontend
```

**New Features:**

- ✅ Server-side API key management
- ✅ Prompt versioning (/apps/ai-engine/prompts/)
- ✅ RAG module for context-aware recommendations
- ✅ Request logging and monitoring
- ✅ Rate limiting per user
- ✅ Cost tracking per feature

---

## PHASE 2: ARCHITECTURE RATIONALE

### Why Serverless Modular Monolith?

| Aspect                   | Benefit                                                        |
| ------------------------ | -------------------------------------------------------------- |
| **Deployment**           | Each app deploys independently to Vercel/Supabase/Hugging Face |
| **Scalability**          | Automatic scaling per component; pay per execution time        |
| **Cost**                 | Lower operational overhead; free tiers available               |
| **Developer Experience** | Simple local dev with Docker/Supabase CLI; familiar tooling    |
| **Migration Path**       | Easy to extract microservices if needed                        |
| **Collaboration**        | Clear module boundaries for Krishna, Kavya, Aditya Rana        |

### Tech Stack Decisions

| Layer          | Technology             | Reason                                                            |
| -------------- | ---------------------- | ----------------------------------------------------------------- |
| **Frontend**   | Next.js 14+            | Full-stack React; Vercel integration; RSC; built-in optimizations |
| **Backend**    | Supabase               | PostgreSQL + Auth + RLS + Edge Functions; free tier; simple       |
| **AI**         | Hugging Face Inference | Free tier; open-source models; better than closed APIs            |
| **ORM**        | Drizzle-ORM            | Type-safe, lightweight, great for Edge Functions                  |
| **Validation** | Zod                    | Runtime validation; TypeScript-first; small bundle                |
| **Testing**    | Vitest + Playwright    | Fast, modern, plays well with Next.js                             |

---

## PHASE 3: DIRECTORY STRUCTURE FOR unilodge-v2

```
unilodge-v2/
│
├── apps/
│   │
│   ├── frontend/                    # Next.js App Router (Target: Vercel)
│   │   ├── app/
│   │   │   ├── layout.tsx          # Root layout (RootLayout)
│   │   │   ├── page.tsx            # HomePage
│   │   │   ├── (auth)/             # Auth group
│   │   │   │   ├── login/
│   │   │   │   ├── signup/
│   │   │   │   └── forgot-password/
│   │   │   ├── (dashboard)/        # Dashboard group
│   │   │   │   ├── guest/
│   │   │   │   ├── admin/
│   │   │   │   └── warden/
│   │   │   ├── bookings/
│   │   │   ├── api/                # API routes + Edge Functions
│   │   │   │   ├── auth/
│   │   │   │   ├── rooms/
│   │   │   │   ├── bookings/
│   │   │   │   ├── ai/
│   │   │   │   └── analytics/
│   │   │   └── error.tsx           # Error boundary
│   │   ├── components/
│   │   │   ├── ui/                 # Base UI components
│   │   │   ├── layout/
│   │   │   ├── dashboard/
│   │   │   ├── booking/
│   │   │   ├── chat/               # AI Chat component
│   │   │   └── forms/
│   │   ├── lib/
│   │   │   ├── supabase.ts         # Supabase client
│   │   │   ├── api-client.ts       # Fetch wrapper
│   │   │   ├── services/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── rooms.ts
│   │   │   │   └── bookings.ts
│   │   │   └── utils/
│   │   ├── actions/                # Server Actions
│   │   │   ├── auth.ts
│   │   │   ├── bookings.ts
│   │   │   └── rooms.ts
│   │   ├── hooks/                  # Custom hooks
│   │   ├── context/                # React context (Provider components)
│   │   ├── styles/                 # Global CSS
│   │   ├── types/                  # Frontend-specific types
│   │   ├── public/
│   │   ├── .env.example
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── next.config.js
│   │   └── tailwind.config.ts
│   │
│   ├── backend/                    # Supabase Edge Functions (Target: Supabase)
│   │   ├── functions/              # Deno Edge Functions
│   │   │   ├── auth/
│   │   │   ├── rooms/
│   │   │   ├── bookings/
│   │   │   ├── ai/                 # AI API wrapper
│   │   │   └── analytics/
│   │   ├── migrations/             # PostgreSQL migrations
│   │   │   ├── 001_init_schema.sql
│   │   │   ├── 002_users.sql
│   │   │   ├── 003_rooms.sql
│   │   │   ├── 004_bookings.sql
│   │   │   ├── 005_reviews.sql
│   │   │   ├── 006_contacts.sql
│   │   │   └── 007_notifications.sql
│   │   ├── seeds/
│   │   │   └── initial_data.sql
│   │   ├── policies/               # Row-Level Security (RLS)
│   │   │   ├── auth.sql
│   │   │   ├── rooms.sql
│   │   │   └── bookings.sql
│   │   ├── types/                  # TypeScript types for functions
│   │   ├── lib/                    # Shared backend utilities
│   │   │   ├── database.ts
│   │   │   ├── validators.ts
│   │   │   └── middleware.ts
│   │   ├── supabase/               # Supabase config
│   │   │   └── config.ts
│   │   ├── .env.example
│   │   ├── deno.json
│   │   └── README.md
│   │
│   └── ai-engine/                  # Hugging Face Integration (Target: Hugging Face)
│       ├── src/
│       │   ├── prompts/            # Prompt management
│       │   │   ├── price-suggestion.ts
│       │   │   ├── chat-assistant.ts
│       │   │   ├── room-recommendation.ts
│       │   │   └── index.ts
│       │   ├── services/           # AI provider abstraction
│       │   │   ├── huggingface.ts  # HF Inference wrapper
│       │   │   ├── embeddings.ts   # Vector embeddings
│       │   │   ├── rag.ts          # RAG logic
│       │   │   └── index.ts
│       │   ├── models/             # Response types
│       │   │   ├── price.ts
│       │   │   ├── chat.ts
│       │   │   └── index.ts
│       │   ├── utils/              # Token counting, parsing
│       │   │   ├── token-counter.ts
│       │   │   ├── response-parser.ts
│       │   │   └── rate-limiter.ts
│       │   └── types/              # AI-specific interfaces
│       │       └── index.ts
│       ├── tests/
│       │   ├── prompts.test.ts
│       │   └── services.test.ts
│       ├── .env.example
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── packages/
│   │
│   └── shared/                     # Shared types & constants
│       ├── src/
│       │   ├── types/
│       │   │   ├── user.ts
│       │   │   ├── room.ts
│       │   │   ├── booking.ts
│       │   │   ├── ai.ts
│       │   │   └── index.ts
│       │   ├── schemas/             # Zod validation schemas
│       │   │   ├── auth.ts
│       │   │   ├── rooms.ts
│       │   │   ├── bookings.ts
│       │   │   └── index.ts
│       │   ├── constants/
│       │   │   ├── roles.ts
│       │   │   ├── statuses.ts
│       │   │   ├── api-endpoints.ts
│       │   │   └── error-messages.ts
│       │   └── utils/
│       │       └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── tests/
│   ├── unit/
│   │   ├── frontend/
│   │   │   └── components.test.tsx
│   │   ├── backend/
│   │   │   ├── auth.test.ts
│   │   │   ├── rooms.test.ts
│   │   │   └── bookings.test.ts
│   │   └── ai-engine/
│   │       └── prompts.test.ts
│   ├── integration/
│   │   ├── booking-flow.test.ts
│   │   ├── auth-flow.test.ts
│   │   └── ai-integration.test.ts
│   └── e2e/
│       ├── user-journey.spec.ts
│       └── admin-dashboard.spec.ts
│
├── docs/
│   ├── README.md                   # Main architecture guide
│   ├── SETUP.md                    # Onboarding (Krishna, Kavya, Aditya Rana)
│   ├── DEPLOYMENT.md               # Deployment to Vercel/Supabase
│   ├── API.md                      # Backend API documentation
│   ├── diagrams/
│   │   ├── system-architecture.md  # Mermaid diagram
│   │   ├── sequence-flow.md        # User → Vercel → Supabase → HF
│   │   ├── database-schema.md      # PostgreSQL ER diagram
│   │   └── deployment.md           # CI/CD pipeline
│   ├── guides/
│   │   ├── frontend-dev.md         # For Kavya
│   │   ├── backend-dev.md          # For Aditya Rana
│   │   └── ai-integration.md       # For Krishna
│   └── migration/
│       ├── mongodb-to-postgres.md
│       └── express-to-edgefunctions.md
│
├── docker/
│   ├── docker-compose.yml          # Local Supabase + frontend
│   ├── Dockerfile.frontend
│   └── Dockerfile.backend (edge functions)
│
├── .github/
│   └── workflows/
│       ├── ci.yml                  # Test on PR
│       ├── deploy-frontend.yml     # Deploy frontend to Vercel
│       ├── deploy-backend.yml      # Deploy migrations to Supabase
│       └── deploy-ai.yml           # Publish to Hugging Face
│
├── .gitignore
├── .env.example                    # Root ENV template
├── package.json                    # Root monorepo (npm workspaces)
├── tsconfig.base.json              # Shared TypeScript config
└── README.md                       # Root documentation
```

---

## PHASE 4: IMPLEMENTATION SUMMARY

### Team Responsibilities

| Team Member               | Module                               | Technology                                        | Key Files                                   |
| ------------------------- | ------------------------------------ | ------------------------------------------------- | ------------------------------------------- |
| **Kavya (Frontend)**      | `/apps/frontend`                     | Next.js 14, React 19, Tailwind, Supabase Client   | `app/layout.tsx`, `components/`, `actions/` |
| **Aditya Rana (Backend)** | `/apps/backend` + `/packages/shared` | Supabase, PostgreSQL, Edge Functions, Drizzle ORM | `migrations/`, `functions/`, `policies/`    |
| **Krishna (AI Engine)**   | `/apps/ai-engine`                    | Hugging Face Inference, RAG, Prompt Engineering   | `prompts/`, `services/`, `rag.ts`           |

### Deployment Pipeline

```
GitHub Push → GitHub Actions
    ├─ Kavya's commits → Vercel (Frontend)
    ├─ Aditya Rana's commits → Supabase (Migrations + Edge Functions)
    └─ Krishna's commits → Hugging Face / Supabase Edge Functions
```

---

## Next Steps

1. ✅ **Analysis Complete** - You now have the mapping of every component
2. 🚀 **Generate Skeleton** - Bash script creates entire directory tree
3. 📝 **Migrate Code** - Copy components with minimal refactoring
4. 🧪 **Setup Testing** - Configure Vitest + Playwright
5. 🚢 **Deploy** - Configure GitHub Actions for CI/CD

Ready to proceed with **Skeleton Generation** and **Documentation**?
