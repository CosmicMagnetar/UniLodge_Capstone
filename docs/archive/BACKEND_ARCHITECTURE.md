# UniLodge Backend Architecture

## Overview

The backend implements a **Serverless Modular Monolith** architecture with clear separation of concerns through the service layer pattern. All business logic is decoupled from API routes and database operations.

## Architecture Layers

### 1. **API Routes** (`/routes/api/`)

- Next.js API routes that handle HTTP requests
- Minimal logic - mostly request parsing and response formatting
- Error handling and logging
- Authorization checks

### 2. **Service Layer** (`/lib/services/`)

- Core business logic implementation
- Database operations using Supabase
- No HTTP knowledge (reusable from CLI, cron jobs, etc.)
- Input validation using Zod schemas
- Comprehensive error handling

### 3. **Database Layer** (`/database/`)

- PostgreSQL via Supabase
- Type-safe operations
- Indexes, triggers, and views for performance
- Row-Level Security (RLS) for multi-tenancy

### 4. **Utilities** (`/lib/utils/`)

- Helper functions (date, price, error handling)
- Validation functions
- Formatting utilities

### 5. **Schemas** (`packages/shared/src/schemas/`)

- Zod validation schemas (shared between frontend and backend)
- Type definitions derived from schemas
- Single source of truth for data validation

## Service Classes

### AuthService

Handles authentication and user management.

**Methods:**

- `signup(input)` - Register new user
- `login(input)` - Authenticate user
- `verifyToken(token)` - Validate JWT token
- `logout(token)` - Invalidate session
- `changePassword(userId, currentPassword, newPassword)` - Update password

**Key Features:**

- Supabase Auth integration
- User profile creation
- Session management

### RoomService

Manages room listing, searching, and availability.

**Methods:**

- `getRooms(filters)` - List rooms with filtering, search, pagination
- `getRoom(roomId)` - Get single room with reviews and ratings
- `createRoom(input, userId)` - Create new room (admin/warden)
- `updateRoom(roomId, input, userId)` - Update room details
- `checkAvailability(roomId, checkIn, checkOut)` - Check room availability
- `getRecommendations(budget, type, amenities)` - Get recommended rooms

**Key Features:**

- Advanced filtering (type, price range, availability)
- Full-text search across multiple fields
- Pagination support
- Room recommendations based on budget and preferences

### BookingService

Handles booking creation, management, and payment.

**Methods:**

- `createBooking(input, userId)` - Create new booking with conflict checking
- `getUserBookings(userId, status, paymentStatus)` - Get user's bookings
- `updateBookingStatus(bookingId, input, userId)` - Update booking status
- `processPayment(bookingId, paymentMethod, userId)` - Process payment
- `getPersonalizedRecommendations(userId)` - Get recommendations based on history

**Key Features:**

- Automatic conflict detection
- Dynamic price calculation
- Payment processing integration points
- Personalized recommendations

### NotificationService

Manages user notifications across the platform.

**Methods:**

- `createNotification(userId, input)` - Create notification
- `getUserNotifications(userId, unreadOnly, limit, offset)` - Get user notifications
- `getUnreadCount(userId)` - Get unread notification count
- `markAsRead(notificationId, userId)` - Mark single as read
- `markMultipleAsRead(notificationIds, userId)` - Mark multiple as read
- `markAllAsRead(userId)` - Mark all as read
- `deleteNotification(notificationId, userId)` - Delete notification
- `deleteAllNotifications(userId)` - Delete all notifications
- `notifyWarden(wardenId, bookingId, guestName, roomNumber)` - Alert warden
- `notifyBookingConfirmation(userId, bookingId, roomNumber)` - Confirm booking
- `notifyPaymentSuccess(userId, bookingId, amount)` - Payment notification

**Key Features:**

