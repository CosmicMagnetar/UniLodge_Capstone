# UniLodge-v2 System Design Analysis & Improvement Plan

**Date**: April 13, 2026  
**Status**: Analysis Complete - Ready for Implementation

---

## Executive Summary

Your UniLodge-v2 codebase demonstrates **good architectural foundations** but lacks proper **separation of concerns** and **service layer abstraction**. The project successfully implements a **monorepo structure**, **TypeScript across all services**, and **Zod validation**, but violates key design principles in the backend by mixing business logic with HTTP handling.

**Overall Score**: 6/10

- ✅ **Strengths**: Monorepo, TypeScript, validation, tests, shared types
- ❌ **Weaknesses**: No service layer, fat controllers, basic error handling, missing dependency injection

---

## Part 1: Current System Design Principles

### ✅ Principles Being Used

#### 1. **Monorepo Architecture (Workspace Pattern)**

**What**: Single repository with multiple independent applications  
**Where**: Root `package.json` with workspaces: frontend, backend, ai-engine, shared  
**Why Used**: Easier code sharing, consistent tooling, simplified deployment

```json
{
  "workspaces": [
    "apps/frontend",
    "apps/backend",
    "apps/ai-engine",
    "packages/shared"
  ]
}
```

**Effectiveness**: ⭐⭐⭐⭐ (4/5) - Well-structured, but missing clear package boundaries

---

#### 2. **Type Safety with TypeScript**

**What**: Static typing across all services  
**Where**: All `.ts` and `.tsx` files, strict tsconfig.json  
**Why Used**: Catch errors at compile-time, improve IDE support, self-documenting code

```typescript
// apps/backend/src/types/index.ts
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "WARDEN" | "GUEST";
}
```

**Effectiveness**: ⭐⭐⭐⭐⭐ (5/5) - Robust type definitions throughout

---

#### 3. **Schema Validation with Zod**

**What**: Runtime validation of request/response data  
**Where**: `packages/shared/src/schemas/`  
**Why Used**: Type safety at runtime, JSON parsing, error messages

```typescript
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
```

**Effectiveness**: ⭐⭐⭐⭐ (4/5) - Good schemas but not integrated into controllers

---

#### 4. **RESTful API Design**

**What**: HTTP methods (GET, POST, PUT, DELETE) for CRUD operations  
**Where**: All route files in `apps/backend/src/routes/`  
**Why Used**: Standard web API conventions, easy to understand

```typescript
router.get("/", getRooms); // List
router.post("/", createRoom); // Create
router.put("/:id", updateRoom); // Update
router.delete("/:id", deleteRoom); // Delete
```

**Effectiveness**: ⭐⭐⭐⭐ (4/5) - Properly structured routes

---

#### 5. **Role-Based Access Control (RBAC)**

**What**: Routes protected by user roles (GUEST, WARDEN, ADMIN)  
**Where**: `apps/backend/src/middleware/auth.ts`  
**Why Used**: Security, feature isolation by user type

```typescript
router.patch("/:id/approve", authMiddleware, adminOnly, approveRoom);
```

**Effectiveness**: ⭐⭐⭐⭐ (4/5) - Middleware-based, as per Express conventions

---

#### 6. **Separation of Concerns (Partial)**

**What**: Code organized by responsibility (controllers, models, routes, middleware)  
**Where**: `apps/backend/src/` directory structure  
**Why Used**: Maintainability, testability, code organization

```
src/
├── controllers/     # Request handlers
├── models/          # Data definitions
├── routes/          # Endpoint mappings
├── middleware/      # Cross-cutting concerns
└── config/          # Environment & connections
```

**Effectiveness**: ⭐⭐ (2/5) - Missing service layer (critical gap)

---

#### 7. **Component-Based Frontend Architecture**

**What**: Reusable React components organized by feature  
**Where**: `apps/frontend/components/` and `app/` (Next.js app router)  
**Why Used**: Reusability, testability, easy maintenance

```
components/
├── ui/              # Shared UI elements
├── chat/            # Chat-related
├── dashboard/       # Dashboard variants
└── pages/           # Page-level components
```

**Effectiveness**: ⭐⭐⭐ (3/5) - Good organization but no clear data fetching layer

---

#### 8. **Testing Strategy (Multi-Level)**

