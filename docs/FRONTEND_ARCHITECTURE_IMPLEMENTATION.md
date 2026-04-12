# Frontend Refactoring Implementation Guide

**Status**: Architecture refactoring with Design Patterns & SOLID principles  
**Date**: April 13, 2026  
**Framework**: Next.js 14 + React 19

---

## New Frontend Folder Structure

```
apps/frontend/
├── app/                           # Next.js app router
│   ├── (dashboard)/
│   ├── (auth)/
│   └── layout.tsx
│
├── src/
│   ├── features/                  # 🆕 Feature-based organization
│   │   ├── bookings/
│   │   │   ├── components/        # Booking-specific components
│   │   │   ├── hooks/             # useBooking, useBookings
│   │   │   ├── services/          # BookingService (API calls)
│   │   │   ├── store/             # Zustand store for bookings
│   │   │   ├── types.ts           # Booking types
│   │   │   └── index.ts
│   │   │
│   │   ├── rooms/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── types.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── types.ts
│   │   │
│   │   └── notifications/
│   │       └── ...
│   │
│   ├── shared/                    # 🆕 Shared across features
│   │   ├── api/
│   │   │   ├── client.ts          # Axios/Fetch client (Singleton)
│   │   │   ├── interceptors.ts    # Request/response interceptors
│   │   │   └── config.ts          # API configuration
│   │   │
│   │   ├── errors/                # Custom error types
│   │   │   ├── AppError.ts
│   │   │   ├── ValidationError.ts
│   │   │   └── handlers.ts
│   │   │
│   │   ├── hooks/                 # Reusable hooks
│   │   │   ├── useAsync.ts        # Async data fetching
│   │   │   ├── useMutation.ts     # Mutations with states
│   │   │   ├── useLocalStorage.ts
│   │   │   └── useDebounce.ts
│   │   │
│   │   ├── utils/                 # Utilities
│   │   │   ├── validators.ts
│   │   │   ├── formatters.ts
│   │   │   └── helpers.ts
│   │   │
│   │   ├── components/            # Reusable UI components
│   │   │   ├── Button/
│   │   │   ├── Modal/
│   │   │   ├── Form/
│   │   │   └── ...
│   │   │
│   │   └── types/                 # Global types
│   │       └── index.ts
│   │
│   ├── config/                    # Global configuration
│   │   ├── env.ts                 # Environment variables with validation
│   │   └── constants.ts           # Constants
│   │
│   └── styles/                    # Global styles
│       └── globals.css
│
├── public/
├── package.json
└── tsconfig.json
```

---

## Key Patterns for Frontend

### 1. API Client - Singleton Pattern

```typescript
// src/shared/api/client.ts
import axios, { AxiosInstance } from "axios";

/**
 * API Client - Singleton Pattern
 * Ensures only one HTTP client instance
 */
export class ApiClient {
  private static instance: AxiosInstance;

  static getInstance(): AxiosInstance {
    if (!ApiClient.instance) {
      ApiClient.instance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Add interceptors
      this.setupInterceptors(ApiClient.instance);
    }

    return ApiClient.instance;
  }

  private static setupInterceptors(client: AxiosInstance): void {
    // Request interceptor - Add auth token
    client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - Handle errors
    client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          localStorage.removeItem("authToken");
          window.location.href = "/login";
        }
        throw error.response?.data || error;
      },
    );
  }
}
```

### 2. Service Layer (Repository Pattern)

