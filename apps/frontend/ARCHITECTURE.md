# Frontend Architecture

This is a properly structured Next.js 14+ frontend application using system design principles with a scalable, maintainable architecture.

## Folder Structure

```
apps/frontend/
├── app/                          # Next.js 14 App Router pages
│   ├── auth/
│   │   ├── login/page.tsx       # Login page
│   │   └── signup/page.tsx      # Signup page
│   ├── dashboard/page.tsx       # Guest dashboard
│   ├── bookings/page.tsx        # Bookings list
│   ├── profile/page.tsx         # User profile
│   ├── warden/                  # Warden routes
│   ├── admin/                   # Admin routes
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/
│   ├── layout/                  # Layout components
│   │   ├── AppProvider.tsx      # Auth & routing provider
│   │   ├── Header.tsx           # Navigation header
│   │   └── index.ts             # Exports
│   ├── ui/                      # Reusable UI components
│   │   ├── FormComponents.tsx   # TextField, Button, Card, Badge, etc.
│   │   ├── Toast.tsx            # Toast notification
│   │   ├── ToastDisplay.tsx     # Toast container
│   │   └── index.ts             # Exports
│   └── common/                  # Common components
├── features/                    # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   └── hooks/               # Auth-specific hooks
│   ├── booking/
│   │   ├── components/
│   │   │   └── BookingsPage.tsx
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── dashboard/
│   │   └── components/
│   │       └── GuestDashboard.tsx
│   ├── profile/
│   ├── rooms/
│   ├── notifications/
│   ├── warden/
│   └── admin/
├── hooks/                       # Global hooks
│   ├── useAuth.ts              # Zustand auth store
│   ├── useRooms.ts             # Zustand rooms store
│   ├── useBookings.ts          # Zustand bookings store
│   └── index.ts                # Exports
├── services/                    # API service layer
│   ├── api.ts                  # All API endpoints
│   └── index.ts                # Exports
├── contexts/                    # Context providers
│   ├── ToastContext.tsx        # Global toast notifications
│   └── index.ts                # Exports
├── types/                       # TypeScript types & interfaces
│   └── index.ts
├── lib/
│   ├── utils/                  # Utility functions
│   ├── helpers/                # Helper functions
│   └── constants/              # Constants
├── styles/                      # Global styles
├── public/                      # Static assets
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json
```

## Architecture Principles

### 1. Service Layer Pattern

All API communication goes through the `services/api.ts` file with organized service objects:

- `authService` - Authentication endpoints
- `roomsService` - Room management
- `bookingsService` - Booking operations
- `reviewsService` - Reviews
- `notificationsService` - Notifications

### 2. State Management (Zustand)

Global state managed with Zustand stores:

- `useAuthStore` - User authentication and profile
- `useRoomsStore` - Room data and filtering
- `useBookingsStore` - Booking data and operations

Benefits:

- Simple, lightweight alternative to Redux
- Automatic localStorage persistence
- Async actions built-in

### 3. Feature-Based Organization

Each feature (auth, booking, dashboard, etc.) has its own folder with:

- `components/` - React components
- `hooks/` - Feature-specific hooks
- `services/` - Feature API calls
- `types/` - Feature TypeScript types

### 4. Context API

- `ToastContext` - Global toast notifications for user feedback
- Providers wrapped in `AppProvider` for centralized initialization

### 5. Component Library

Reusable UI components in `components/ui/`:

- `TextField` - Text input with validation
- `SelectField` - Dropdown select
- `TextAreaField` - Multi-line text
- `Button` - Styled button (primary/secondary/danger)
- `Card` - Card container
- `Badge` - Status badge

### 6. Type Safety

- `types/index.ts` - All TypeScript interfaces
- Zod validation on backend, TypeScript types on frontend
- Strict mode enabled

## Key Features

### Authentication Flow

