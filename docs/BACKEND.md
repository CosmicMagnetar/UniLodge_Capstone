# Backend Architecture & Guide

## Overview

The UniLodge backend is an **Express.js** RESTful API built with **TypeScript**, providing all business logic for room management, bookings, authentication, and analytics. The system uses **MongoDB** for persistent storage and integrates with external services for payments and AI-powered recommendations.

**Technology Stack:**

- Framework: Express.js 4.x
- Runtime: Node.js 22.x
- Language: TypeScript
- Database: MongoDB with Mongoose ODM
- Authentication: JWT (jsonwebtoken)
- Validation: Zod schemas
- Testing: Vitest, integration tests, E2E tests
- Port: localhost:3001

## Project Structure

```
apps/backend/
├── src/
│   ├── server.ts               # Express app setup
│   ├── config/
│   │   ├── database.ts         # MongoDB connection
│   │   └── environment.ts      # Env variable validation
│   ├── controllers/            # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── room.controller.ts
│   │   ├── booking.controller.ts
│   │   ├── analytics.controller.ts
│   │   └── chat.controller.ts
│   ├── services/               # Business logic
│   │   ├── auth.service.ts
│   │   ├── room.service.ts
│   │   ├── booking.service.ts
│   │   ├── notification.service.ts
│   │   ├── analytics.service.ts
│   │   └── ai.service.ts
│   ├── models/                 # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Room.ts
│   │   ├── Booking.ts
│   │   ├── Review.ts
│   │   ├── Notification.ts
│   │   ├── BookingRequest.ts
│   │   └── Contact.ts
│   ├── routes/                 # API routes
│   │   ├── auth.routes.ts
│   │   ├── room.routes.ts
│   │   ├── booking.routes.ts
│   │   ├── analytics.routes.ts
│   │   └── chat.routes.ts
│   ├── middleware/             # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── errorHandler.ts
│   ├── types/                  # TypeScript types
│   │   ├── index.ts
│   │   └── express.d.ts        # Express augmentation
│   ├── utils/
│   │   ├── logger.ts           # Logging utility
│   │   ├── validators.ts       # String validators
│   │   └── jwt.ts              # JWT utilities
│   └── scripts/                # Migration & seed scripts
├── __tests__/
│   ├── unit/
│   │   └── services/
│   ├── integration/
│   │   └── api.test.ts
│   └── e2e/
│       └── complete-journey.test.ts
├── .env.example                # Environment template
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

## API Endpoints

### Authentication

```http
POST /api/auth/signup
  Body: { email, password, name, role }
  Response: { accessToken, refreshToken, user }

POST /api/auth/login
  Body: { email, password }
  Response: { accessToken, refreshToken, user }

POST /api/auth/refresh
  Headers: { Authorization: Bearer refreshToken }
  Response: { accessToken, refreshToken }

POST /api/auth/logout
  Response: { message: 'Logged out successfully' }
```

### Room Management

```http
GET /api/rooms
  Query: ?type=Single&price[gte]=100&rating[gte]=4&skip=0&limit=10
  Response: [{ _id, roomNumber, type, price, amenities, rating, ... }]

GET /api/rooms/:id
  Response: { room with populated reviews }

POST /api/rooms
  Auth: Warden/Admin
  Body: { roomNumber, type, price, capacity, university, ... }
  Response: { _id, ... } (status: pending)

PUT /api/rooms/:id
  Auth: Warden/Admin (owner)
  Body: { partial update fields }
  Response: { updated room }

DELETE /api/rooms/:id
  Auth: Warden/Admin (owner)
  Response: { message: 'Room deleted' }

POST /api/rooms/:id/approve
  Auth: Admin
  Response: { room with status='approved' }

POST /api/rooms/:id/reject
  Auth: Admin
  Body: { reason }
  Response: { notification sent to warden }
```

### Bookings

```http
POST /api/bookings
  Auth: Guest
  Body: { roomId, checkInDate, checkOutDate }
  Response: { _id, status='Pending', totalPrice }

GET /api/bookings/mine
  Auth: Any user
  Response: [{ bookings for current user }]

GET /api/bookings/:id
  Auth: Booking owner or warden
  Response: { complete booking details }

PUT /api/bookings/:id
  Auth: Booking owner
  Body: { status, ... }
  Response: { updated booking }