**What**: Unit, integration, and E2E tests  
**Where**: `__tests__/`, `tests/`, individual `*.test.ts` files  
**Why Used**: Quality assurance, regression prevention, documentation

```
__tests__/
├── unit/services/
├── integration/
└── e2e/
```

**Effectiveness**: ⭐⭐⭐ (3/5) - Tests exist but follow inconsistent patterns

---

#### 9. **Shared Package for DRY**

**What**: Common schemas, types, utilities shared across apps  
**Where**: `packages/shared/src/`  
**Why Used**: Single source of truth, code reuse

```typescript
// Used in both backend validation and frontend form validation
export const signupSchema = z.object({...});
```

**Effectiveness**: ⭐⭐⭐⭐ (4/5) - Good shared types and schemas

---

### ❌ Principles Missing/Violated

#### **Critical: No Service Layer (3-Layer Architecture)**

The backend violates the fundamental **3-layer architecture pattern**:

```
CORRECT:  Client -> Controller -> Service -> Model -> Database
CURRENT:  Client -> Controller+Service -> Model -> Database
```

**Current Problem Code**:

```typescript
// apps/backend/src/controllers/bookingRequestController.ts
export const createBookingRequest = async (req: AuthRequest, res: Response) => {
  const { roomId, checkInDate, checkOutDate, message } = req.body;

  // ❌ BUSINESS LOGIC IN CONTROLLER
  const days = Math.ceil((...) / (...));
  const totalPrice = room.price * days;  // Calculation should be in service

  const bookingRequest = new BookingRequest({...});
  await bookingRequest.save();  // Database operation in controller

  res.status(201).json(populatedRequest);
};
```

**Why It's Bad**:

1. **Testability**: Can't test business logic without mocking Express
2. **Reusability**: Logic locked in HTTP layer, can't use via CLI or events
3. **Coupling**: Controller depends directly on database
4. **Maintainability**: Hard to change business rules without touching HTTP layer

**Impact**: Very hard to reuse or test core logic

---

#### **Error Handling (Insufficient)**

```typescript
// apps/backend/src/server.ts - BASIC error handler
app.use((err: any, req: express.Request, res: express.Response) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});
```

**Problems**:

- No error classification (validation vs. auth vs. business logic)
- No logging of error context
- No error recovery strategies
- No custom error types

---

#### **Dependency Injection (Missing)**

Controllers directly import models:

```typescript
// ❌ Hard dependency
import BookingRequest from "../models/BookingRequest";
import Room from "../models/Room";
```

Should use constructor injection or service container:

```typescript
// ✅ Better: Dependency provided
constructor(private bookingService: BookingService) {}
```

---

#### **Data Access Layer Abstraction (Missing)**

Database logic scattered across controllers. No repository pattern:

```typescript
// ❌ Controller talks directly to database
const requests = await BookingRequest.find(filter).populate(...);
```

Should exist in dedicated repositories.

---

#### **Frontend Data Fetching Strategy (Unclear)**

No clear data fetching pattern:

> ❓ Where are API calls made?  
> ❓ Is data cached or fetched each time?  
> ❓ How is error handling done?  
> ❓ How is loading state managed?

Services directory is empty: `apps/frontend/lib/services/` (only `.gitkeep`)

---

#### **Configuration Management (Partial)**

Uses dotenv but no validation:

```typescript
// ❌ No validation of required env vars
const PORT = process.env.PORT || 3001;
```

Missing `.env.local` checks before startup.

---

#### **API Documentation (Missing)**

No OpenAPI/Swagger:

> ❓ How do frontend developers know exact request/response format?  
> ❓ Are error codes documented?

---

---

## Part 2: Improved System Design Principles Plan

### Phase 1: Implement 3-Layer Architecture (Backend)

#### Goal

Separate concerns into three clean layers:

- **Controller Layer**: HTTP request/response handling
- **Service Layer**: Business logic and orchestration
- **Repository Layer**: Data access abstraction

#### Implementation

**1. Create Service Layer**

```
apps/backend/src/
├── services/                    # NEW LAYER
│   ├── booking.service.ts
│   ├── room.service.ts
│   ├── auth.service.ts
│   ├── notification.service.ts
│   └── types.ts                 # Service DTOs
├── repositories/                # NEW: Data access
│   ├── booking.repository.ts
│   ├── room.repository.ts
│   └── user.repository.ts
├── controllers/                 # UPDATED: Thin controllers
└── models/                      # UNCHANGED: Schemas only
```

