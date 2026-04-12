# Sequence Diagrams - Workflow Interactions

## 1. User Authentication Flow (Sign Up & Login)

```mermaid
sequenceDiagram
    actor User
    User->>Frontend: Click Sign Up
    User->>Frontend: Enter email, password, name
    Frontend->>+Backend: POST /auth/signup (email, password, name)
    Backend->>+AuthService: signup(email, password, name)
    AuthService->>+MongoDB: Check if email exists
    MongoDB-->>-AuthService: Email not found (OK)
    AuthService->>+MongoDB: Hash password with bcrypt
    MongoDB-->>-AuthService: $2a$10$...hashed
    AuthService->>+MongoDB: Create User document
    MongoDB-->>-AuthService: User { _id, email, role }
    AuthService->>AuthService: Generate JWT tokens
    AuthService-->>-Backend: { accessToken, refreshToken, user }
    Backend-->>-Frontend: 200 OK { token, user }
    Frontend->>Frontend: Store token in localStorage
    Frontend->>Frontend: Redirect to Dashboard
```

```mermaid
sequenceDiagram
    actor User
    User->>Frontend: Enter email & password
    User->>Frontend: Click Login
    Frontend->>+Backend: POST /auth/login (email, password)
    Backend->>+AuthService: login(email, password)
    AuthService->>+MongoDB: Find user by email
    MongoDB-->>-AuthService: User { _id, email, password_hash }
    AuthService->>AuthService: Compare provided password with hash
    AuthService->>AuthService: Passwords match ✓
    AuthService->>AuthService: Generate JWT accessToken & refreshToken
    AuthService-->>-Backend: { accessToken, refreshToken, user }
    Backend-->>-Frontend: 200 OK
    Frontend->>Frontend: Save token to localStorage
    Frontend->>Frontend: Update AuthContext
    Frontend->>Frontend: Redirect to appropriate dashboard
```

## 2. Room Listing & Search Flow

```mermaid
sequenceDiagram
    actor Guest
    Guest->>Frontend: Landing page loads
    Frontend->>+Backend: GET /api/rooms?filters...
    Backend->>+RoomService: getAllRooms(filters)
    RoomService->>+MongoDB: Find rooms with approvalStatus='approved'
    MongoDB-->>-RoomService: [Room, Room, Room, ...]
    RoomService->>RoomService: Apply filters (type, price, capacity)
    RoomService->>RoomService: Sort by rating/price
    RoomService-->>-Backend: Filtered room array
    Backend-->>-Frontend: 200 OK [rooms]
    Frontend->>Frontend: Render RoomCard for each room
    Guest->>Frontend: Scroll and view rooms
    Guest->>Frontend: Click on room
    Frontend->>+Backend: GET /api/rooms/:id
    Backend->>+RoomService: getRoomById(id)
    RoomService->>+MongoDB: findById(roomId)
    MongoDB-->>-RoomService: Room document
    RoomService->>+MongoDB: Find reviews for this room
    MongoDB-->>-RoomService: [Review, Review, ...]
    RoomService-->>-Backend: Complete room with reviews
    Backend-->>-Frontend: 200 OK { room, reviews[] }
    Frontend->>Frontend: Display room details & reviews
```

## 3. Booking Request & Confirmation Flow

```mermaid
sequenceDiagram
    actor Guest
    Guest->>Frontend: Select check-in and checkout dates
    Guest->>Frontend: Click "Book Now"
    Frontend->>+Backend: POST /api/bookings/request
    Backend->>+AuthMiddleware: Verify JWT token
    AuthMiddleware-->>-Backend: User authenticated
    Backend->>+BookingService: createBooking(userId, roomId, dates)
    BookingService->>+RoomService: checkAvailability(roomId, dates)
    RoomService->>+MongoDB: Query overlapping bookings
    MongoDB-->>-RoomService: No overlaps found ✓
    RoomService-->>-BookingService: Available
    BookingService->>+MongoDB: Create booking document
    MongoDB-->>-BookingService: Booking { status='Pending' }
    BookingService->>+NotificationService: createNotification(wardenId)
    NotificationService->>+MongoDB: Save notification
    MongoDB-->>-NotificationService: Notification created
    NotificationService-->>-BookingService: Done
    BookingService-->>-Backend: Booking { _id, status, totalPrice }
    Backend-->>-Frontend: 200 OK { bookingId }
    Frontend->>Frontend: Show confirmation
    Guest->>Frontend: Click "Pay Now"
    Frontend->>+Backend: POST /api/bookings/:id/pay
    Backend->>+BookingService: processPayment(bookingId, method)
    BookingService->>+PaymentService: Charge card (stub)
    PaymentService-->>-BookingService: Transaction success
    BookingService->>+MongoDB: Update booking { paymentStatus='paid' }
    MongoDB-->>-BookingService: Updated
    BookingService-->>-Backend: Success
    Backend-->>-Frontend: 200 OK
    Frontend->>Frontend: Redirect to "My Bookings"

    note over Warden: Notification arrives
    Warden->>Frontend: View pending bookings
    Warden->>+Backend: POST /api/bookings/:id/confirm
    Backend->>+BookingService: updateBookingStatus(bookingId, 'Confirmed')
    BookingService->>+MongoDB: Update booking status
    MongoDB-->>-BookingService: Updated
    BookingService->>+NotificationService: Notify guest
    NotificationService-->>-BookingService: Done
    BookingService-->>-Backend: Confirmed booking
    Backend-->>-Frontend: 200 OK
    Warden->>Frontend: Booking confirmed

    note over Guest: Guest receives notification
```