POST /api/bookings/:id/checkout
  Auth: Booking owner or warden
  Response: { booking with status='Completed' }

POST /api/bookings/:id/pay
  Auth: Booking owner
  Body: { paymentMethod, amount }
  Response: { paymentStatus='paid' }
```

### Reviews

```http
POST /api/reviews
  Auth: Guest (completed booking)
  Body: { bookingId, rating, comment }
  Response: { _id, review data }

GET /api/reviews/room/:roomId
  Response: [{ reviews for room }]

DELETE /api/reviews/:id
  Auth: Review author or Admin
  Response: { message: 'Review deleted' }
```

### Analytics

```http
GET /api/analytics/dashboard
  Auth: Admin/Warden
  Response: {
    occupancyRate: number,
    totalRevenue: number,
    bookingCount: number,
    topRooms: [],
    demographics: {}
  }

GET /api/analytics/occupancy?period=7d
  Response: { occupancyByRoom: {} }

GET /api/analytics/revenue?period=30d
  Response: { dailyRevenue: [], totalRevenue }

GET /api/analytics/trends
  Response: { bookingTrends, priceTrends, ratingTrends }
```

### Chat & Recommendations

```http
POST /api/chat
  Auth: User
  Body: { message, context }
  Response: { reply, suggestions }

GET /api/chat/recommendations
  Auth: User
  Response: { rooms: [recommended rooms] }

POST /api/chat/preferences
  Auth: User
  Body: { preferences object }
  Response: { preferences saved }
```

## Authentication & Authorization

### JWT Token Structure

```typescript
// Payload
{
  sub: userId,       // Subject (user ID)
  email: string,
  role: 'ADMIN' | 'WARDEN' | 'GUEST',
  iat: timestamp,    // Issued at
  exp: timestamp     // Expires at (15 mins for access, 7 days for refresh)
}

// Header
{
  alg: 'HS256',
  typ: 'JWT'
}
```

### Role-Based Access Control (RBAC)

```typescript
// Middleware
const verifyRole = (roles: string[]) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};

// Usage
router.post("/rooms/:id/approve", verifyRole(["ADMIN"]), approveRoom);
router.post("/rooms", verifyRole(["WARDEN", "ADMIN"]), createRoom);
```

### Permission Matrix

| Action            | Guest | Warden | Admin |
| ----------------- | ----- | ------ | ----- |
| List rooms        | ✓     | ✓      | ✓     |
| Create booking    | ✓     | -      | -     |
| View own bookings | ✓     | ✓      | ✓     |
| Create room       | -     | ✓      | ✓     |
| Approve room      | -     | -      | ✓     |
| View analytics    | -     | ✓      | ✓     |
| Manage users      | -     | -      | ✓     |

## Service Layer

### AuthService

```typescript
class AuthService {
  // User registration with role validation
  async signup(email, password, name, role): Promise<IUser>;

  // Email verification and password hashing
  async login(email, password): Promise<{ accessToken; refreshToken }>;

  // JWT token generation and validation
  async validateToken(token): Promise<JwtPayload>;

  // Token refresh mechanism
  async refreshToken(refreshToken): Promise<{ accessToken; refreshToken }>;
}
```

### RoomService

```typescript
class RoomService {
  // Fetch with advanced filtering, pagination, sorting
  async getAllRooms(filters): Promise<IRoom[]>;

  // Availability checking across date ranges
  async checkAvailability(roomId, checkIn, checkOut): Promise<boolean>;

  // Room creation with warden assignment
  async createRoom(data, wardenId): Promise<IRoom>;

  // Admin approval workflow
  async approveRoom(roomId): Promise<IRoom>;

  // Rejection with notification
  async rejectRoom(roomId, reason): Promise<void>;
}
```

### BookingService

```typescript
class BookingService {
  // Create booking with availability and price validation
  async createBooking(userId, roomId, dates): Promise<IBooking>;

  // Payment processing
  async processPayment(bookingId, method): Promise<boolean>;

  // Booking lifecycle management
  async updateBookingStatus(bookingId, status): Promise<IBooking>;

  // Check-in/out workflow
  async checkOut(bookingId): Promise<IBooking>;