```
1. User signs up/logs in via LoginForm/SignupForm
2. Credentials sent to API via authService
3. User & token stored in useAuthStore
4. Token persisted to localStorage
5. AppProvider checks auth on mount
6. Protected routes auto-redirect if not authenticated
7. Header shows user info and logout button
```

### Room Discovery & Booking

```
1. Guest Dashboard displays available rooms
2. Rooms loaded from roomsService.getRooms()
3. User can search and filter by type
4. Rooms stored in useRoomsStore
5. Click "Book Now" to start booking
6. Booking data persisted in useBookingsStore
```

### Toast Notifications

```
1. ToastContext wraps entire app
2. Components use useToast() hook
3. success(), error(), info(), warning() methods
4. Toasts auto-display and auto-dismiss
5. Persistent for important messages
```

## How to Use Components

### TextField

```tsx
<TextField
  label="Email"
  name="email"
  type="email"
  value={email}
  onChange={handleChange}
  error={errors.email}
  helperText="Enter a valid email"
  required
/>
```

### Button

```tsx
<Button variant="primary" size="lg" loading={isLoading}>
  Submit
</Button>
```

### Card

```tsx
<Card title="Room Details" description="View room information">
  {/* Card content */}
</Card>
```

### Toast

```tsx
const { success, error, info } = useToast();

success("Profile updated!");
error("Failed to save");
info("Processing request...");
```

### useAuthStore

```tsx
const { user, login, logout, isAuthenticated } = useAuthStore()

// Login
await login(email, password)

// Logout
await logout()

// Check auth status
if (isAuthenticated) { ... }
```

### useRoomsStore

```tsx
const { rooms, filteredRooms, fetchRooms, filterRooms } = useRoomsStore();

// Fetch rooms
await fetchRooms();

// Filter rooms
filterRooms({ type: "DOUBLE", minPrice: 5000 });
```

## Development Workflow

1. **Start Development Server**

   ```bash
   npm run dev
   ```

2. **Type Checking**

   ```bash
   npm run type-check
   ```

3. **Run Tests**

   ```bash
   npm run test
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm run start
   ```

## API Integration

All API calls go through `services/api.ts`:

```tsx
// Fetch rooms
const rooms = await roomsService.getRooms();

// Create booking
const booking = await bookingsService.createBooking({
  roomId: "123",
  checkInDate: "2024-05-01",
  checkOutDate: "2024-05-31",
});

// Update profile
const user = await authService.updateProfile({ name: "John" });
```

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Key Files to Understand

- `app/layout.tsx` - Root layout with providers
- `services/api.ts` - All API endpoints and error handling
- `hooks/useAuth.ts` - Auth state management
- `components/layout/AppProvider.tsx` - Auth check and routing
- `contexts/ToastContext.tsx` - Global notifications
- `features/*/components/*.tsx` - Page-level components

## Best Practices

1. ✅ Use components from `components/ui/` for consistency
2. ✅ Handle errors with useToast()
3. ✅ Validate forms before submission
4. ✅ Use TypeScript strictly
5. ✅ Keep components small and focused
6. ✅ Use hooks for shared logic
7. ✅ Fetch data in useEffect with dependency arrays
8. ✅ Protect routes with AppProvider authentication check

## Common Patterns

### Protected Page

```tsx
"use client";
import { useAuthStore } from "@/hooks";

export function Page() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Redirect />;

  return <PageContent />;
}
```

### API Call with Error Handling

```tsx
const { success, error } = useToast();

try {
  await authService.login(email, password);
  success("Login successful!");
} catch (err: any) {
  error(err.message || "Login failed");
}
```

### Form with Validation

```tsx
const [errors, setErrors] = useState({});

const validateForm = () => {
  const errs = {};
  if (!email) errs.email = "Required";
  setErrors(errs);
  return Object.keys(errs).length === 0;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  // Submit form
};
```

## Next Steps

1. Implement Booking creation flow
2. Add Warden dashboard pages
3. Add Admin dashboard pages
4. Implement Reviews feature
5. Add Advanced filtering
6. Implement Notifications real-time
7. Add File uploads for room images
