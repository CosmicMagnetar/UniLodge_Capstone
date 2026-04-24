# Frontend Architecture & Guide

## Overview

The UniLodge frontend is a **Next.js 14** application with **React 19**, providing a modern, responsive user interface for booking accommodations. The application uses **Tailwind CSS** for styling, **Zustand** for state management, and integrates with a backend API for all business logic.

**Technology Stack:**

- Framework: Next.js 14.2.35
- Runtime: React 19
- Styling: Tailwind CSS 3.4.0
- State Management: Zustand
- Validation: Zod
- Testing: Vitest + Playwright
- API Communication: Fetch API with custom APIClient
- Port: localhost:3000

## Project Structure

```
apps/frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Home page (landing)
│   │   └── [routes]/           # Dynamic routes
│   ├── components/
│   │   ├── common/             # Reusable components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── Badge.tsx
│   │   ├── booking/            # Booking-related components
│   │   │   └── BookingRequestModal.tsx
│   │   ├── charts/             # Data visualization
│   │   │   ├── SimpleAreaChart.tsx
│   │   │   └── CircularProgress.tsx
│   │   ├── chat/               # AI Chat components
│   │   │   ├── ChatWidget.tsx
│   │   │   └── AIChat.tsx
│   │   ├── dashboard/          # Dashboard variants
│   │   │   ├── GuestDashboard.tsx
│   │   │   ├── WardenDashboard.tsx
│   │   │   └── AdminDashboard.tsx
│   │   ├── payment/            # Payment components
│   │   └── ui/                 # Shadcn UI components
│   ├── pages/
│   │   ├── LoginPage.tsx       # Authentication
│   │   ├── HomePage.tsx        # Landing page
│   │   ├── GuestDashboard.tsx  # Guest view
│   │   ├── MyBookingsPage.tsx  # User bookings
│   │   └── [role]Dashboard.tsx # Role-based dashboards
│   ├── services/
│   │   ├── api.ts              # API client & endpoints
│   │   └── geminiService.ts    # Gemini AI integration
│   ├── hooks/
│   │   └── useToast.ts         # Toast notifications
│   ├── contexts/
│   │   └── ThemeContext.tsx    # Theme provider
│   ├── styles/
│   │   └── animations.css      # Custom animations
│   ├── types.ts                # Global TypeScript types
│   ├── index.tsx               # React entry point
│   ├── index.html              # HTML template
│   └── vite.config.ts          # Build configuration
├── tests/
│   ├── unit/
│   │   └── utils.test.ts
│   ├── integration/
│   │   └── workflow.test.ts
│   └── e2e/
│       └── main.spec.ts (Playwright)
├── tailwind.config.js          # Tailwind customization
├── postcss.config.js           # PostCSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies & scripts
```

## Key Components

### Authentication Components

- **LoginPage**: Form for user login/signup with email validation
- **SignupForm**: Registration with role selection and password confirmation
- **ProtectedRoute**: Wrapper for role-based access control

### Room Discovery

- **RoomCard**: Individual room listing with image, price, ratings
- **RoomGrid**: Responsive grid of room cards
- **RoomFilters**: Search, filter, and sort options
- **RoomDetail**: Full room page with reviews, booking options

### Booking Flow

- **BookingRequestModal**: Modal for selecting dates and initiating booking
- **BookingForm**: Form for booking details and special requests
- **PaymentWidget**: Payment method selection interface
- **BookingConfirmation**: Confirmation page after booking

### Dashboards

- **GuestDashboard**: Shows upcoming bookings, recommendations, bookings history
- **WardenDashboard**: Room management, pending approvals, occupancy stats
- **AdminDashboard**: System-wide analytics, user management, room approvals

### AI Features

- **ChatWidget**: Floating chat bubble for AI assistance
- **AIChat**: Full-page chat interface with message history
- **RecommendationCard**: Room recommendation from AI

### Common Components

- **Layout**: Page wrapper with header and footer
- **Header**: Navigation with user menu
- **Footer**: Company info and links
- **Badge**: Status indicators (pending, approved, booked)
- **LoadingPage**: Skeleton loaders and loading states

## State Management

### Zustand Stores

```typescript
// Auth Store
const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  role: 'GUEST',
  login: (email, password) => { /* ... */ },
  logout: () => { /* ... */ },
  isAuthenticated: () => /* ... */
}));

// Booking Store
const useBookingStore = create((set) => ({
  selectedDates: null,
  selectedRoom: null,
  bookingData: null,
  setSelectedRoom: (room) => { /* ... */ },
  createBooking: (data) => { /* ... */ }
}));

// Room Store
const useRoomStore = create((set) => ({
  rooms: [],
  filters: {},
  fetchRooms: (filters) => { /* ... */ },
  applyFilters: (filters) => { /* ... */ }
}));
```

## API Integration

### User API Endpoints

```typescript
// services/api.ts
const API = {
  auth: {
    signup: POST /api/auth/signup,
    login: POST /api/auth/login,
    logout: POST /api/auth/logout,
    refreshToken: POST /api/auth/refresh
  },

  rooms: {
    list: GET /api/rooms?filters,
    getById: GET /api/rooms/:id,
    create: POST /api/rooms (warden only),
    update: PUT /api/rooms/:id (warden only),
    search: GET /api/rooms/search?q=query,
    approve: POST /api/rooms/:id/approve (admin only),
    reject: POST /api/rooms/:id/reject (admin only)
  },

  bookings: {
    create: POST /api/bookings,
    getMyBookings: GET /api/bookings/mine,
    getById: GET /api/bookings/:id,
    updateStatus: PUT /api/bookings/:id/status,
    checkout: POST /api/bookings/:id/checkout
  },

  chat: {
    sendMessage: POST /api/chat,
    getRecommendations: GET /api/chat/recommendations?userId=id
  },

  analytics: {
    dashboard: GET /api/analytics/dashboard,
    occupancy: GET /api/analytics/occupancy,
    revenue: GET /api/analytics/revenue?period=7d,
    trends: GET /api/analytics/trends
  }
};
```

