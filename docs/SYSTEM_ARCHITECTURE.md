# System Architecture Diagram

## Overall System Interaction

UniLodge is a three-tier monorepo application with separate frontend, backend, and AI engine services communicating through APIs and shared database.

```mermaid
graph TB
    subgraph Client["Client Layer"]
        Browser["Web Browser<br/>(localhost:3000)"]
    end

    subgraph Frontend["Frontend Application<br/>(Next.js + React)"]
        FE["Frontend Server<br/>Port 3000"]
        Pages["Pages<br/>- Login<br/>- Room Browse<br/>- Booking<br/>- Dashboard<br/>- Chat"]
        Components["Components<br/>- Authentication<br/>- Room Cards<br/>- Booking Modal<br/>- Chat Widget<br/>- Analytics Charts"]
        Services["Services<br/>- API Client<br/>- Gemini Chat<br/>- Auth Provider"]
    end

    subgraph Backend["Backend API<br/>(Express + TypeScript)"]
        BE["Backend Server<br/>Port 3001"]
        Controllers["Controllers<br/>- AuthController<br/>- RoomController<br/>- BookingController<br/>- AnalyticsController<br/>- ChatController"]
        Services["Services<br/>- AuthService<br/>- RoomService<br/>- BookingService<br/>- NotificationService<br/>- AnalyticsService"]
        Models["Data Models<br/>- User<br/>- Room<br/>- Booking<br/>- Review<br/>- Notification"]
        Routes["Routes<br/>/auth/*<br/>/rooms/*<br/>/bookings/*<br/>/analytics/*<br/>/chat/*"]
    end

    subgraph Database["Data Layer"]
        MongoDB["MongoDB Atlas<br/>(campusstays)<br/>- Users<br/>- Rooms<br/>- Bookings<br/>- Reviews<br/>- Notifications"]
    end

    subgraph AIEngine["AI Engine<br/>(Node.js + TypeScript)"]
        AI["AI Service<br/>Internal Service"]
        AIServices["AI Services<br/>- ChatService<br/>- RecommendationEngine<br/>- PreferenceAnalyzer<br/>- EmbeddingService"]
        HF["Hugging Face API<br/>- Text Generation<br/>- Embeddings<br/>- Classification"]
    end

    subgraph External["External Services"]
        Gemini["Google Gemini API<br/>(Chat & Analysis)"]
        PaymentAPI["Payment Gateway<br/>(Stripe/Square)"]
    end

    %% Client to Frontend
    Browser -->|HTTP/HTTPS| FE

    %% Frontend to Backend
    FE -->|HTTP Requests<br/>localhost:3001| BE
    BE -->|JSON Responses| FE

    %% Frontend to External
    Pages -->|REST/WebSocket| Gemini

    %% Backend Internal
    Routes -->|Route Handlers| Controllers
    Controllers -->|Service Calls| Services
    Services -->|CRUD Operations| Models
    Models -->|Queries/Mutations| MongoDB
    MongoDB -->|Data| Models

    %% Backend to Internal AI
    Services -->|HTTP Requests<br/>localhost:5000| AI
    AI -->|Response| Services

    %% AI Engine Internal
    AI -->|Service Calls| AIServices
    AIServices -->|API Calls| HF
    HF -->|Results| AIServices

    %% Backend to External Services
    Services -->|Payment Requests| PaymentAPI
    PaymentAPI -->|Webhooks| BE

    %% Database Access
    Services -->|Query| MongoDB

    %% Styling
    classDef client fill:#e1f5ff,stroke:#01579b
    classDef frontend fill:#f3e5f5,stroke:#4a148c
    classDef backend fill:#fff3e0,stroke:#e65100
    classDef database fill:#e8f5e9,stroke:#1b5e20
    classDef ai fill:#fce4ec,stroke:#880e4f
    classDef external fill:#ede7f6,stroke:#3f2c70

    class Client client
    class Frontend frontend
    class Backend backend
    class Database database
    class AIEngine ai
    class External external
```

