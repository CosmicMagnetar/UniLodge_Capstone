# Backend Refactoring Implementation Guide

**Status**: Architecture refactoring with Design Patterns & SOLID principles  
**Date**: April 13, 2026

---

## Quick Start: Integration with Existing Code

### Step 1: Update server.ts

Replace the old controller imports with the DI container setup:

```typescript
// src/server.ts
import express from "express";
import mongoose from "mongoose";
import { DIContainer, setupDIContainer } from "./container";
import { BookingController } from "./infrastructure/http/controllers/BookingController";
import { Logger } from "./infrastructure/logging/Logger";
import { AppError, ErrorHandler } from "./shared/errors/AppError";
import routes from "./infrastructure/http/routes";
import authMiddleware from "./infrastructure/http/middleware/AuthMiddleware";

const app = express();

// ============ MIDDLEWARE ============
app.use(express.json());
app.use(authMiddleware);

// ============ INITIALIZE SERVICES ============
async function initializeApp() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    Logger.info("✅ MongoDB connected");

    // Setup dependency injection container
    const container = await setupDIContainer();
    Logger.info("✅ DI Container initialized");

    // ============ ROUTES ============
    // Example: Setup booking routes
    const bookingController =
      container.get<BookingController>("BookingController");

    app.post("/api/bookings", (req, res) => {
      bookingController.createBooking(req as any, res);
    });

    app.get("/api/bookings", (req, res) => {
      bookingController.getBookings(req as any, res);
    });

    app.get("/api/bookings/:id", (req, res) => {
      bookingController.getBooking(req as any, res);
    });

    app.post("/api/bookings/:id/confirm", (req, res) => {
      bookingController.confirmBooking(req as any, res);
    });

    app.post("/api/bookings/:id/cancel", (req, res) => {
      bookingController.cancelBooking(req as any, res);
    });

    // ============ ERROR HANDLING ============
    app.use((err: any, req: any, res: any, next: any) => {
      const errorResponse = ErrorHandler.handle(err);
      res.status(errorResponse.statusCode).json(errorResponse);
    });

    // ============ START SERVER ============
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      Logger.info(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    Logger.error("Failed to initialize app", error);
    process.exit(1);
  }
}

initializeApp();

export default app;
```

---

## Architecture Overview

### New Folder Structure Benefits

```
src/
├── domain/                 # Business logic (entities, services, interfaces)
│   ├── entities/          # Core business objects (Booking, Room, User)
│   ├── value-objects/     # Immutable objects (DateRange, Price)
│   ├── repositories/      # Interfaces for data access (abstraction)
│   ├── services/          # Domain services (PricingService, AvailabilityService)
│   └── events/            # Domain events (BookingCreated, RoomApproved)
│
├── application/            # Use cases / Application services
│   ├── booking/           # Booking workflows (CreateBooking, ConfirmBooking)
│   ├── room/              # Room workflows
│   └── dto/               # Data transfer objects
│
├── infrastructure/         # Implementation details
│   ├── persistence/       # Repository implementations (MongoDB, PostgreSQL)
│   ├── http/              # HTTP layer (controllers, routes, middleware)
│   ├── external-services/ # Third-party integrations (Payment, Notification)
│   ├── config/            # Configuration files
│   └── logging/           # Logger implementation
│
├── shared/                 # Shared utilities
│   ├── errors/            # Custom error types
│   ├── validators/        # Validation utilities
│   └── utils/             # Helper functions
│
└── container.ts           # Dependency Injection Container
```

### Design Patterns In Use

| Pattern                  | Location                             | Benefit                          |
| ------------------------ | ------------------------------------ | -------------------------------- |
| **Factory**              | `container.ts` - `RepositoryFactory` | Choose implementation at runtime |
| **Repository**           | `domain/repositories/`               | Abstract data access             |
| **Service**              | `domain/services/`                   | Orchestrate domain logic         |
| **Strategy**             | `PricingService`                     | Swap pricing algorithms          |
| **Dependency Injection** | `container.ts`                       | Loose coupling                   |
| **Singleton**            | `Logger`, `DIContainer`              | One instance only                |
| **Decorator**            | Can wrap services                    | Add behavior dynamically         |