  // User's booking history
  async getUserBookings(userId): Promise<IBooking[]>;
}
```

### NotificationService

```typescript
class NotificationService {
  // Create and store notifications
  async createNotification(userId, data): Promise<INotification>;

  // Fetch unread notifications
  async getUserNotifications(userId): Promise<INotification[]>;

  // Mark as read
  async markAsRead(notificationId): Promise<void>;

  // Cleanup expired notifications (TTL)
  async cleanupExpired(): Promise<number>;
}
```

### AnalyticsService

```typescript
class AnalyticsService {
  // Calculate occupancy percentage across period
  async getOccupancyRate(period): Promise<number>;

  // Revenue aggregation with status filtering
  async getRevenueStats(period): Promise<RevenueData>;

  // Popular rooms aggregation
  async getPopularRooms(): Promise<RoomStat[]>;

  // User demographics breakdown
  async getUserDemographics(): Promise<Demographics>;

  // Booking trends over time
  async getBookingTrends(period): Promise<TrendData>;
}
```

## Database Models

### User Schema

```typescript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: 'ADMIN' | 'WARDEN' | 'GUEST',
  building: String (optional),
  organization: String (auto-filled from email domain),
  createdAt: Date (default: now)
}
```

### Room Schema

```typescript
{
  roomNumber: String (required, unique),
  type: 'Single' | 'Double' | 'Suite' | 'Studio',
  price: Number (required, min: 0),
  amenities: [String],
  rating: Number (0-5),
  capacity: Number,
  university: String,
  description: String,
  imageUrl: String (required),
  isAvailable: Boolean (default: true),
  approvalStatus: 'pending' | 'approved' | 'rejected',
  wardenId: ObjectId (reference to User),
  createdAt: Date
}

// Indices
- (wardenId, approvalStatus) - for quick filtering
- (university, type, price) - for search
```

### Booking Schema

```typescript
{
  roomId: ObjectId (reference to Room, required),
  userId: ObjectId (reference to User, required),
  checkInDate: Date (required),
  checkOutDate: Date (required),
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed',
  totalPrice: Number,
  paymentStatus: 'unpaid' | 'paid' | 'refunded',
  paymentDate: Date,
  paymentMethod: String,
  transactionId: String,
  checkInCompleted: Boolean,
  checkOutCompleted: Boolean,
  checkInTime: Date,
  checkOutTime: Date,
  createdAt: Date
}

// Indices
- (roomId, checkInDate, checkOutDate) - for availability queries
- (userId) - for user's bookings
```

## Validation & Error Handling

### Input Validation with Zod

```typescript
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password too short"),
});

const createBookingSchema = z
  .object({
    roomId: z.string().regex(/^[0-9a-f]{24}$/, "Invalid room ID"),
    checkInDate: z.date(),
    checkOutDate: z.date(),
  })
  .refine((data) => data.checkOutDate > data.checkInDate, {
    message: "Check-out must be after check-in",
    path: ["checkOutDate"],
  });

// Middleware usage
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ errors: error.errors });
    }
  };
};
```

### Error Handling

```typescript
// Custom error class
class ApiError extends Error {
  constructor(statusCode, message, errors?) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// Global error handler
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  if (error instanceof ValidationError) {
    return res
      .status(400)
      .json({ error: "Validation failed", details: error.details });
  }

  if (error instanceof AuthenticationError) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (error instanceof AuthorizationError) {
    return res.status(403).json({ error: "Forbidden" });
  }

  logger.error(message, { error, statusCode });
  res.status(statusCode).json({ error: message });
});
```

## Testing Strategy

### Unit Tests

Test individual service methods in isolation:

```typescript
describe("AuthService", () => {
  it("should hash password before saving user", async () => {
    const user = await authService.signup(email, password, name, "GUEST");
    expect(user.password).not.toBe(password);
    expect(user.password).toMatch(/^\$2a\$/); // bcrypt hash
  });

  it("should validate email format during signup", async () => {
    expect(() =>
      authService.signup("invalid-email", password, name, "GUEST"),
    ).toThrow("Invalid email format");
  });
});