## Data Flow Patterns

```mermaid
graph LR
    subgraph User["User Interactions"]
        A["Guest Browse Rooms"]
        B["Guest Book Room"]
        C["Warden Add Room"]
        D["Admin Review Stats"]
    end

    subgraph Frontend["Frontend Processing"]
        FP1["Validate Input"]
        FP2["Format Request"]
        FP3["Add Auth Token"]
    end

    subgraph Backend["Backend Processing"]
        BP1["Authenticate Request"]
        BP2["Authorize Action"]
        BP3["Validate Business Logic"]
        BP4["Database Operation"]
        BP5["Send Notifications"]
    end

    subgraph Database["Persistence"]
        DB["MongoDB<br/>Store/Retrieve Data"]
    end

    A -->|Click Search| FP1
    FP1 -->|API Call| BP1
    BP1 -->|Query Rooms| BP4
    BP4 -->|Fetch| DB
    DB -->|Results| BP4
    BP4 -->|Response| A

    B -->|Submit Booking| FP1
    FP1 -->|POST| BP1
    BP1 -->|Check Available| BP3
    BP3 -->|Create Booking| BP4
    BP4 -->|Store| DB
    BP4 -->|Notify Warden| BP5
    BP5 -->|Response| B

    C -->|Create Room| FP1
    FP1 -->|POST| BP1
    BP1 -->|Check Warden| BP2
    BP2 -->|Validate Room Data| BP3
    BP3 -->|Create Room| BP4
    BP4 -->|Store| DB
    BP4 -->|Notify Admin| BP5
    BP5 -->|Response| C

    D -->|View Dashboard| FP1
    FP1 -->|GET| BP1
    BP1 -->|Check Admin| BP2
    BP2 -->|Calculate Stats| BP3
    BP3 -->|Aggregate Data| BP4
    BP4 -->|Query| DB
    DB -->|Results| BP4
    BP4 -->|Response| D
```

## Communication Protocols

### Frontend → Backend (Synchronous - REST API)

```
HTTP Request
├── Method: GET | POST | PUT | DELETE
├── URL: http://localhost:3001/api/{resource}
├── Headers:
│   ├── Authorization: Bearer {JWT_TOKEN}
│   ├── Content-Type: application/json
│   └── X-Request-ID: {UUID}
├── Body: { validated request data }
└── Response: { data | error }

Status Codes:
- 200 OK (success)
- 201 Created (resource created)
- 400 Bad Request (validation error)
- 401 Unauthorized (invalid token)
- 403 Forbidden (insufficient permissions)
- 404 Not Found (resource doesn't exist)
- 500 Internal Server Error (server error)
```

### Backend → Database (MongoDB Queries)

```
Mongoose Operations
├── Create: User.create({ email, password, name })
├── Read: Booking.find({ userId })
├── Update: Room.findByIdAndUpdate(roomId, { isAvailable: false })
├── Delete: Notification.deleteOne({ _id })
├── Aggregate: Booking.aggregate([
│   { $match: { status: 'Confirmed' } },
│   { $group: { _id: '$roomId', count: { $sum: 1 } } }
│ ])
└── Transaction: session.withTransaction(() => {...})
```

### Backend → AI Engine (Internal HTTP)

```
HTTP Request
├── Method: POST
├── URL: http://localhost:5000/api/ai
├── Body: {
│   action: 'chat' | 'recommend',
│   userId: ObjectId,
│   message: string,
│   context: { userData, preferences }
│ }
└── Response: {
    message: string,
    recommendations?: Room[]
  }
```

### Frontend → External Services (Direct)

```
Google Gemini API
├── Method: POST
├── URL: https://generativelanguage.googleapis.com/v1beta/...
├── Headers: { Authorization: Bearer GEMINI_API_KEY }
└── Response: { generatedText, ... }
```

## Deployment Architecture