---

## How to Use: Example Workflow

### Creating a Booking

```typescript
// 1. Request hits controller
POST /api/bookings
{
  "roomId": "123",
  "checkInDate": "2024-05-01",
  "checkOutDate": "2024-05-10",
  "guestCount": 2
}

// 2. Controller validates and delegates to use case
const output = await createBookingUseCase.execute({
  userId: req.user.id,
  roomId: "123",
  checkInDate: new Date("2024-05-01"),
  checkOutDate: new Date("2024-05-10"),
  guestCount: 2,
});

// 3. UseCase orchestrates:
//    a) Fetch room from repository
//    b) Create DateRange value object (validates dates)
//    c) Check availability with AvailabilityService
//    d) Calculate price with PricingService
//    e) Create Booking entity (immutable domain object)
//    f) Save to repository
//    g) Return DTO

// 4. Controller returns HTTP response
res.status(201).json(output);
```

**Key Insight**: Business logic is in domain/application layers, NOT in controllers!

---

## Testing Benefits

### Testing is Now Easy

```typescript
// Test 1: Test domain logic (no mocks needed for entity)
const booking = new Booking({
  id: "1",
  roomId: "123",
  userId: "user1",
  dateRange: new DateRange(new Date("2024-05-01"), new Date("2024-05-10")),
  totalPrice: new Price(1000),
  status: "Pending",
  // ...
});

expect(booking.canCancel()).toBe(true);
booking.cancel();
expect(booking.getStatus()).toBe("Cancelled");

// Test 2: Test use case with mocks
const mockRoomRepo = {
  findById: jest.fn().mockResolvedValue(mockRoom),
};

const useCase = new CreateBookingUseCase(
  mockBookingRepo,
  mockRoomRepo,
  mockUserRepo,
  mockPricingService,
  mockAvailabilityService,
);

const output = await useCase.execute(validInput);
expect(mockRoomRepo.findById).toHaveBeenCalledWith("123");

// Test 3: Different repository implementation (no logic changes!)
const mongoRepo = new MongoBookingRepository(mongoModel);
const postgresRepo = new PostgresBookingRepository(postgresPool);
// Both implement IBookingRepository - same interface!
```

---

## Migration Checklist

### Phase 1: Setup (Week 1)

- [x] Create folder structure
- [x] Define domain entities (Booking, Room, User)
- [x] Define value objects (DateRange, Price)
- [x] Define repository interfaces
- [x] Create domain services
- [ ] Setup TypeScript paths in tsconfig.json

### Phase 2: Infrastructure (Week 2)

- [x] Create MongoDB repositories
- [x] Create custom error types
- [x] Create thin controllers
- [x] Create DI container with factory pattern
- [ ] Create HTTP routes using controllers
- [ ] Create middleware (validation, error handling)

### Phase 3: Integration (Week 3)

- [ ] Update server.ts with new DI container
- [ ] Wire up all routes with new controllers
- [ ] Test all endpoints
- [ ] Update error handling globally
- [ ] Add request validation middleware

### Phase 4: Testing (Week 4)

- [ ] Write domain entity tests
- [ ] Write service tests
- [ ] Write use case tests
- [ ] Write repository tests
- [ ] Write integration tests

### Phase 5: Cleanup (Week 5)

- [ ] Remove old controllers
- [ ] Remove old service files (logic moved to domain)
- [ ] Remove old model aggregations (use entities instead)
- [ ] Verify all tests pass
- [ ] Document new architecture

---

## SOLID Principles Compliance

