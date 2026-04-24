# AI Engine & Shared Package Refactoring Guide

**Date**: April 13, 2026

---

## AI Engine Refactoring

### New Structure

```
apps/ai-engine/src/
├── domain/                        # Core AI logic
│   ├── models/
│   │   ├── ChatModel.ts          # Interface for AI models
│   │   ├── EmbeddingModel.ts
│   │   └── AnalysisModel.ts
│   │
│   ├── services/
│   │   ├── ChatService.ts        # Core chat logic
│   │   ├── RecommendationService.ts
│   │   └── AnalyticsService.ts
│   │
│   └── repositories/
│       ├── IConversationRepository.ts
│       └── IChatHistoryRepository.ts
│
├── infrastructure/
│   ├── providers/                 # External AI providers
│   │   ├── HuggingFaceProvider.ts
│   │   ├── OpenAIProvider.ts      # Easy to add new providers
│   │   └── GeminiProvider.ts
│   │
│   ├── persistence/               # Store conversations
│   │   ├── MongoConversationRepository.ts
│   │   └── MongoChatHistoryRepository.ts
│   │
│   ├── http/
│   │   ├── ChatController.ts
│   │   └── AnalyticsController.ts
│   │
│   └── cache/                     # Cache AI responses
│       └── RedisCache.ts
│
├── application/
│   ├── ProcessMessageUseCase.ts
│   └── GetRecommendationsUseCase.ts
│
└── container.ts
```

### Provider Strategy Pattern

```typescript
// apps/ai-engine/src/domain/models/ChatModel.ts
/**
 * INTERFACE: AI Provider (Strategy Pattern)
 * Allows swapping between different AI providers
 */
export interface IAIProvider {
  generateResponse(message: string, context?: string): Promise<string>;

  getModelName(): string;
}

// apps/ai-engine/src/infrastructure/providers/HuggingFaceProvider.ts
export class HuggingFaceProvider implements IAIProvider {
  constructor(private apiKey: string) {}

  async generateResponse(message: string, context?: string): Promise<string> {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/...",
      {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        method: "POST",
        body: JSON.stringify({ inputs: message }),
      },
    );
    return response.json();
  }

  getModelName(): string {
    return "Hugging Face";
  }
}

// apps/ai-engine/src/infrastructure/providers/OpenAIProvider.ts
export class OpenAIProvider implements IAIProvider {
  async generateResponse(message: string, context?: string): Promise<string> {
    // OpenAI logic
  }

  getModelName(): string {
    return "OpenAI GPT-4";
  }
}

// FACTORY: Select provider at runtime
export class AIProviderFactory {
  static createProvider(
    type: "huggingface" | "openai" | "gemini",
  ): IAIProvider {
    switch (type) {
      case "huggingface":
        return new HuggingFaceProvider(process.env.HF_API_KEY!);
      case "openai":
        return new OpenAIProvider(process.env.OPENAI_API_KEY!);
      // ... other providers
      default:
        throw new Error(`Unknown provider: ${type}`);
    }
  }
}
```

### AI Service with Singleton Cache

```typescript
// apps/ai-engine/src/infrastructure/cache/RedisCache.ts
/**
 * REDIS CACHE: Singleton Pattern
 * Cache AI responses to avoid repeated API calls
 */
export class RedisCache {
  private static instance: RedisCache;

  private constructor(private client: Redis) {}

  static getInstance(client: Redis): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache(client);
    }
    return RedisCache.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.client.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    await this.client.setex(key, ttl, JSON.stringify(value));
  }
}
```

---

## Shared Package Refactoring

### New Structure

```
packages/shared/src/
├── domain/
│   ├── types/
│   │   ├── User.ts
│   │   ├── Booking.ts
│   │   ├── Room.ts
│   │   └── index.ts
│   │
│   ├── entities/               # 🆕 Shared domain entities
│   │   ├── BaseEntity.ts
│   │   └── Identifiable.ts
│   │
│   └── value-objects/         # 🆕 Shared value objects
│       ├── Money.ts
│       └── DateRange.ts
│
├── validation/
│   ├── schemas/
│   │   ├── user.schema.ts
│   │   ├── booking.schema.ts
│   │   ├── room.schema.ts
│   │   └── index.ts
│   │
│   └── validators/            # 🆕 Custom validators
│       ├── email.validator.ts
│       ├── phone.validator.ts
│       └── index.ts
│
├── constants/
│   ├── roles.ts
│   ├── statuses.ts
│   ├── config.ts
│   └── index.ts
│
├── errors/                    # 🆕 Shared error types
│   ├── AppError.ts
│   ├── ValidationError.ts
│   └── index.ts
│
├── utils/
│   ├── formatters.ts
│   ├── parsers.ts
│   ├── date-utils.ts
│   └── string-utils.ts
│
└── index.ts                   # Single export point
```

### Shared Types (Single Source of Truth)

