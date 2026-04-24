# UniLodge Platform Architecture

## Introduction

UniLodge is an intelligent accommodation booking platform designed for university students. It connects guests seeking accommodation with wardens (property managers) offering rooms, powered by AI-driven recommendations and smart matching algorithms.

**Key Features:**

- 🏨 Room browsing with advanced filtering
- 📅 Smart availability checking across date ranges
- 🤖 AI-powered room recommendations
- 💬 Conversational AI assistant
- 📊 Analytics dashboards for wardens and admins
- 🔐 Role-based access control (Guest, Warden, Admin)
- 💳 Integrated payment processing
- ⭐ Room reviews and ratings

## Technology Overview

### Frontend Application

- **Framework**: Next.js 14 with React 19
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API**: REST with custom fetch client
- **Testing**: Vitest + Playwright
- **Port**: 3000

### Backend API Service

- **Framework**: Express.js with TypeScript
- **Database**: MongoDB (Atlas)
- **Authentication**: JWT
- **Validation**: Zod schemas
- **Testing**: Vitest + integration tests
- **Port**: 3001

### AI Engine Service

- **Framework**: Node.js with TypeScript
- **AI Platform**: Hugging Face Hub
- **Models**: Text generation, embeddings
- **Port**: 5000 (internal)

### Deployment

- **Frontend**: Static hosting (Vercel, Netlify, S3+CloudFront)
- **Backend**: Node.js server (Heroku, AWS EC2, Railway)
- **Database**: MongoDB Atlas (managed)
- **CI/CD**: GitHub Actions or similar

---

## Architecture Diagrams

### Quick Navigation

| Diagram                                             | Purpose                                 |
| --------------------------------------------------- | --------------------------------------- |
| [ER Diagram](./diagrams/ER_DIAGRAM.md)              | Database schema and relationships       |
| [Class Diagram](./diagrams/CLASS_DIAGRAM.md)        | Service/controller architecture         |
| [Sequence Diagrams](./diagrams/SEQUENCE_DIAGRAM.md) | Workflow interactions and message flows |
| [System Architecture](./SYSTEM_ARCHITECTURE.md)     | Overall system design and interactions  |

---

## Component Documentation

### Frontend Application

**[Frontend Guide →](./FRONTEND.md)**

Covers:

- Project structure and organization
- Key components and pages
- State management with Zustand
- API integration and endpoints
- Form validation with Zod
- Testing strategies (unit, integration, E2E)
- Styling and theming
- Performance optimization
- Common issues and solutions

### Backend API Service

**[Backend Guide →](./BACKEND.md)**

Covers:

- Project structure and organization
- Complete API endpoint reference
- Authentication and authorization (JWT + RBAC)
- Service layer architecture
- Database models and schemas
- Input validation and error handling
- Testing strategies
- Performance and indexing
- Deployment checklist

### AI Engine Service

**[AI Engine Guide →](./AI_ENGINE.md)**

Covers:

- Service architecture
- Recommendation algorithm
- Preference analysis and embedding
- Chat and conversational AI
- Integration with backend
- Hugging Face model selection
- Performance optimization
- Testing and evaluation
- Future enhancement roadmap

---

## Data Flow & Communication

### Request-Response Cycle

```
1. User Interaction (Frontend)
   ↓
2. Validation (Zod schema)
   ↓
3. HTTP Request to Backend
   {GET /api/rooms?filters...}
   {POST /api/bookings with JWT}
   ↓
4. Backend Processing
   - Authenticate (JWT verification)
   - Authorize (RBAC checks)
   - Validate (Zod schema)
   - Business Logic (Services)
   ↓
5. Database Operation (MongoDB)
   - Query/Insert/Update/Delete
   - Use indices for performance
   ↓
6. Response Generation
   - Format data
   - Status code
   - Error handling
   ↓
7. Frontend Receives & Updates
   - Parse JSON response
   - Update state (Zustand)
   - Re-render components
   ↓
8. User Sees Update
```

### Async Operations (AI Recommendations)

```
Frontend: "Get Recommendations"
   ↓
Backend: /api/chat/recommendations?userId=xxx
   ↓
Calls AI Engine (internal): POST http://localhost:5000/api/recommendations
   ↓
AI Engine Analysis:
   - Load user booking history
   - Extract preferences
   - Score available rooms
   - Apply collaborative filtering
   ↓
Returns Top N Recommendations
   ↓
Backend aggregates with room details
   ↓
Frontend displays cards
```