**2. Service Example**

```typescript
// apps/backend/src/services/booking.service.ts
export class BookingService {
  constructor(
    private bookingRepository: BookingRepository,
    private roomRepository: RoomRepository,
    private notificationService: NotificationService,
  ) {}

  async createBooking(
    userId: string,
    roomId: string,
    checkInDate: Date,
    checkOutDate: Date,
  ): Promise<BookingDTO> {
    // Business logic
    const room = await this.roomRepository.findById(roomId);
    if (!room) throw new RoomNotFoundError(roomId);

    // Check availability
    const isAvailable = await this.checkAvailability(
      roomId,
      checkInDate,
      checkOutDate,
    );
    if (!isAvailable) throw new RoomNotAvailableError(roomId);

    // Calculate price
    const nights = this.calculateNights(checkInDate, checkOutDate);
    const totalPrice = room.price * nights;

    // Create booking
    const booking = await this.bookingRepository.create({
      userId,
      roomId,
      checkInDate,
      checkOutDate,
      totalPrice,
    });

    // Notify
    await this.notificationService.notifyWarden(room.wardenId, {
      type: "booking_request",
      bookingId: booking.id,
    });

    return this.mapToDTO(booking);
  }

  private calculateNights(checkIn: Date, checkOut: Date): number {
    return Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  private async checkAvailability(
    roomId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<boolean> {
    const overlapping = await this.bookingRepository.findOverlapping(
      roomId,
      checkIn,
      checkOut,
    );
    return overlapping.length === 0;
  }
}
```

**3. Thin Controller**

```typescript
// apps/backend/src/controllers/booking.controller.ts
export class BookingController {
  constructor(private bookingService: BookingService) {}

  async createBooking(req: AuthRequest, res: Response): Promise<void> {
    // 1. Validate input
    const { roomId, checkInDate, checkOutDate } = req.body;
    const parsed = createBookingSchema.safeParse({...});
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.errors });
      return;
    }

    // 2. Call service
    try {
      const booking = await this.bookingService.createBooking(
        req.user!.id,
        parsed.data.roomId,
        new Date(parsed.data.checkInDate),
        new Date(parsed.data.checkOutDate)
      );

      // 3. Return response
      res.status(201).json(booking);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof RoomNotFoundError) {
      res.status(404).json({ error: 'Room not found' });
    } else if (error instanceof RoomNotAvailableError) {
      res.status(409).json({ error: 'Room not available for selected dates' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
```

**4. Repository Example**

```typescript
// apps/backend/src/repositories/booking.repository.ts
export class BookingRepository {
  constructor(private bookingModel: typeof Booking) {}

  async create(data: CreateBookingInput): Promise<Booking> {
    return this.bookingModel.create(data);
  }

  async findById(id: string): Promise<Booking | null> {
    return this.bookingModel.findById(id).lean();
  }

  async findOverlapping(
    roomId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<Booking[]> {
    return this.bookingModel
      .find({
        roomId,
        $or: [
          { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } },
        ],
      })
      .lean();
  }
}
```

#### Benefits

✅ Testable business logic (no Express mocking needed)  
✅ Reusable (can call service from CLI, events, scheduled jobs)  
✅ Clear responsibility boundaries  
✅ Easy to swap database implementations

---

### Phase 2: Implement Dependency Injection

#### Goal

Decouple components using IoC container or manual injection

#### Implementation

**1. Create Container**

```typescript
// apps/backend/src/services/container.ts
export class ServiceContainer {
  private services: Map<string, any> = new Map();

  // Register repositories
  registerBookingRepository(repo: BookingRepository): void {
    this.services.set('BookingRepository', repo);
  }

  registerRoomRepository(repo: RoomRepository): void {
    this.services.set('RoomRepository', repo);
  }

  // Register services
  registerBookingService(service: BookingService): void {
    this.services.set('BookingService', service);
  }

  // Get service
  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) throw new Error(`Service ${name} not registered`);
    return service as T;
  }
}

// Setup in server.ts
const container = new ServiceContainer();
const bookingRepo = new BookingRepository(Booking);
const roomRepo = new RoomRepository(Room);
const notificationService = new NotificationService(...);

container.registerBookingRepository(bookingRepo);
container.registerRoomRepository(roomRepo);
container.registerBookingService(
  new BookingService(bookingRepo, roomRepo, notificationService)
);
```