| Principle                 | How It's Achieved                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------- |
| **S**ingle Responsibility | Controllers only handle HTTP; Services only orchestrate; Repositories only persist |
| **O**pen/Closed           | New pricing strategies can be added without modifying existing code                |
| **L**iskov Substitution   | All repositories implement same interface; can be swapped                          |
| **I**nterface Segregation | Small focused interfaces (IPricingStrategy, IBookingRepository)                    |
| **D**ependency Inversion  | Depend on abstractions (interfaces); concrete classes injected                     |

---

## Common Patterns

### Using Different Pricing Strategy

```typescript
// In booking controller or use case
const pricingService = container.get<PricingService>("PricingService");

// Change strategy based on user
if (user.isLoyaltyMember) {
  pricingService.setStrategy(new LoyaltyPricingStrategy(user.bookingCount));
} else if (isSeasonalPeak()) {
  pricingService.setStrategy(new SeasonalPricingStrategy());
}

const price = pricingService.calculatePrice(room, dateRange, guestCount);
```

### Adding a New Payment Provider

```typescript
// 1. Create adapter
export class PayPalAdapter implements IPaymentProvider {
  async process(amount: Price, details: any): Promise<Receipt> {
    // PayPal logic
  }
}

// 2. Register in container
const paymentService = new PaymentService();
paymentService.registerProvider("paypal", new PayPalAdapter());

// 3. Use it
const receipt = await paymentService.process("paypal", amount);
// No changes needed to existing booking logic!
```

### Extending Domain Logic

```typescript
// Add new business rule to Booking entity
export class Booking {
  // ... existing code ...

  /**
   * RULE: Early bird discount if booked 30+ days in advance
   */
  getEarlyBirdDiscount(): Price {
    const daysUntilCheckIn = this.getDaysUntilCheckIn();
    if (daysUntilCheckIn >= 30) {
      return this.totalPrice.withDiscount(15); // 15% off
    }
    return new Price(0);
  }
}

// No need to change controller or repository!
```

---

## Debugging & Monitoring

### Using Logger Singleton

```typescript
import { Logger } from "./infrastructure/logging/Logger";

// Anywhere in the code
Logger.info("Creating booking", { userId, roomId });
Logger.warn("Room capacity exceeded", { requested: 5, capacity: 2 });
Logger.error("Database error", error, { operation: "save_booking" });
```

### Error Handling

```typescript
// Errors are classified
if (error instanceof ValidationError) {
  // Bad request - client error
} else if (error instanceof BusinessLogicError) {
  // Business rule violation
} else if (error instanceof DatabaseError) {
  // Database connectivity issue
} else if (error instanceof ExternalServiceError) {
  // Third-party service down
}

// Middleware handles all errors uniformly
app.use((err, req, res, next) => {
  const response = ErrorHandler.handle(err);
  res.status(response.statusCode).json(response);
});
```

---

## Next Steps

1. **Update Routes**: Create `infrastructure/http/routes/` directory with route definitions
2. **Add Middleware**: Create validation, authorization middleware
3. **Create More Controllers**: Follow BookingController pattern for Room, User, etc.
4. **Setup Testing**: Create `tests/` directory with unit and integration tests
5. **Update Frontend**: Create similar structure in frontend (separate PR)

---

## Questions & Answers

**Q: Why not just put everything in the controller?**  
A: Controllers can't be tested easily without mocking HTTP. Domain logic must be independent of HTTP.

**Q: Why value objects like DateRange?**  
A: They encapsulate rules (can't have checkout before checkin), prevent invalid states.

**Q: Why repository pattern?**  
A: Can swap MongoDB for PostgreSQL without changing business logic. Easy to test with mocks.

**Q: Why use cases instead of services?**  
A: Use cases represent user workflows. Easier to understand. Each use case has single responsibility.

**Q: Can I use this without all the boilerplate?**  
A: Yes! Start simple and add patterns gradually. Create domain entities first, repositories later.