---

## User Workflows

### 1. Guest Booking Flow

```
Register/Login
   ↓
Browse Rooms (with filters)
   ↓
View Room Details (with reviews)
   ↓
Select Dates & Create Booking Request
   ↓
Warden Reviews → Notification to guest
   ↓
Booking Confirmed → Process Payment
   ↓
Check In (day of arrival)
   ↓
Stay Period
   ↓
Check Out & Leave Review
```

### 2. Warden Management Flow

```
Register as Warden
   ↓
Create Room (with photos, amenities, price)
   ↓
Room Submitted for Admin Approval (status: pending)
   ↓
Admin Approves → Room Listed (status: approved)
   ↓
Edit Room Details (pricing, amenities)
   ↓
Receive Booking Requests (notifications)
   ↓
Review & Confirm Bookings
   ↓
Track Guest Check-ins/Check-outs
   ↓
View Occupancy Analytics
```

### 3. Admin Review Flow

```
Login to Admin Dashboard
   ↓
Review Pending Room Submissions
   ↓
Approve/Reject Rooms → Send notifications
   ↓
View System-wide Analytics
   - Occupancy rates
   - Revenue metrics
   - Popular rooms
   - User demographics
   ↓
Manage Reported Issues
   ↓
Monitor System Health
```

---

## Security Architecture

### Authentication & Authorization

```
Login Request
   ↓ (verify email + password)
Generate JWT Tokens:
   - accessToken (15 min expiry) - for API calls
   - refreshToken (7 days) - for token refresh
   ↓
Client stores tokens in localStorage
   ↓
All API requests include JWT:
   Authorization: Bearer {accessToken}
   ↓
Server validates token:
   - Check signature
   - Verify expiry
   - Extract user ID and role
   ↓
Enforce Role-Based Access Control:
   - GUEST: Can browse rooms, create bookings
   - WARDEN: Can manage rooms, view occupancy
   - ADMIN: Full system access, approve rooms
   ↓
Token expiry:
   - Use refreshToken to get new accessToken
   - Or redirect to login if refreshToken expired
```

### Input Validation

```
Request Arrives
   ↓
Validate with Zod schema:
  ✓ Required fields present
  ✓ Types correct (string, number, date)
  ✓ Format correct (email, URL, regex)
  ✓ Custom rules (date ranges, price limits)
   ↓
If valid:
  Process request → Success response
   ↓
If invalid:
  Return 400 Bad Request with error details
  e.g., { error: 'Validation failed', fields: { email: 'Invalid email' } }
```

---

## Database Schema Overview

### Key Collections

**Users**

- Stores user profiles (name, email, role)
- Role determines permissions: ADMIN, WARDEN, GUEST
- Password hashed with bcrypt before storage

**Rooms**

- Property listings created by wardens
- Status: pending (awaiting approval) → approved → available for booking
- Tracks amenities, capacity, pricing, ratings

**Bookings**

- Transactions between guests and rooms
- Status: Pending → Confirmed → Completed
- Payment tracking: unpaid → paid
- Check-in/check-out timestamps

**Reviews**

- Guest feedback after completed bookings
- Rating (1-5) and comments
- Used to calculate room's aggregate rating

**Notifications**

- Event notifications for users
- Types: booking requests, approvals, rejections
- Mark as read for notification center

**Other**

- BookingRequest: Pre-booking inquiries
- Contact: Public contact form submissions

---

## Performance Optimization

### Frontend

- Image optimization with `next/image`
- Code splitting and lazy loading
- Response caching with React Query
- Tailwind CSS for minimal CSS
- Efficient state management with Zustand

### Backend

- Database indexing on frequently queried fields
- Pagination to limit result sets
- Aggregation pipelines for analytics
- JWT caching to avoid repeated validation
- CORS configuration for specific origins

### AI Engine

- Embedding result caching
- Model inference optimization
- Batch processing for requests
- Rate limiting with exponential backoff

---

## Monitoring & Alerts

### Key Metrics