**2. Usage in Routes**

```typescript
// apps/backend/src/routes/booking.ts
export function createBookingRoutes(container: ServiceContainer): Router {
  const router = Router();
  const bookingService = container.get<BookingService>("BookingService");
  const controller = new BookingController(bookingService);

  router.post("/", controller.createBooking.bind(controller));
  return router;
}
```

---

### Phase 3: Implement Custom Error Types

#### Goal

Classify, handle, and document errors properly

#### Implementation

```typescript
// apps/backend/src/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, any>,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Specific errors
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(400, "VALIDATION_ERROR", message, details);
  }
}

export class RoomNotFoundError extends AppError {
  constructor(roomId: string) {
    super(404, "ROOM_NOT_FOUND", `Room ${roomId} not found`, { roomId });
  }
}

export class RoomNotAvailableError extends AppError {
  constructor(roomId: string, dates: { checkIn: Date; checkOut: Date }) {
    super(409, "ROOM_NOT_AVAILABLE", `Room not available for selected dates`, {
      roomId,
      requestedCheckIn: dates.checkIn,
      requestedCheckOut: dates.checkOut,
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, "FORBIDDEN", message);
  }
}

// Global error handler
app.use((err: any, req: express.Request, res: express.Response) => {
  // Log error context
  logger.error("Request Error", {
    path: req.path,
    method: req.method,
    status: err.status || 500,
    code: err.code,
    message: err.message,
    userId: req.user?.id,
    details: err.details,
    stack: err.stack,
  });

  // Return structured error
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Unknown error
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  });
});
```

---

### Phase 4: Implement Frontend Data Fetching Layer

#### Goal

Create a clean abstraction for API communication with error handling, caching, and loading states

#### Implementation

**1. Create API Client**

```typescript
// apps/frontend/lib/api/client.ts
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  status: number;
}

export class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    // Check cache
    const cached = this.cache.get(endpoint);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return { data: cached.data, status: 200 };
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "GET",
        headers: this.getHeaders(),
        credentials: "include",
      });

      const data = await response.json();

      // Cache successful responses
      if (response.ok) {
        this.cache.set(endpoint, { data, timestamp: Date.now() });
      }

      return { data, status: response.status };
    } catch (error) {
      return {
        error: {
          code: "NETWORK_ERROR",
          message: "Failed to fetch data",
        },
        status: 0,
      };
    }
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: this.getHeaders(),
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || { code: "ERROR", message: "Request failed" },
          status: response.status,
        };
      }

      return { data, status: response.status };
    } catch (error) {
      return {
        error: {
          code: "NETWORK_ERROR",
          message: "Failed to send request",
        },
        status: 0,
      };
    }
  }

  private getHeaders(): Record<string, string> {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
    } else {
      for (const [key] of this.cache) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    }
  }
}

export const apiClient = new ApiClient();
```

**2. Create Service Layer**

```typescript
// apps/frontend/lib/services/room.service.ts
import { apiClient } from "@/lib/api/client";
import { Room } from "@/types";

export class RoomService {
  async listRooms(filters?: Record<string, any>): Promise<Room[]> {
    const query = new URLSearchParams(filters || {}).toString();
    const response = await apiClient.get<Room[]>(`/api/rooms?${query}`);

    if (!response.data) {
      throw new Error(response.error?.message || "Failed to fetch rooms");
    }

    return response.data;
  }

  async getRoom(id: string): Promise<Room> {
    const response = await apiClient.get<Room>(`/api/rooms/${id}`);

    if (!response.data) {
      throw new Error(response.error?.message || "Room not found");
    }

    return response.data;
  }

  async createBooking(
    roomId: string,
    checkInDate: Date,
    checkOutDate: Date,
  ): Promise<{ bookingId: string }> {
    const response = await apiClient.post<{ bookingId: string }>(
      "/api/bookings",
      { roomId, checkInDate, checkOutDate },
    );

    if (!response.data) {
      throw new Error(response.error?.message || "Failed to create booking");
    }

    // Invalidate cache so user sees updated data
    apiClient.invalidateCache("bookings");

    return response.data;
  }
}

export const roomService = new RoomService();
```

**3. Create Custom Hook for Data Fetching**