```typescript
// src/features/bookings/services/BookingService.ts
import { ApiClient } from "@/shared/api/client";
import { Booking, CreateBookingInput, BookingFilter } from "../types";
import { ValidationError, NotFoundError } from "@/shared/errors/AppError";

/**
 * SERVICE: BookingService
 * Repository Pattern - Abstract API calls
 * Can be tested, mocked, or replaced with alternative implementation
 */
export class BookingService {
  private client = ApiClient.getInstance();
  private baseURL = "/api/bookings";

  /**
   * Get all bookings (paginated)
   */
  async getBookings(filter?: BookingFilter): Promise<Booking[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.status) params.append("status", filter.status);
      if (filter?.limit) params.append("limit", filter.limit.toString());

      const response = await this.client.get(this.baseURL, { params });
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch bookings");
    }
  }

  /**
   * Get single booking
   */
  async getBooking(id: string): Promise<Booking> {
    try {
      const response = await this.client.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.status === 404) {
        throw new NotFoundError("Booking", id);
      }
      throw error;
    }
  }

  /**
   * Create booking
   */
  async createBooking(input: CreateBookingInput): Promise<Booking> {
    try {
      // Validate input
      if (!input.roomId) throw new ValidationError("roomId is required");
      if (!input.checkInDate)
        throw new ValidationError("checkInDate is required");
      if (!input.checkOutDate)
        throw new ValidationError("checkOutDate is required");

      const response = await this.client.post(this.baseURL, {
        roomId: input.roomId,
        checkInDate: input.checkInDate.toISOString(),
        checkOutDate: input.checkOutDate.toISOString(),
        guestCount: input.guestCount,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Confirm booking
   */
  async confirmBooking(id: string): Promise<Booking> {
    try {
      const response = await this.client.post(`${this.baseURL}/${id}/confirm`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(id: string): Promise<{ refund: number }> {
    try {
      const response = await this.client.post(`${this.baseURL}/${id}/cancel`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const bookingService = new BookingService();
```

### 3. Custom Data Fetching Hooks

```typescript
// src/shared/hooks/useAsync.ts
import { useEffect, useState, useCallback } from "react";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * HOOK: useAsync
 * Generic hook for async operations (data fetching)
 * Handles loading, error, and success states
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true,
): AsyncState<T> & { retry: () => Promise<void> } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await asyncFunction();
      setState({ data: response, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, retry: execute };
}

// Usage
/*
const { data: bookings, loading, error, retry } = useAsync(
  () => bookingService.getBookings(),
  true  // execute immediately
);

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
return <div>{bookings?.map(b => <BookingCard key={b.id} booking={b} />)}</div>;
*/
```

### 4. Mutation Hook for Mutations (POST, PUT, DELETE)

```typescript
// src/shared/hooks/useMutation.ts
import { useState, useCallback } from "react";

export interface MutationState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  success: boolean;
}

/**
 * HOOK: useMutation
 * Hook for POST, PUT, DELETE operations
 * Controlled via .mutate() call
 */
export function useMutation<TInput, TOutput>(
  asyncFunction: (input: TInput) => Promise<TOutput>,
) {
  const [state, setState] = useState<MutationState<TOutput>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const mutate = useCallback(
    async (input: TInput) => {
      setState({ data: null, loading: true, error: null, success: false });

      try {
        const response = await asyncFunction(input);
        setState({
          data: response,
          loading: false,
          error: null,
          success: true,
        });
        return response;
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error as Error,
          success: false,
        });
        throw error;
      }
    },
    [asyncFunction],
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null, success: false });
  }, []);

  return { ...state, mutate, reset };
}

// Usage
/*
const { mutate: createBooking, loading, error, success } = useMutation(
  (input: CreateBookingInput) => bookingService.createBooking(input)
);

const handleBooking = async () => {
  try {
    const newBooking = await createBooking({
      roomId: '123',
      checkInDate: new Date('2024-05-01'),
      checkOutDate: new Date('2024-05-10'),
      guestCount: 2,
    });
    console.log('Booking created:', newBooking);
  } catch (error) {
    console.error('Booking failed:', error);
  }
};
*/
```

### 5. Zustand Store for State Management

```typescript
// src/features/bookings/store/bookingStore.ts
import { create } from "zustand";
import { Booking, BookingFilter } from "../types";

interface BookingStore {
  // State
  bookings: Booking[];
  selectedBooking: Booking | null;
  filter: BookingFilter;
  loading: boolean;
  error: Error | null;

  // Actions
  setBookings: (bookings: Booking[]) => void;
  selectBooking: (booking: Booking) => void;
  clearSelection: () => void;
  setFilter: (filter: BookingFilter) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  cancelBooking: (id: string) => void;
}

/**
 * ZUSTAND STORE: bookingStore
 * Centralized state management
 * OCP: Easy to add new actions without modifying existing ones
 */
export const useBookingStore = create<BookingStore>((set) => ({
  bookings: [],
  selectedBooking: null,
  filter: {},
  loading: false,
  error: null,

  setBookings: (bookings) => set({ bookings }),
  selectBooking: (booking) => set({ selectedBooking: booking }),
  clearSelection: () => set({ selectedBooking: null }),
  setFilter: (filter) => set({ filter }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addBooking: (booking) =>
    set((state) => ({
      bookings: [booking, ...state.bookings],
    })),

  updateBooking: (id, updates) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, ...updates } : b,
      ),
    })),

  cancelBooking: (id) =>
    set((state) => ({
      bookings: state.bookings.filter((b) => b.id !== id),
    })),
}));

// Usage in components
/*
const MyBookingsPage = () => {
  const { bookings, loading, addBooking } = useBookingStore();

  return (
    // Component JSX
  );
};
*/
```