| Metric                  | Threshold     | Alert           |
| ----------------------- | ------------- | --------------- |
| API Response Time       | > 2 seconds   | Page slowness   |
| Database Query Time     | > 1 second    | Slow query      |
| Error Rate              | > 1%          | High error rate |
| Authentication Failures | > 10 in 5 min | Possible attack |
| Service Availability    | < 99%         | Downtime        |
| Memory Usage            | > 80%         | Resource issue  |

### Logging

```
Application Logs:
- Entry point: auth, API calls, errors
- Level: INFO (general), WARN (potential issue), ERROR (failure)
- Destination: Console (dev), File/Service (prod)

Examples:
[INFO] User login successful: user@example.com
[WARN] Slow database query (1.2s): Room.find({ type: 'Double' })
[ERROR] Payment processing failed: stripe_error_code
```

---

## Deployment Strategy

### Development Environment

```
Frontend: localhost:3000
Backend: localhost:3001
Database: MongoDB connection (local or Atlas dev)
AI Engine: localhost:5000
```

### Production Environment

```
Frontend: Deployed to CDN (Vercel, S3, etc.)
Backend: Running on server/container (Heroku, EC2, Railway, etc.)
Database: MongoDB Atlas production instance
AI Engine: Internal service on backend server or separate instance
```

### CI/CD Pipeline

```
1. Push to main/develop branch
2. Automated tests run (unit, integration, E2E)
3. TypeScript type check
4. Build production bundle
5. Deploy to staging (if tests pass)
6. Run smoke tests on staging
7. Deploy to production
8. Verify deployment with health checks
```

---

## Getting Started

### Quick Setup

1. **Clone Repository**

   ```bash
   git clone <repo-url>
   cd unilodge-v2
   ```

2. **Install Dependencies**

   ```bash
   npm install
   npm install --workspaces
   ```

3. **Configure Environment**

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env
   cp apps/ai-engine/.env.example apps/ai-engine/.env
   # Edit files with your API keys and database URLs
   ```

4. **Start Services**

   ```bash
   # Terminal 1: Backend
   cd apps/backend && npm run dev

   # Terminal 2: Frontend
   cd apps/frontend && npm run dev

   # Terminal 3: AI Engine (optional)
   cd apps/ai-engine && npm run dev
   ```

5. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api/\*
   - AI Engine: http://localhost:5000 (internal)

### Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

### Building for Production

```bash
# Build all apps
npm run build

# Run production server
npm start
```

---

## Further Reading

- [Frontend Detailed Guide](./FRONTEND.md) - Components, state management, testing
- [Backend Detailed Guide](./BACKEND.md) - API endpoints, services, authentication
- [AI Engine Detailed Guide](./AI_ENGINE.md) - Recommendations, embeddings, chat
- [ER Diagram](./diagrams/ER_DIAGRAM.md) - Database schema
- [Class Diagram](./diagrams/CLASS_DIAGRAM.md) - Service architecture
- [Sequence Diagrams](./diagrams/SEQUENCE_DIAGRAM.md) - Workflow interactions
- [System Architecture](./SYSTEM_ARCHITECTURE.md) - Overall system design

---

## Tech Stack Summary

| Category     | Technology   | Version          |
| ------------ | ------------ | ---------------- |
| **Frontend** | Next.js      | 14.2.35          |
|              | React        | 19.0.0           |
|              | Tailwind CSS | 3.4.0            |
|              | TypeScript   | 5.x              |
| **Backend**  | Express.js   | 4.x              |
|              | Node.js      | 22.x             |
|              | MongoDB      | Latest (Atlas)   |
|              | Mongoose     | 8.x              |
|              | JWT          | jsonwebtoken 9.x |
| **AI**       | Hugging Face | API              |
|              | TypeScript   | 5.x              |
| **Testing**  | Vitest       | Latest           |
|              | Playwright   | Latest           |
| **Build**    | TypeScript   | 5.x              |
|              | Tailwind CSS | 3.4.0            |

---

## Contributing Guidelines

1. Create feature branch from `main`
2. Write tests for new features
3. Ensure type checking passes: `npm run type-check`
4. Run linter: `npm run lint`
5. Commit with meaningful messages
6. Create pull request with description
7. Await code review before merge

---

## License & Support

For questions or issues, refer to the [Backend](./BACKEND.md), [Frontend](./FRONTEND.md), or [AI Engine](./AI_ENGINE.md) guides, or reach out to the development team.

**Last Updated**: April 2024
**Architecture Version**: 1.0
**Status**: Production Ready