```typescript
// apps/frontend/lib/hooks/useAsync.ts
import { useState, useEffect } from "react";

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[],
): UseAsyncState<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const data = await asyncFunction();
        if (isMounted) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error("Unknown error"),
          });
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return state;
}
```

**4. Usage in Components**

```typescript
// apps/frontend/app/(dashboard)/guest/page.tsx
'use client';

import { roomService } from '@/lib/services/room.service';
import { useAsync } from '@/lib/hooks/useAsync';

export default function GuestDashboard() {
  const { data: rooms, loading, error } = useAsync(
    () => roomService.listRooms({ type: 'Double' }),
    []
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {rooms?.map(room => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
}
```

---

### Phase 5: Implement API Documentation

#### Goal

Self-document API endpoints with examples and error codes

#### Implementation

```typescript
// apps/backend/src/docs/api.ts
export const ENDPOINTS = {
  BOOKINGS: {
    CREATE: {
      method: "POST",
      path: "/api/bookings",
      description: "Create a new booking request",
      auth: "Bearer token (GUEST, WARDEN)",
      body: {
        roomId: "Room ObjectId",
        checkInDate: "ISO 8601 date",
        checkOutDate: "ISO 8601 date",
      },
      responses: {
        201: {
          data: { bookingId: "UUID", status: "Pending", totalPrice: "number" },
        },
        400: { error: { code: "VALIDATION_ERROR" } },
        404: { error: { code: "ROOM_NOT_FOUND" } },
        409: { error: { code: "ROOM_NOT_AVAILABLE" } },
      },
    },
  },
  // ... more endpoints
};
```

Or use OpenAPI/Swagger:

```bash
npm install --save-dev @nestjs/swagger @nestjs/common
```

---

## Part 3: Implementation Roadmap

### Week 1: Planning & Setup

- [ ] Create design document (validation & approval)
- [ ] Set up feature branch `feature/architecture-refactor`
- [ ] Create tests for new services (TDD)

### Week 2-3: Backend Refactor Phase 1

- [ ] Implement repository layer for all models
- [ ] Create base classes and types
- [ ] Setup dependency injection container
- [ ] Migrate booking operations to service

### Week 3-4: Backend Refactor Phase 2

- [ ] Migrate all services (auth, room, notifications, analytics)
- [ ] Update controllers to use services
- [ ] Implement custom error types
- [ ] Update error handler middleware

### Week 4-5: Frontend Data Layer

- [ ] Create API client
- [ ] Create service layer for all domains
- [ ] Create custom hooks (useAsync, useMutation)
- [ ] Update components to use services
- [ ] Add loading/error states

### Week 5-6: Documentation & Testing

- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Update service tests
- [ ] Test integration end-to-end
- [ ] Acceptance testing

### Week 6: Deployment

- [ ] Code review
- [ ] Performance testing
- [ ] Deploy to staging
- [ ] Final testing
- [ ] Merge to main

---

## Part 4: Code Examples - Before & After

### Example 1: Current vs. Improved Booking Creation

**CURRENT (Controllers with Logic)**

```typescript
// apps/backend/src/controllers/bookingController.ts
export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.body;
    const userId = req.user?.id;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // ❌ Business logic in controller
    const days = Math.ceil((...) / (...));
    const totalPrice = room.price * days;

    const overlappingBookings = await Booking.find({
      roomId,
      $or: [
        { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } }
      ]
    });
    if (overlappingBookings.length > 0) return res.status(409).json(...);

    const booking = new Booking({...});
    await booking.save();

    await Notification.create({...});  // ❌ Data layer logic

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};
```

**IMPROVED (3-Layer Architecture)**