### 6. Feature-Based Component

```typescript
// src/features/bookings/components/BookingList.tsx
'use client';

import { useAsync } from '@/shared/hooks/useAsync';
import { useBookingStore } from '../store/bookingStore';
import { bookingService } from '../services/BookingService';
import { BookingCard } from './BookingCard';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ErrorAlert } from '@/shared/components/ErrorAlert';

/**
 * COMPONENT: BookingList
 * Feature-specific component
 * Uses service layer and custom hooks
 * SRP: Only responsible for rendering bookings
 */
export function BookingList() {
  const { bookings, loading, error, retry } = useAsync(
    () => bookingService.getBookings(),
    true
  );

  const { setBookings } = useBookingStore();

  // Sync API data with store
  React.useEffect(() => {
    if (bookings) {
      setBookings(bookings);
    }
  }, [bookings, setBookings]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} onRetry={retry} />;
  if (!bookings?.length) return <div>No bookings found</div>;

  return (
    <div className="grid grid-cols-1 gap-4">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
```

---

## SOLID Principles in Frontend

| Principle | Implementation                                                    |
| --------- | ----------------------------------------------------------------- |
| **S**     | Each component has single purpose; Services only handle API calls |
| **O**     | Can add new features (rooms, auth) without modifying existing     |
| **L**     | Services are interchangeable (mock vs real API)                   |
| **I**     | Small, focused hooks and services                                 |
| **D**     | Inject services into components; depend on interfaces             |

---

## Migration Strategy

### Phase 1: Setup

- [x] Create folder structure
- [ ] Create API client (Singleton)
- [ ] Setup error handling

### Phase 2: Services

- [ ] Create service for each feature (Booking, Room, Auth)
- [ ] Implement Repository Pattern
- [ ] Test services with mock API

### Phase 3: Hooks

- [ ] Create useAsync hook
- [ ] Create useMutation hook
- [ ] Create feature-specific hooks

### Phase 4: State Management

- [ ] Create Zustand stores
- [ ] Wire stores into components
- [ ] Test state updates

### Phase 5: Components

- [ ] Refactor components to use services
- [ ] Connect components to stores
- [ ] Remove direct API calls from components

### Phase 6: Testing

- [ ] Write service tests
- [ ] Write component tests
- [ ] E2E testing

---

## Benefits

✅ **Testable**: Services can be mocked  
✅ **Reusable**: Services used across multiple components  
✅ **Maintainable**: Changes isolated to specific layers  
✅ **Scalable**: Easy to add new features  
✅ **Decoupled**: Components don't know about HTTP

---

## Common Patterns

### Retry Logic

```typescript
const { data, error, retry } = useAsync(
  () => bookingService.getBookings(),
  true
);

<button onClick={retry} disabled={loading}>
  {error ? 'Retry' : 'Refresh'}
</button>
```

### Debounced Search

```typescript
const [search, setSearch] = useState("");
const debouncedSearch = useDebounce(search, 300);

const { data: results } = useAsync(
  () => roomService.search(debouncedSearch),
  !!debouncedSearch,
);
```

### Optimistic Updates

```typescript
const handleCancelBooking = async (bookingId: string) => {
  // Optimistically update UI
  cancelBooking(bookingId);
  setLoading(true);

  try {
    // Make API call
    await bookingService.cancelBooking(bookingId);
  } catch (error) {
    // Revert on error
    addBooking(originalBooking);
    setError(error);
  } finally {
    setLoading(false);
  }
};
```

---

## Notes

- Use `'use client'` directive in feature components that need interactivity
- Keep server components for static content and data fetching
- Store sensitive data (auth token) in httpOnly cookies (not localStorage)
- Use React.lazy and Suspense for code splitting