```typescript
// packages/shared/src/domain/types/Booking.ts
/**
 * SHARED TYPE: Booking
 * Used across backend, frontend, and AI engine
 * Single source of truth
 */
export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  nights: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
}

export type BookingStatus = "Pending" | "Confirmed" | "Cancelled" | "Completed";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

// packages/shared/src/domain/types/index.ts
export * from "./User";
export * from "./Booking";
export * from "./Room";
export * from "./Notification";
```

### Shared Validation (Reusable in Backend & Frontend)

```typescript
// packages/shared/src/validation/schemas/booking.schema.ts
import { z } from "zod";

/**
 * SHARED SCHEMA: Booking Creation
 * Used for validation in:
 * - Backend API (express middleware)
 * - Frontend forms (client-side validation)
 * - AI engine (message validation)
 */
export const createBookingSchema = z
  .object({
    roomId: z.string().min(1, "Room ID required"),
    checkInDate: z.coerce
      .date()
      .min(new Date(), "Check-in must be future date"),
    checkOutDate: z.coerce.date(),
    guestCount: z.number().min(1).max(10),
  })
  .refine((data) => data.checkOutDate > data.checkInDate, {
    message: "Check-out must be after check-in",
    path: ["checkOutDate"],
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

// Usage in Backend
import { createBookingSchema } from "@unilodge/shared";

const validateCreateBooking = (data: unknown) => {
  return createBookingSchema.parse(data);
};

// Usage in Frontend
import { createBookingSchema } from "@unilodge/shared";

const { mutate: createBooking } = useMutation(async (data) => {
  const validated = createBookingSchema.parse(data);
  return await bookingService.createBooking(validated);
});
```

### Shared Constants

```typescript
// packages/shared/src/constants/roles.ts
export const USER_ROLES = {
  ADMIN: "ADMIN",
  WARDEN: "WARDEN",
  GUEST: "GUEST",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// packages/shared/src/constants/statuses.ts
export const BOOKING_STATUSES = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
} as const;

export const ROOM_STATUSES = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  MAINTENANCE: "Maintenance",
  INACTIVE: "Inactive",
} as const;

// packages/shared/src/constants/index.ts
export * from "./roles";
export * from "./statuses";
export * from "./config";
```

### Shared Error Types

```typescript
// packages/shared/src/errors/AppError.ts
/**
 * SHARED ERROR TYPES
 * Used consistently across all packages
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    message: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super("VALIDATION_ERROR", 400, message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super("NOT_FOUND", 404, `${resource} ${id} not found`);
  }
}

// Usage: Same error handling in all packages
import { ValidationError, NotFoundError } from "@unilodge/shared";

try {
  const booking = await bookingService.getBooking(id);
  if (!booking) {
    throw new NotFoundError("Booking", id);
  }
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation
  } else if (error instanceof NotFoundError) {
    // Handle not found
  }
}
```

### Shared Utilities

```typescript
// packages/shared/src/utils/formatters.ts
/**
 * SHARED FORMATTERS
 * Format data consistently across app
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const calculateNights = (checkIn: Date, checkOut: Date): number => {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

// Usage everywhere
import { formatPrice, calculateNights } from "@unilodge/shared";

console.log(formatPrice(1000)); // "$1,000.00"
const nights = calculateNights(checkIn, checkOut);
```

---

## Package.json Updates

```jsonc
{
  "name": "@unilodge/shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./types": "./dist/domain/types/index.js",
    "./schemas": "./dist/validation/schemas/index.js",
    "./errors": "./dist/errors/index.js",
    "./constants": "./dist/constants/index.js",
    "./utils": "./dist/utils/index.js",
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
  },
}
```

---

## Import Examples

### Backend

```typescript
import {
  Booking,
  User,
  Room,
  createBookingSchema,
  ValidationError,
  BOOKING_STATUSES,
  formatPrice,
} from "@unilodge/shared";
```

### Frontend

```typescript
import {
  Booking,
  createBookingSchema,
  ValidationError,
  USER_ROLES,
  formatDate,
} from "@unilodge/shared";
```

### AI Engine

```typescript
import {
  Booking,
  Room,
  ROOM_STATUSES,
  AppError,
  calculateNights,
} from "@unilodge/shared";
```

---

## Benefits

✅ **Single Source of Truth**: Types, schemas, constants defined once  
✅ **Consistency**: Same validation across all packages  
✅ **DRY**: No duplication of types, validators, utils  
✅ **Easy Updates**: Change once, applies everywhere  
✅ **Type Safety**: Full TypeScript support  
✅ **Zero Dependencies**: No external dependencies in shared package

---

## Migration Path

1. **Move Types**: Move all types from individual packages to shared
2. **Move Schemas**: Move Zod schemas to shared
3. **Move Constants**: Move constants to shared
4. **Move Utils**: Move utility functions to shared
5. **Move Errors**: Standardize error types in shared
6. **Update Imports**: Update all imports to use shared package
7. **Build & Test**: Build shared package and test in all consumers