```mermaid
graph TB
    subgraph Local["Local Development"]
        Dev1["Frontend<br/>localhost:3000"]
        Dev2["Backend<br/>localhost:3001"]
        Dev3["MongoDB<br/>Local Connection"]
    end

    subgraph Production["Production Environment"]
        CDN["CDN / Static Hosting<br/>(Frontend Build)"]
        API["API Server<br/>(Node.js Process)"]
        MongoCloud["MongoDB Atlas<br/>(Managed Service)"]
        Cache["Redis Cache<br/>(Optional)"]
    end

    subgraph CI_CD["CI/CD Pipeline"]
        Git["GitHub Repo"]
        Tests["Run Tests"]
        Build["Build Apps"]
        Deploy["Deploy to Server"]
    end

    Git -->|Webhook| Tests
    Tests -->|Pass| Build
    Build -->|Frontend| CDN
    Build -->|Backend| API
    API -->|Connect| MongoCloud
    Cache -->|Cache Layer| API

    Dev1 -->|Development| Git
    Dev2 -->|Development| Git
    Dev3 -->|Dev Data| Git
```

## Security Layer

```mermaid
graph TD
    Request["Incoming Request"]

    Request -->|HTTP| CORS["CORS Middleware<br/>Verify Origin"]
    CORS -->|Check| CORSValid{Valid Origin?}
    CORSValid -->|No| Reject1["400 Bad Request"]
    CORSValid -->|Yes| Auth["Authentication<br/>Verify JWT Token"]

    Auth -->|Check| AuthValid{Token Valid?}
    AuthValid -->|No| Reject2["401 Unauthorized"]
    AuthValid -->|Yes| Authz["Authorization<br/>Check User Role"]

    Authz -->|Verify| AuthzValid{Has Permission?}
    AuthzValid -->|No| Reject3["403 Forbidden"]
    AuthzValid -->|Yes| Validate["Input Validation<br/>Zod Schemas"]

    Validate -->|Check| ValidValid{Valid Schema?}
    ValidValid -->|No| Reject4["400 Bad Request"]
    ValidValid -->|Yes| Sanitize["Sanitize Input<br/>Remove XSS"]

    Sanitize -->|Clean| Handler["Handle Request<br/>Business Logic"]
    Handler -->|Success| Response["200 OK<br/>Return Data"]

    Reject1 & Reject2 & Reject3 & Reject4 -->|Error| Log["Log Security Event"]
    Log -->|Alert| Monitor["Monitoring System"]
```

## Performance Optimization

```mermaid
graph TD
    A["API Request"] -->|Cache Hit?| B{Cache<br/>Exists?}
    B -->|Yes| C["Return Cached<br/>Response"]
    B -->|No| D["Query Database"]
    D -->|Results| E["Process Data"]
    E -->|Store| F["Redis Cache<br/>TTL: 5 mins"]
    F -->|Return| C
    C -->|Response| G["Frontend<br/>Receives Data"]

    H["Heavy Analytics"] -->|Aggregate Query| I["MongoDB<br/>Pipeline"]
    I -->|Indexes| J{Use Index?}
    J -->|Yes| K["Fast Query<br/>< 100ms"]
    J -->|No| L["Slow Query<br/>Build Index"]
    K & L -->|Results| M["Cache Result<br/>TTL: 1 hour"]
```

## Monitoring & Logging

```
Application Logging
├── Auth Events: login, logout, token refresh failures
├── Database: connection status, slow queries (>1s)
├── Errors: unhandled exceptions, API failures
├── Performance: response times, request count
└── Security: unauthorized access attempts, validation failures

Log Destinations:
├── Console (development)
├── File System (production)
├── Monitoring Service (Sentry, LogRocket, etc.)
└── Analytics (Google Analytics, Mixpanel)

Alerts Triggered:
├── HTTP 500 errors (>5 in 5 mins)
├── Database disconnection
├── Payment processing failures
├── Authentication attack patterns (>10 failed logins)
└── Service latency (>2 seconds)
```