## 4. AI Chat & Recommendations Flow

```mermaid
sequenceDiagram
    actor Guest
    Guest->>Frontend: Open Chat Widget
    Guest->>Frontend: "What rooms do you recommend?"
    Frontend->>+Backend: POST /api/chat/message
    Backend->>+ChatController: chat(message, userId)
    ChatController->>+AIChatService: generateResponse(message)
    AIChatService->>+HuggingFace: Generate text response
    HuggingFace-->>-AIChatService: "Based on your preferences..."
    AIChatService-->>-ChatController: response text
    ChatController-->>-Backend: response
    Backend->>+AIChatService: getRecommendations(userId)
    AIChatService->>+MongoDB: getUserBookings(userId)
    MongoDB-->>-AIChatService: [Booking, Booking, ...]
    AIChatService->>AIChatService: analyzeUserPreferences(bookings)
    AIChatService->>+RecommendationEngine: generateRecommendations(prefs)
    RecommendationEngine->>+MongoDB: Get all approved rooms
    MongoDB-->>-RecommendationEngine: [Room, Room, ...]
    RecommendationEngine->>RecommendationEngine: Score rooms based on preferences
    RecommendationEngine->>RecommendationEngine: Rank by score
    RecommendationEngine-->>-AIChatService: Top 5 rooms
    AIChatService-->>-Backend: { response, recommendations[] }
    Backend-->>-Frontend: { message, rooms[] }
    Frontend->>Frontend: Display AI response + cards
    Guest->>Frontend: View recommended rooms
```

## 5. Admin Dashboard Analytics Flow

```mermaid
sequenceDiagram
    actor Admin
    Admin->>Frontend: Access Admin Dashboard
    Frontend->>+Backend: GET /api/analytics/dashboard
    Backend->>+AuthMiddleware: Verify admin role
    AuthMiddleware-->>-Backend: Authorized ✓
    Backend->>+AnalyticsService: getDashboardStats()

    par Parallel Queries
        AnalyticsService->>+MongoDB: Occupancy rate calc
        MongoDB-->>-AnalyticsService: 78%
    and
        AnalyticsService->>+MongoDB: Revenue in last 30 days
        MongoDB-->>-AnalyticsService: $15,420
    and
        AnalyticsService->>+MongoDB: Popular rooms aggregate
        MongoDB-->>-AnalyticsService: Top 5 rooms
    and
        AnalyticsService->>+MongoDB: User demographics
        MongoDB-->>-AnalyticsService: {guests: 1200, wardens: 45}
    end

    AnalyticsService->>AnalyticsService: Compile statistics
    AnalyticsService-->>-Backend: { occupancy, revenue, topRooms, demographics }
    Backend-->>-Frontend: 200 OK { stats }
    Frontend->>Frontend: Render charts (Area, Circular Progress)
    Admin->>Frontend: View visualizations
    Admin->>Frontend: Click on revenue chart
    Frontend->>+Backend: GET /api/analytics/revenue?period=7d
    Backend->>+AnalyticsService: getRevenueStats('7d')
    AnalyticsService->>+MongoDB: Query bookings with paymentStatus='paid'
    MongoDB-->>-AnalyticsService: Filtered bookings
    AnalyticsService->>AnalyticsService: Aggregate by date
    AnalyticsService-->>-Backend: Daily revenue array
    Backend-->>-Frontend: 200 OK { dailyRevenue[] }
    Frontend->>Frontend: Update chart with detailed data
```

## 6. Room Approval Workflow (Warden → Admin)