```typescript
// apps/backend/src/controllers/booking.controller.ts
export class BookingController {
  constructor(private bookingService: BookingService) {}

  async createBooking(req: AuthRequest, res: Response) {
    try {
      // ✅ Validate input
      const parsed = createBookingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.errors });
      }

      // ✅ Delegate to service
      const booking = await this.bookingService.createBooking(
        req.user!.id,
        parsed.data.roomId,
        parsed.data.checkInDate,
        parsed.data.checkOutDate,
      );

      // ✅ Return response
      res.status(201).json(booking);
    } catch (error) {
      // ✅ Handle errors properly
      this.errorHandler.handle(error, res);
    }
  }
}

// apps/backend/src/services/booking.service.ts
export class BookingService {
  constructor(
    private bookingRepo: BookingRepository,
    private roomRepo: RoomRepository,
    private notificationService: NotificationService,
  ) {}

  async createBooking(
    userId: string,
    roomId: string,
    checkInDate: Date,
    checkOutDate: Date,
  ): Promise<BookingDTO> {
    // ✅ Business logic separated
    const room = await this.roomRepo.findById(roomId);
    if (!room) throw new RoomNotFoundError(roomId);

    // Check availability
    const isAvailable = await this.checkAvailability(
      roomId,
      checkInDate,
      checkOutDate,
    );
    if (!isAvailable) throw new RoomNotAvailableError(roomId);

    // Calculate price using dedicated method
    const totalPrice = this.calculateTotalPrice(
      room,
      checkInDate,
      checkOutDate,
    );

    // Create booking
    const booking = await this.bookingRepo.create({
      userId,
      roomId,
      checkInDate,
      checkOutDate,
      totalPrice,
    });

    // ✅ Notify, but don't handle here
    await this.notificationService.notifyWarden(room.wardenId, {
      type: "booking_request",
      bookingId: booking.id,
    });

    return BookingMapper.toDTO(booking);
  }

  // Helper methods
  private calculateTotalPrice(
    room: Room,
    checkIn: Date,
    checkOut: Date,
  ): number {
    const nights = this.calculateNights(checkIn, checkOut);
    return room.price * nights;
  }

  private calculateNights(checkIn: Date, checkOut: Date): number {
    return Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  private async checkAvailability(
    roomId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<boolean> {
    const conflicting = await this.bookingRepo.findOverlapping(
      roomId,
      checkIn,
      checkOut,
    );
    return conflicting.length === 0;
  }
}

// apps/backend/src/repositories/booking.repository.ts
export class BookingRepository {
  constructor(private model: typeof Booking) {}

  async create(data: CreateBookingInput): Promise<Booking> {
    return this.model.create(data);
  }

  async findOverlapping(
    roomId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<Booking[]> {
    return this.model
      .find({
        roomId,
        $or: [
          { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } },
        ],
      })
      .lean();
  }
}
```

**Benefits of Improved Approach**:
✅ `BookingService.createBooking()` can be tested without Express  
✅ Can reuse booking logic from CLI, webhooks, scheduled jobs  
✅ Repository can be swapped for different database  
✅ Clear separation of concerns  
✅ Easier to understand and maintain

---

## Summary Table: Design Principles

| Principle             | Status         | Score    | Notes                                   |
| --------------------- | -------------- | -------- | --------------------------------------- |
| Monorepo Architecture | ✅ Implemented | 4/5      | Working well, clear structure           |
| TypeScript            | ✅ Implemented | 5/5      | Excellent type safety                   |
| Zod Validation        | ✅ Implemented | 4/5      | Good, but not used in controllers       |
| RESTful API           | ✅ Implemented | 4/5      | Proper HTTP methods                     |
| RBAC                  | ✅ Implemented | 4/5      | Middleware-based, working               |
| 3-Layer Architecture  | ❌ Missing     | 2/5      | **CRITICAL** - All logic in controllers |
| Dependency Injection  | ❌ Missing     | 1/5      | Hard-coded dependencies                 |
| Error Handling        | ⚠️ Partial     | 2/5      | Basic, needs classification             |
| Data Fetching Layer   | ❌ Missing     | 1/5      | No abstraction, frontend scattered      |
| API Documentation     | ❌ Missing     | 0/5      | No OpenAPI/Swagger                      |
| Testing Strategy      | ⚠️ Partial     | 3/5      | Tests exist, inconsistent patterns      |
| Configuration         | ⚠️ Partial     | 2/5      | No validation of env vars               |
| Logging               | ⚠️ Partial     | 2/5      | Console.log, no structured logging      |
| **Overall System**    | -              | **3/10** | Solid foundation, needs refactoring     |

---

## Conclusion

UniLodge-v2 has excellent **infrastructure and tooling** (TypeScript, monorepo, tests) but **lacks proper architectural patterns** for maintainability and scalability. The primary issue is violation of the **3-layer architecture**, forcing business logic into controllers.

**Immediate priorities**:

1. **Implement service layer** (biggest impact)
2. **Add dependency injection**
3. **Improve error handling**
4. **Create data fetching abstraction in frontend**

Following this plan will transform the codebase into a **maintainable, testable, scalable system** ready for production-grade applications.