- Unread tracking
- Bulk operations
- Specialized notification methods for different events
- Silent failures (doesn't block operations)

### ReviewService

Manages room reviews and ratings.

**Methods:**

- `createReview(input, userId)` - Create new review
- `getRoomReviews(roomId, page, limit)` - Get room reviews with average rating
- `getReview(reviewId)` - Get single review
- `updateReview(reviewId, input, userId)` - Update review
- `deleteReview(reviewId, userId)` - Soft delete review
- `getUserReviews(userId, page, limit)` - Get user's reviews
- `getReviewsByFilter(filters)` - Advanced review filtering
- `markReviewHelpful(reviewId, userId)` - Mark as helpful

**Key Features:**

- Ownership verification (can only edit own reviews)
- Soft deletes (preserves data)
- Average rating calculation
- Helpful marking system

### AnalyticsService

Provides booking statistics and business insights.

**Methods:**

- `getWardenDashboard(wardenId)` - Warden dashboard stats
- `getBookingStatistics(filters)` - Booking metrics for date range
- `getRoomPopularity()` - Top rooms by bookings
- `getRevenueTrends(months)` - Revenue over time
- `getOccupancyRates(filters)` - Room occupancy percentages
- `getUserBookingStats(userId)` - User's booking history
- `getPaymentDistribution()` - Payment status breakdown
- `getPeakBookingPeriods()` - Busiest months

**Key Features:**

- Multiple dashboard perspectives (warden, user, admin)
- Revenue and occupancy tracking
- Trend analysis
- Peak period identification

### ContactService

Handles contact form submissions and support tickets.

**Methods:**

- `createContact(input)` - Submit contact form
- `getAllContacts(status, page, limit)` - Get all messages (admin)
- `getContact(contactId)` - Get single message
- `updateContactStatus(contactId, status)` - Update message status
- `respondToContact(contactId, message, respondedBy)` - Send response
- `deleteContact(contactId)` - Soft delete message
- `getContactStats()` - Contact statistics
- `searchContacts(searchTerm)` - Search by email/name

**Key Features:**

- Status tracking (new, read, responded, archived)
- Response system with email notifications
- Admin interface support
- Search functionality

## Database Schema

### Core Tables

- `bookings` - Booking records with status and payment info
- `rooms` - Room listings with availability and pricing
- `user_profiles` - User account information
- `reviews` - Room reviews and ratings
- `notifications` - User notifications
- `contacts` - Contact form submissions
- `booking_audit` - Audit trail for booking changes

### Advanced Features

- **Indexes** - Performance optimization for common queries
- **Functions** - PL/pgSQL functions for business logic
  - `is_room_available()` - Check availability for date range
  - `get_room_average_rating()` - Calculate average rating
  - `calculate_booking_price()` - Price determination
- **Views** - Materialized views for analytics
  - `active_bookings` - Non-cancelled bookings
  - `available_rooms` - Available properties
  - `booking_statistics` - Daily booking metrics
- **Triggers** - Automatic operations
  - `booking_audit_trigger` - Track booking changes

## API Routes Structure

```
/api
├── /auth
│   ├── /signup (POST) - Register user
│   └── /login (POST) - Authenticate user
├── /rooms
│   ├── / (GET) - List rooms with filters
│   ├── / (POST) - Create room (admin/warden)
│   └── /[roomId] (GET, PUT) - Get/update single room
├── /bookings
│   ├── / (GET, POST) - List/create bookings
│   └── /[bookingId] (GET, PUT, POST) - Get/update/pay booking
├── /reviews
│   ├── / (GET, POST) - List/create reviews
│   └── /[reviewId] (PUT, DELETE) - Update/delete review
├── /notifications
│   ├── / (GET, PATCH, DELETE) - Get/update/delete notifications
│   └── /[notificationId] (PATCH, DELETE) - Update/delete single
├── /contact
│   └── / (GET, POST) - Get/submit contact forms
├── /analytics
│   └── / (GET) - Get various analytics reports
└── /user
    ├── /profile (GET, PUT) - User profile
    └── /bookings (GET) - User's bookings
```

## Error Handling

### Error Classes

- `ValidationError` - Input validation failures (400)
- `UnauthorizedError` - Authentication/authorization failures (401)
- `NotFoundError` - Resource not found (404)
- `ConflictError` - Resource conflict (409)
- `BadRequestError` - Invalid request (400)

### Error Response Format

```json
{
  "error": {
    "name": "ValidationError",
    "message": "Invalid email format",
    "code": 400
  }
}
```

## Validation

All inputs are validated using Zod schemas before processing:

- Type checking
- Format validation (email, UUID, dates)
- Range validation (prices, ratings)
- Custom business logic validation

Schemas are shared between frontend and backend via `packages/shared`.

## Authentication

Uses Supabase Auth with:

- JWT token-based authentication
- Secure password hashing
- Token verification
- Session management
- Multi-factor authentication support (configured in Supabase)

Headers used:

- `x-user-id` - Current user's ID
- `x-user-role` - Current user's role (guest, warden, admin)

## Rate Limiting & Performance

### Database Optimization

- Composite indexes on frequently queried columns
- Pagination for large result sets
- Efficient query structure (avoiding N+1 problems)

### Caching Strategies

- Room availability checks validated at booking time
- Review aggregates calculated on demand
- Analytics views refreshed on schedule

## Security

- Input validation on all endpoints
- Authorization checks before operations
- Soft deletes preserve data integrity
- Audit trails track important changes
- Row-Level Security at database level

## Testing

### Unit Tests

Service classes are tested independently with:

- Mock database interactions
- Input validation tests
- Business logic verification
- Error handling

### Integration Tests

API routes tested with:

- Full request/response cycle
- Database state verification
- Authorization testing
- Error response validation

### E2E Tests

Full user workflows:

- Booking flow (search → book → pay → review)
- Authentication flow (signup → login → password change)
- Notification delivery

## Usage Examples

### Creating a Booking

```typescript
import { BookingService } from "@/lib/services";

const booking = await BookingService.createBooking(
  {
    roomId: "room-uuid",
    checkInDate: new Date("2024-06-01"),
    checkOutDate: new Date("2024-06-07"),
    notes: "Early check-in requested",
  },
  userId,
);
```

### Getting Room Recommendations

```typescript
import { RoomService } from "@/lib/services";

const recommendations = await RoomService.getRecommendations(
  budget: 200,
  roomType: "single",
  amenities: ["wifi", "kitchen"]
);
```

### Analytics Dashboard

```typescript
import { AnalyticsService } from "@/lib/services";

const stats = await AnalyticsService.getWardenDashboard(wardenId);
// Returns: totalBookings, confirmedBookings, revenue, etc.
```

## Deployment

### Environment Variables

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Database Setup

1. Run migrations: `supabase migration up`
2. Create RLS policies (via Supabase dashboard)
3. Configure edge functions

### Monitoring

- Log aggregation (Supabase logs)
- Performance monitoring (database query times)
- Error tracking (centralized logging)
- Analytics dashboard (built-in views)

## Future Enhancements

- [ ] Real-time notifications (WebSockets)
- [ ] Email service integration
- [ ] SMS notifications
- [ ] Advanced search (elasticsearch)
- [ ] Caching layer (Redis)
- [ ] Payment processor integration (Stripe)
- [ ] AI-powered recommendations
- [ ] Auto-scaling policies