## Styling & Theme

### Tailwind Configuration

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      primary: {
        50: "#eff6ff",
        500: "#3b82f6", // Primary blue
        900: "#1e3a8a", // Dark blue
      },
      accent: {
        500: "#8b5cf6", // Purple
        600: "#7c3aed",
      },
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
    },
    // Custom spacing, typography, etc.
  },
};
```

### Dark Mode Support

The application includes a **ThemeContext** for light/dark mode toggling:

```typescript
// contexts/ThemeContext.tsx
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className={isDark ? 'dark' : 'light'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
```

## Form Validation

All forms use **Zod** for runtime validation with TypeScript type inference:

```typescript
// Common schemas (from shared package)
export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Must be at least 6 chars"),
});

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["GUEST", "WARDEN", "ADMIN"]),
});

export const bookingSchema = z.object({
  roomId: z.string(),
  checkInDate: z.date(),
  checkOutDate: z.date(),
  specialRequests: z.string().optional(),
});

// Form usage
const form = useForm<z.infer<typeof loginSchema>>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: "", password: "" },
});
```

## Testing Strategy

### Unit Tests (`tests/unit/`)

Test isolated utility functions and hooks:

```typescript
// tests/unit/utils.test.ts
describe("Price Formatting", () => {
  it("should format price as USD currency", () => {
    expect(formatPrice(9999)).toBe("$9,999.00");
  });
});

describe("Date Functions", () => {
  it("should calculate nights between dates", () => {
    const checkIn = new Date("2024-01-01");
    const checkOut = new Date("2024-01-05");
    expect(calculateNights(checkIn, checkOut)).toBe(4);
  });
});
```

### Integration Tests (`tests/integration/`)

Test component interactions and user workflows:

```typescript
// tests/integration/workflow.test.ts
describe("Booking Workflow", () => {
  it("should complete booking from room search to confirmation", async () => {
    // Setup
    const { render } = setup();

    // Search for rooms
    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    // Select room and dates
    const room = screen.getByText("Luxury Suite");
    await userEvent.click(room);

    // Complete booking
    await userEvent.click(
      screen.getByRole("button", { name: /confirm booking/i }),
    );

    // Verify success
    expect(screen.getByText(/booking confirmed/i)).toBeInTheDocument();
  });
});
```

### E2E Tests (`tests/e2e/`)

Test complete user flows with Playwright:

```typescript
// tests/e2e/main.spec.ts
test("Complete booking flow", async ({ page }) => {
  await page.goto("http://localhost:3000");

  // Login
  await page.fill('[name="email"]', "guest@example.com");
  await page.fill('[name="password"]', "password123");
  await page.click('button:has-text("Login")');

  // Search and book
  await page.fill('input[placeholder*="Search"]', "double room");
  await page.click("text=Search");

  const roomCard = page.locator('[data-testid="room-card"]').first();
  await roomCard.hover();
  await roomCard.locator('button:has-text("Book")').click();

  // Expect booking modal
  await expect(page.locator('[role="dialog"]')).toBeVisible();
});
```

## Performance Optimization

### Image Optimization

- Use `next/image` for automatic optimization
- Lazy loading by default
- WebP format generation

### Code Splitting

- Dynamic imports for heavy components
- Route-based code splitting
- Component-level lazy loading

```typescript
const ChatWidget = dynamic(() => import('./ChatWidget'), {
  loading: () => <div>Loading...</div>,
  ssr: false
});
```

### Caching Strategies

- API responses cached with React Query (or SWR)
- LocalStorage for user preferences
- IndexedDB for offline support (future)

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key
NEXT_PUBLIC_APP_NAME=UniLodge
```

## Running the Frontend

```bash
# Development
npm run dev          # Runs on localhost:3000

# Build for production
npm run build

# Type checking
npm run type-check

# Testing
npm run test         # Unit & integration
npm run test:watch   # Watch mode
npm run test:e2e     # E2E tests with Playwright

# Linting
npm run lint
```

## API Routing Configuration

**Current Issue**: Frontend API calls to `/api/*` routes are returning 404.

**Solution**: Update `next.config.js` to proxy backend requests:

```typescript
// next.config.js
const nextConfig = {
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: "http://localhost:3001/api/:path*",
          // For production:
          // destination: 'https://api.unilodge.com/:path*'
        },
      ],
    };
  },
};
```

Then restart the frontend server for changes to take effect.

## Common Issues & Solutions

| Issue                           | Solution                                                        |
| ------------------------------- | --------------------------------------------------------------- |
| Tailwind CSS not working        | Ensure `postcss.config.js` exists with tailwindcss plugin       |
| TypeScript errors in components | Run `npm run type-check` to validate                            |
| API requests failing            | Verify backend running on port 3001 and check API routes        |
| ESM import errors               | Update to latest Next.js and use `.js` extensions in imports    |
| Out of memory during build      | Increase Node.js heap: `NODE_OPTIONS=--max-old-space-size=4096` |

## Next Steps for Enhancement

1. **SEO Optimization**: Add metadata, Open Graph tags, structured data
2. **Progressive Web App**: Add service worker and offline support
3. **Internationalization**: Support multiple languages (i18n)
4. **Real-time Updates**: WebSocket integration for live booking updates
5. **Advanced Analytics**: User behavior tracking with event system
6. **Payment Integration**: Implement Stripe or PayPal integration
7. **Image Upload**: S3 integration for user-uploaded room photos