describe("RoomService", () => {
  it("should check availability across date ranges", async () => {
    // Create booking for Jan 1-5
    await bookingService.createBooking(userId, roomId, jan1, jan5);

    // Jan 1-3 should conflict
    expect(await roomService.checkAvailability(roomId, jan1, jan3)).toBe(false);

    // Jan 6-10 should be available
    expect(await roomService.checkAvailability(roomId, jan6, jan10)).toBe(true);
  });
});
```

### Integration Tests

Test complete workflows:

```typescript
describe("Booking Workflow", () => {
  it("should complete full booking to checkout flow", async () => {
    // User signup
    const user = await authService.signup(email, password, name, "GUEST");

    // Check room availability
    const isAvailable = await roomService.checkAvailability(roomId, dates);
    expect(isAvailable).toBe(true);

    // Create booking
    const booking = await bookingService.createBooking(user._id, roomId, dates);
    expect(booking.status).toBe("Pending");

    // Process payment
    const paid = await bookingService.processPayment(booking._id, "card");
    expect(paid).toBe(true);

    // Confirm booking
    const confirmed = await bookingService.updateBookingStatus(
      booking._id,
      "Confirmed",
    );
    expect(confirmed.status).toBe("Confirmed");

    // Checkout
    const completed = await bookingService.checkOut(booking._id);
    expect(completed.status).toBe("Completed");
  });
});
```

### E2E Tests

Test complete API flows:

```typescript
describe("Backend API E2E", () => {
  it("should complete login → search → book flow", async () => {
    // Login
    const loginRes = await api
      .post("/api/auth/login")
      .send({ email, password });
    expect(loginRes.status).toBe(200);
    const { accessToken } = loginRes.body;

    // Search rooms
    const searchRes = await api
      .get("/api/rooms?type=Double&price[lte]=150")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(searchRes.status).toBe(200);
    expect(searchRes.body).toHaveLength(1);

    // Create booking
    const bookRes = await api
      .post("/api/bookings")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ roomId: searchRes.body[0]._id, checkInDate, checkOutDate });
    expect(bookRes.status).toBe(201);
    expect(bookRes.body.status).toBe("Pending");
  });
});
```

## Running the Backend

```bash
# Development
npm run dev           # Runs on localhost:3001 with auto-reload

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Testing
npm run test          # Unit & integration tests
npm run test:watch   # Watch mode
npm run test:e2e     # E2E tests

# Database operations
npm run db:seed      # Seed initial data
npm run db:reset     # Clear and reseed

# Linting
npm run lint
```

## Environment Variables

```bash
# .env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/campusstays

# JWT
JWT_SECRET=your_super_secret_key_for_access_token
REFRESH_SECRET=your_secret_key_for_refresh_token
JWT_EXPIRY=15m
REFRESH_EXPIRY=7d

# AI Services
HUGGING_FACE_API_KEY=your_api_key
GEMINI_API_KEY=your_api_key

# Payment (future)
STRIPE_SECRET_KEY=your_stripe_key

# External Service
AI_ENGINE_URL=http://localhost:5000

# Node environment
NODE_ENV=development
PORT=3001
```

## Performance Considerations

### Database Indexing

```typescript
// Existing indices
BookingSchema.index({ roomId: 1, checkInDate: 1, checkOutDate: 1 });
BookingSchema.index({ userId: 1 });
UserSchema.index({ email: 1 });
RoomSchema.index({ wardenId: 1, approvalStatus: 1 });

// Recommended indices for large datasets
RoomSchema.index({ university: 1, type: 1, price: 1 });
BookingSchema.index({ status: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });
```

### Query Optimization

```typescript
// Pagination
async getAllRooms(filters) {
  const skip = (filters.page - 1) * filters.limit;
  return Room.find(filters)
    .skip(skip)
    .limit(filters.limit)
    .lean();  // Return plain objects instead of Mongoose docs
}

// Aggregation for analytics
async getOccupancyRate(period) {
  return Booking.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: { _id: '$roomId', count: { $sum: 1 } } },
    // Further pipeline stages...
  ]);
}
```

## Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Run `npm run build` and verify no errors
- [ ] Run full test suite: `npm test`
- [ ] Verify database connection and migrations
- [ ] Test payment gateway integration
- [ ] Set up monitoring and logging
- [ ] Configure CORS for frontend domain
- [ ] Enable API rate limiting
- [ ] Set up automatic backups for MongoDB
- [ ] Configure CI/CD pipeline