```mermaid
sequenceDiagram
    actor Warden
    Warden->>Frontend: Click "Add New Room"
    Warden->>Frontend: Fill room details (type, price, amenities)
    Warden->>Frontend: Upload room photos
    Warden->>+Backend: POST /api/rooms/create
    Backend->>+AuthMiddleware: Verify warden role
    AuthMiddleware-->>-Backend: Authorized ✓
    Backend->>+RoomService: createRoom(data, wardenId)
    RoomService->>RoomService: Validate room data (price, capacity, etc)
    RoomService->>+MongoDB: Create room with approvalStatus='pending'
    MongoDB-->>-RoomService: Room { wardenId, approvalStatus='pending' }
    RoomService->>+NotificationService: Notify admins of new submission
    NotificationService-->>-RoomService: Done
    RoomService-->>-Backend: { roomId, status='pending' }
    Backend-->>-Frontend: 200 OK
    Warden->>Frontend: "Room submitted for approval"

    note over Admin: Admin reviews pending rooms
    Admin->>Frontend: Access Admin Panel
    Admin->>+Backend: GET /api/rooms?status=pending
    Backend->>+RoomService: getRoomsByStatus('pending')
    RoomService->>+MongoDB: Find rooms with approvalStatus='pending'
    MongoDB-->>-RoomService: [Room, Room, ...]
    RoomService-->>-Backend: Pending rooms array
    Backend-->>-Frontend: 200 OK [rooms]
    Admin->>Frontend: Review room details, photos, pricing
    Admin->>Frontend: Click "Approve"
    Admin->>+Backend: POST /api/rooms/:id/approve
    Backend->>+RoomService: approveRoom(roomId)
    RoomService->>+MongoDB: Update approvalStatus='approved'
    MongoDB-->>-RoomService: Updated room
    RoomService->>+NotificationService: Notify warden of approval
    NotificationService-->>-RoomService: Done
    RoomService-->>-Backend: Approved room
    Backend-->>-Frontend: 200 OK
    Admin->>Frontend: Status updated

    note over Warden: Warden receives approval notification
```

## 7. Check-In/Check-Out Process

```mermaid
sequenceDiagram
    participant Guest
    participant Warden
    participant Frontend
    participant Backend

    note over Guest,Warden: Check-In Day Arrives
    Guest->>Frontend: Access "My Bookings"
    Frontend->>+Backend: GET /api/bookings/mine
    Backend->>+BookingService: getUserBookings(userId)
    BookingService->>+MongoDB: Query user bookings with today's checkIn
    MongoDB-->>-BookingService: [Booking]
    BookingService-->>-Backend: Bookings
    Backend-->>-Frontend: [ { checkInDate: today } ]
    Frontend->>Frontend: Show "Check In" button
    Guest->>Frontend: Click "Check In"
    Frontend->>+Backend: POST /api/bookings/:id/check-in
    Backend->>+BookingService: checkIn(bookingId)
    BookingService->>+MongoDB: Update checkInCompleted=true, checkInTime=now()
    MongoDB-->>-BookingService: Updated
    BookingService-->>-Backend: Booking
    Backend-->>-Frontend: 200 OK
    Frontend->>Frontend: Confirmation message

    note over Guest,Warden: Days of stay...

    note over Guest,Warden: Check-Out Day Arrives
    Guest->>Frontend: Access "My Bookings"
    Frontend->>Frontend: Show "Check Out" button for due bookings
    Guest->>Frontend: Click "Check Out"
    Frontend->>+Backend: POST /api/bookings/:id/check-out
    Backend->>+BookingService: checkOut(bookingId)
    BookingService->>+MongoDB: Update checkOutCompleted=true, status='Completed'
    MongoDB-->>-BookingService: Updated
    BookingService->>+NotificationService: Request review notification
    NotificationService-->>-BookingService: Done
    BookingService-->>-Backend: Booking
    Backend-->>-Frontend: 200 OK { booking }
    Frontend->>Frontend: Show "Leave a Review" prompt
    Guest->>Frontend: Rate room and add comment
    Frontend->>+Backend: POST /api/reviews (bookingId, rating, comment)
    Backend->>+ReviewService: createReview(bookingId, data)
    ReviewService->>+MongoDB: Create review, calc room avg rating
    MongoDB-->>-ReviewService: Review created, room rating updated
    ReviewService-->>-Backend: Review
    Backend-->>-Frontend: 200 OK
    Frontend->>Frontend: "Thanks for the review!"
```

## Error Handling Flows

```mermaid
sequenceDiagram
    Frontend->>+Backend: API request
    alt Validation Error
        Backend->>Backend: Validate input schema
        Backend-->>Frontend: 400 Bad Request { error: "Invalid email format" }
        Frontend->>Frontend: Show validation error to user
    else Authentication Error
        Backend->>Backend: Verify JWT token
        Backend-->>Frontend: 401 Unauthorized
        Frontend->>Frontend: Redirect to login
    else Authorization Error
        Backend->>Backend: Check user role
        Backend-->>Frontend: 403 Forbidden
        Frontend->>Frontend: Show "Access denied" message
    else Server Error
        Backend->>MongoDB: Database operation fails
        MongoDB-->>Backend: Connection error
        Backend-->>Frontend: 500 Internal Server Error { error: "Database unavailable" }
        Frontend->>Frontend: Show error toast
    else Resource Not Found
        Backend->>MongoDB: Search for resource
        MongoDB-->>Backend: No results
        Backend-->>Frontend: 404 Not Found
        Frontend->>Frontend: Show "Not found" message
    end
```
