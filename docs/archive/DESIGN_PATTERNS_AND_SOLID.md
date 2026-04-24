# Design Patterns & SOLID Principles Implementation Guide

**Date**: April 13, 2026  
**Scope**: Complete architectural refactor with Design Patterns and SOLID compliance

---

## Table of Contents

1. [SOLID Principles Overview](#solid-principles-overview)
2. [Design Patterns Guide](#design-patterns-guide)
3. [New Folder Structure](#new-folder-structure)
4. [Implementation Examples](#implementation-examples)
5. [Complete Refactoring Plan](#complete-refactoring-plan)

---

## Part 1: SOLID Principles Overview

### What is SOLID?

SOLID is an acronym for 5 object-oriented design principles that make code **more scalable, flexible, and testable**.

---

### **S - Single Responsibility Principle (SRP)**

**Definition**: A class should have only **one reason to change**  
**Problem**: Classes doing too many things are hard to test and change

#### ❌ VIOLATION (Multiple Responsibilities)

```typescript
// apps/backend/src/controllers/bookingController.ts
export class BookingController {
  // 1. HTTP handling
  async createBooking(req, res) { ... }

  // 2. Validation logic
  validate(data) { ... }

  // 3. Business logic
  calculatePrice(room, dates) { ... }

  // 4. Database operations
  saveBooking(data) { ... }

  // 5. Notifications
  notifyWarden(booking) { ... }
}
```

**Problems**:

- 5 reasons to change this class
- Hard to test each responsibility in isolation
- Business logic trapped in HTTP layer

#### ✅ SOLUTION (Single Responsibility)

```typescript
// 1. Controller - Only HTTP handling
export class BookingController {
  constructor(private bookingService: BookingService) {}
  async createBooking(req: AuthRequest, res: Response) {
    const booking = await this.bookingService.createBooking(...);
    res.status(201).json(booking);
  }
}

// 2. Service - Only business logic
export class BookingService {
  constructor(
    private bookingRepository: BookingRepository,
    private roomRepository: RoomRepository,
    private notificationService: NotificationService
  ) {}

  async createBooking(userId, roomId, dates): Promise<Booking> {
    // Only orchestrate business logic
  }
}

// 3. Repository - Only database operations
export class BookingRepository {
  async create(data): Promise<Booking> { ... }
  async findOverlapping(roomId, dates): Promise<Booking[]> { ... }
}

// 4. Validation - Only validation logic
export class BookingValidator {
  validateBookingDates(checkIn, checkOut): void { ... }
}

// 5. Notification Service - Only notifications
export class NotificationService {
  async notifyWarden(wardenId, booking): Promise<void> { ... }
}
```

**Benefits**:

- Each class has **one reason to change**
- Easy to test in isolation
- Easy to reuse components
- Clear responsibility boundaries

---

### **O - Open/Closed Principle (OCP)**

**Definition**: Classes should be **open for extension, closed for modification**  
**Problem**: Adding new features requires changing existing code

#### ❌ VIOLATION (Must Modify Existing Code)

```typescript
export class NotificationService {
  async notify(userId: string, type: "email" | "sms" | "push") {
    if (type === "email") {
      // Email logic
      await this.sendEmail(userId);
    } else if (type === "sms") {
      // SMS logic - MUST MODIFY CLASS TO ADD
      await this.sendSMS(userId);
    } else if (type === "push") {
      // Push logic - MUST MODIFY CLASS TO ADD
      await this.sendPush(userId);
    }
    // Adding new notification type requires modifying this class
  }
}
```

**Problem**: Adding a new notification type (Slack, Teams, Discord) requires modifying existing code, risking bugs.

#### ✅ SOLUTION (Strategy Pattern)

```typescript
// Define interface for extension points
export interface NotificationStrategy {
  send(userId: string, message: string): Promise<void>;
}

// Implement concrete strategies (Easy to add new ones!)
export class EmailNotificationStrategy implements NotificationStrategy {
  async send(userId: string, message: string): Promise<void> {
    // Email implementation
  }
}

export class SMSNotificationStrategy implements NotificationStrategy {
  async send(userId: string, message: string): Promise<void> {
    // SMS implementation
  }
}

export class SlackNotificationStrategy implements NotificationStrategy {
  async send(userId: string, message: string): Promise<void> {
    // NEW: No need to modify existing NotificationService!
  }
}

// Service uses strategies (CLOSED FOR MODIFICATION)
export class NotificationService {
  private strategies: Map<string, NotificationStrategy> = new Map();

  registerStrategy(type: string, strategy: NotificationStrategy) {
    this.strategies.set(type, strategy);
  }

  async notify(userId: string, type: string, message: string): Promise<void> {
    const strategy = this.strategies.get(type);
    if (!strategy) throw new Error(`Unknown notification type: ${type}`);
    await strategy.send(userId, message);
  }
}

// Usage: Register new strategies without modifying service
const notificationService = new NotificationService();
notificationService.registerStrategy("email", new EmailNotificationStrategy());
notificationService.registerStrategy("sms", new SMSNotificationStrategy());
notificationService.registerStrategy("slack", new SlackNotificationStrategy()); // NEW!
```

**Benefits**:

- Add new notification types without modifying existing code
- New strategies can be added in plugins or separate modules
- Reduces risk of breaking existing functionality

---

### **L - Liskov Substitution Principle (LSP)**

**Definition**: Subtypes must be **substitutable for their base types**  
**Problem**: Subclasses that break the contract of their parent

#### ❌ VIOLATION (Violates Contract)

```typescript
abstract class Room {
  abstract calculateNightlyPrice(numNights: number): number;
}

class RegularRoom extends Room {
  calculateNightlyPrice(numNights: number): number {
    return this.pricePerNight * numNights;
  }
}

class PenthouseRoom extends Room {
  calculateNightlyPrice(numNights: number): number {
    // ❌ VIOLATION: Breaks contract by ignoring parameter
    return this.basePricePerNight * numNights + 500; // Minimum charge
  }
}

// Caller expects to use any Room, but gets inconsistent results
function getCost(room: Room, nights: number): number {
  return room.calculateNightlyPrice(nights);
}
```

**Problem**: Penthouse violates the contract - has unexpected minimum charge

#### ✅ SOLUTION (Honor the Contract)

```typescript
abstract class Room {
  abstract calculateNightlyPrice(numNights: number): number;
}

class RegularRoom extends Room {
  calculateNightlyPrice(numNights: number): number {
    return this.pricePerNight * numNights;
  }
}

class PenthouseRoom extends Room {
  calculateNightlyPrice(numNights: number): number {
    // Honor contract: Price based ONLY on nights, no surprises
    const minimumNights = Math.max(numNights, 3); // Internal logic
    return this.pricePerNight * minimumNights;
  }
}

// All rooms can be substituted safely
function getCost(room: Room, nights: number): number {
  return room.calculateNightlyPrice(nights); // Always predictable
}
```

**Benefits**:

- Subclasses can be safely swapped
- Caller doesn't need to know concrete class
- Polymorphism works correctly

---

### **I - Interface Segregation Principle (ISP)**

**Definition**: Clients should depend on **small, specific interfaces** instead of large general ones  
**Problem**: Classes forced to implement methods they don't need

#### ❌ VIOLATION (Fat Interface)

```typescript
// Room must implement everything, even if it doesn't need all methods
interface AllServices {
  getRoom(): Room;
  createBooking(): Booking;
  sendNotification(): void;
  processPayment(): void;
  generateAnalytics(): void;
}

class BasicRepository implements AllServices {
  getRoom() {
    /* ... */
  }
  createBooking() {
    /* ... */
  }
  sendNotification() {
    /* ... */
  } // ❌ Room doesn't send notifications!
  processPayment() {
    /* ... */
  } // ❌ Room doesn't process payments!
  generateAnalytics() {
    /* ... */
  } // ❌ Room doesn't generate analytics!
}
```

**Problem**: BasicRepository forced to implement 5 methods, but only needs 2

#### ✅ SOLUTION (Segregated Interfaces)

```typescript
// Small, specific interfaces
interface RoomRepository {
  getRoom(id: string): Promise<Room>;
  createRoom(data: CreateRoomInput): Promise<Room>;
  updateRoom(id: string, data: UpdateRoomInput): Promise<Room>;
}

interface BookingRepository {
  createBooking(data: CreateBookingInput): Promise<Booking>;
  findOverlapping(roomId: string, dates: DateRange): Promise<Booking[]>;
}

interface NotificationService {
  sendNotification(userId: string, message: string): Promise<void>;
}

interface PaymentService {
  processPayment(bookingId: string, amount: number): Promise<Receipt>;
}

interface AnalyticsService {
  generateReport(period: DateRange): Promise<Report>;
}

// Classes only implement what they need
class PostgresRoomRepository implements RoomRepository {
  getRoom() {
    /* ... */
  }
  createRoom() {
    /* ... */
  }
  updateRoom() {
    /* ... */
  }
}

class MongoBookingRepository implements BookingRepository {
  createBooking() {
    /* ... */
  }
  findOverlapping() {
    /* ... */
  }
}
```

**Benefits**:

- Classes only implement what they need
- Easier to mock for testing
- Clearer contract

---

### **D - Dependency Inversion Principle (DIP)**

**Definition**: Depend on **abstractions** (interfaces), not **concrete implementations**  
**Problem**: Hard dependencies make code rigid and hard to test

#### ❌ VIOLATION (Concrete Dependencies)

```typescript
// ❌ Depends on concrete classes
import PostgresUserRepository from "./repositories/postgres/user";
import EmailNotificationService from "./services/email";
import StripePaymentService from "./services/stripe";

export class BookingService {
  private userRepository = new PostgresUserRepository(); // Hard boundary
  private notificationService = new EmailNotificationService(); // Hard boundary
  private paymentService = new StripePaymentService(); // Hard boundary

  async createBooking(userId, roomId, dates) {
    // Can't swap implementations
    // Can't test without real PostgreSQL, Email, Stripe
  }
}
```

**Problems**:

- Can't test without real database
- Can't use MongoDB instead of PostgreSQL
- Can't use SMS instead of Email

#### ✅ SOLUTION (Abstract Dependencies)

```typescript
// Depend on interfaces (abstractions)
export interface IUserRepository {
  findById(id: string): Promise<User>;
  save(user: User): Promise<void>;
}

export interface INotificationService {
  send(userId: string, message: string): Promise<void>;
}

export interface IPaymentService {
  process(amount: number, paymentMethod: string): Promise<Receipt>;
}

// Inject dependencies (constructor injection)
export class BookingService {
  constructor(
    private userRepository: IUserRepository, // Abstraction
    private notificationService: INotificationService, // Abstraction
    private paymentService: IPaymentService, // Abstraction
  ) {}

  async createBooking(userId: string, roomId: string, dates: DateRange) {
    // Can use any implementation
  }
}

// Now we can swap implementations easily
const bookingService = new BookingService(
  new PostgresUserRepository(), // Production
  new EmailNotificationService(),
  new StripePaymentService(),
);

// For testing
const bookingServiceTest = new BookingService(
  new MockUserRepository(), // Testing
  new MockNotificationService(),
  new MockPaymentService(),
);

// For alternative implementation
const bookingServiceAlternative = new BookingService(
  new MongoUserRepository(), // Alt database
  new SMSNotificationService(), // Alt notification
  new PayPalPaymentService(), // Alt payment
);
```

**Benefits**:

- Easy to test with mocks
- Easy to swap implementations
- Decoupled from concrete classes
- More flexible and maintainable

---

## Part 2: Design Patterns Guide

### What are Design Patterns?

Reusable solutions to common programming problems. **23 Gang of Four (GoF) patterns** organized into 3 categories:

---

### **Creational Patterns** (Object Creation)

#### **1. Factory Pattern**

**Purpose**: Create objects without specifying exact classes  
**Use Case**: Create different repository implementations based on configuration

```typescript
// Interface for all repositories
export interface RoomRepository {
  getRoom(id: string): Promise<Room>;
  save(room: Room): Promise<void>;
}

// Concrete implementations
export class PostgresRoomRepository implements RoomRepository {
  async getRoom(id: string): Promise<Room> {
    // PostgreSQL logic
  }
  async save(room: Room): Promise<void> {
    // PostgreSQL logic
  }
}

export class MongoRoomRepository implements RoomRepository {
  async getRoom(id: string): Promise<Room> {
    // MongoDB logic
  }
  async save(room: Room): Promise<void> {
    // MongoDB logic
  }
}

// Factory
export class RepositoryFactory {
  static createRoomRepository(type: "postgres" | "mongo"): RoomRepository {
    switch (type) {
      case "postgres":
        return new PostgresRoomRepository();
      case "mongo":
        return new MongoRoomRepository();
      default:
        throw new Error(`Unknown repository type: ${type}`);
    }
  }
}

// Usage - Create without knowing concrete class
const roomRepo = RepositoryFactory.createRoomRepository(
  process.env.DB_TYPE as "postgres" | "mongo",
);

// Client doesn't care which implementation
const room = await roomRepo.getRoom("123");
```

**Benefits**:

- Encapsulates object creation
- Easy to swap implementations
- Configuration-driven object creation

---

#### **2. Singleton Pattern**

**Purpose**: Ensure only **one instance** of a class exists  
**Use Case**: Database connection, configuration manager, logger

```typescript
// ❌ ANTI-PATTERN: Multiple instances
class Database {
  private connection: any;

  constructor() {
    this.connection = connect(); // Creates new connection every time!
  }

  getConnection() {
    return this.connection;
  }
}

// Problem: Each instantiation creates new connection
const db1 = new Database();
const db2 = new Database(); // Another connection to same DB!
```

```typescript
// ✅ SINGLETON: Only one instance
export class Database {
  private static instance: Database;
  private connection: any;

  private constructor() {
    // Private constructor prevents new Database()
    this.connection = this.connect();
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private connect() {
    // Connection logic
    console.log("🔌 Database connected");
    return {
      /* connection object */
    };
  }

  getConnection() {
    return this.connection;
  }
}

// Usage: Always same instance
const db1 = Database.getInstance();
const db2 = Database.getInstance();
console.log(db1 === db2); // true - Same instance!
```

**Benefits**:

- Only one database connection
- Shared state across application
- Reduced memory usage

**Other good Singletons**:

- Logger service
- Configuration manager
- Cache service
- Event bus

---

#### **3. Builder Pattern**

**Purpose**: Create complex objects step by step  
**Use Case**: Complex booking or room creation with many options

```typescript
// ❌ HARD TO USE: Many constructor parameters
const booking = new Booking(
  userId,
  roomId,
  checkInDate,
  checkOutDate,
  totalPrice,
  paymentMethod,
  specialRequests,
  guestCount,
  cancellationPolicy,
  insuranceIncluded,
  markupPercentage,
  // ... 20 more parameters!
);
```

```typescript
// ✅ BUILDER PATTERN: Clear, flexible
export class BookingBuilder {
  private userId!: string;
  private roomId!: string;
  private checkInDate!: Date;
  private checkOutDate!: Date;
  private totalPrice!: number;
  private paymentMethod: string = "credit_card";
  private specialRequests: string = "";
  private guestCount: number = 1;
  private cancellationPolicy: string = "strict";
  private insuranceIncluded: boolean = false;

  withUserId(userId: string): BookingBuilder {
    this.userId = userId;
    return this;
  }

  withRoomId(roomId: string): BookingBuilder {
    this.roomId = roomId;
    return this;
  }

  withDates(checkIn: Date, checkOut: Date): BookingBuilder {
    this.checkInDate = checkIn;
    this.checkOutDate = checkOut;
    return this;
  }

  withPaymentMethod(method: string): BookingBuilder {
    this.paymentMethod = method;
    return this;
  }

  withSpecialRequests(requests: string): BookingBuilder {
    this.specialRequests = requests;
    return this;
  }

  withInsurance(included: boolean): BookingBuilder {
    this.insuranceIncluded = included;
    return this;
  }

  build(): Booking {
    // Validate all required fields are set
    if (!this.userId) throw new Error("userId is required");
    if (!this.roomId) throw new Error("roomId is required");

    return new Booking(
      this.userId,
      this.roomId,
      this.checkInDate,
      this.checkOutDate,
      this.totalPrice,
      this.paymentMethod,
      this.specialRequests,
      this.guestCount,
      this.cancellationPolicy,
      this.insuranceIncluded,
    );
  }
}

// Usage: Clear, flexible, readable
const booking = new BookingBuilder()
  .withUserId("user123")
  .withRoomId("room456")
  .withDates(new Date("2024-05-01"), new Date("2024-05-10"))
  .withPaymentMethod("paypal")
  .withSpecialRequests("High floor preferred")
  .withInsurance(true)
  .build();
```

**Benefits**:

- Clear, readable object creation
- Optional parameters
- Validation during build
- Fluent interface

---

### **Structural Patterns** (Object Composition)

#### **4. Adapter Pattern**

**Purpose**: Make incompatible interfaces work together  
**Use Case**: Integrate different payment providers with different APIs

```typescript
// Existing Stripe API (Can't change)
class StripePaymentProvider {
  chargeCard(cardToken: string, amountInCents: number): Promise<string> {
    // Stripe implementation
    return Promise.resolve("stripe_charge_id");
  }
}

// Existing PayPal API (Can't change)
class PayPalPaymentProvider {
  authorizePayment(
    paypalToken: string,
    amountInDollars: number,
  ): Promise<string> {
    // PayPal implementation
    return Promise.resolve("paypal_auth_id");
  }
}

// Our application expects this interface
export interface PaymentGateway {
  processPayment(amount: number, token: string): Promise<PaymentResult>;
}

// ✅ ADAPTER: Make Stripe compatible
export class StripeAdapter implements PaymentGateway {
  constructor(private stripe: StripePaymentProvider) {}

  async processPayment(amount: number, token: string): Promise<PaymentResult> {
    const chargeId = await this.stripe.chargeCard(token, amount * 100); // Convert to cents
    return {
      success: true,
      transactionId: chargeId,
      provider: "stripe",
    };
  }
}

// ✅ ADAPTER: Make PayPal compatible
export class PayPalAdapter implements PaymentGateway {
  constructor(private paypal: PayPalPaymentProvider) {}

  async processPayment(amount: number, token: string): Promise<PaymentResult> {
    const authId = await this.paypal.authorizePayment(token, amount); // Already in dollars
    return {
      success: true,
      transactionId: authId,
      provider: "paypal",
    };
  }
}

// Usage: Our code doesn't know about Stripe/PayPal differences
class BookingService {
  constructor(private paymentGateway: PaymentGateway) {}

  async completeBooking(
    bookingId: string,
    amount: number,
    token: string,
  ): Promise<void> {
    // Works with any payment provider
    const result = await this.paymentGateway.processPayment(amount, token);
    // ...
  }
}

// Can use either
const bookingService1 = new BookingService(
  new StripeAdapter(new StripePaymentProvider()),
);
const bookingService2 = new BookingService(
  new PayPalAdapter(new PayPalPaymentProvider()),
);
```

**Benefits**:

- Integrate third-party APIs
- Hide external complexity
- Your code uses consistent interface

---

#### **5. Decorator Pattern**

**Purpose**: Add behavior to objects dynamically  
**Use Case**: Add features to notification service (retry logic, logging, encryption)

```typescript
// Base notification service
export interface NotificationService {
  send(userId: string, message: string): Promise<void>;
}

export class EmailNotificationService implements NotificationService {
  async send(userId: string, message: string): Promise<void> {
    console.log(`📧 Sending email to ${userId}: ${message}`);
    // Send email
  }
}

// ✅ DECORATOR: Add retry logic
export class RetryDecorator implements NotificationService {
  constructor(
    private notificationService: NotificationService,
    private maxRetries: number = 3,
  ) {}

  async send(userId: string, message: string): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.notificationService.send(userId, message);
        console.log(`✅ Success on attempt ${attempt}`);
        return;
      } catch (error) {
        lastError = error as Error;
        console.log(`❌ Attempt ${attempt} failed. Retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw new Error(
      `Failed after ${this.maxRetries} attempts: ${lastError?.message}`,
    );
  }
}

// ✅ DECORATOR: Add logging
export class LoggingDecorator implements NotificationService {
  constructor(
    private notificationService: NotificationService,
    private logger: Logger,
  ) {}

  async send(userId: string, message: string): Promise<void> {
    this.logger.info(`Sending notification to ${userId}`);
    const startTime = Date.now();

    try {
      await this.notificationService.send(userId, message);
      const duration = Date.now() - startTime;
      this.logger.info(`Notification sent in ${duration}ms`);
    } catch (error) {
      this.logger.error(`Notification failed: ${error}`);
      throw error;
    }
  }
}

// Usage: Stack decorators
let emailService: NotificationService = new EmailNotificationService();
emailService = new LoggingDecorator(emailService, logger); // Add logging
emailService = new RetryDecorator(emailService, 3); // Add retry

// Now sending includes both logging AND retry
await emailService.send("user123", "Your booking confirmed!");
```

**Benefits**:

- Add behavior without modifying original
- Combine features (logging + retry + encryption)
- Single Responsibility (each decorator has one job)

---

### **Behavioral Patterns** (Interactions)

#### **6. Observer Pattern**

**Purpose**: Notify multiple objects when state changes  
**Use Case**: When booking is confirmed, notify user, warden, analytics, payment

```typescript
// Observer interface
export interface BookingObserver {
  onBookingConfirmed(booking: Booking): Promise<void>;
}

// Concrete observers
export class UserNotificationObserver implements BookingObserver {
  async onBookingConfirmed(booking: Booking): Promise<void> {
    console.log(`📧 Notifying user ${booking.userId} of confirmation`);
  }
}

export class WardenNotificationObserver implements BookingObserver {
  async onBookingConfirmed(booking: Booking): Promise<void> {
    console.log(`📧 Notifying warden of new booking`);
  }
}

export class AnalyticsObserver implements BookingObserver {
  async onBookingConfirmed(booking: Booking): Promise<void> {
    console.log(`📊 Recording booking in analytics`);
  }
}

// Subject (Observable)
export class BookingEventEmitter {
  private observers: BookingObserver[] = [];

  subscribe(observer: BookingObserver) {
    this.observers.push(observer);
  }

  unsubscribe(observer: BookingObserver) {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  async emitBookingConfirmed(booking: Booking) {
    // Notify all observers
    await Promise.all(
      this.observers.map((observer) => observer.onBookingConfirmed(booking)),
    );
  }
}

// Usage
const bookingEvents = new BookingEventEmitter();
bookingEvents.subscribe(new UserNotificationObserver());
bookingEvents.subscribe(new WardenNotificationObserver());
bookingEvents.subscribe(new AnalyticsObserver());

const booking = await bookingService.confirmBooking(bookingId);
await bookingEvents.emitBookingConfirmed(booking); // Notifies all 3 observers
```

**Benefits**:

- Loose coupling between components
- New observers can be added without changing existing code
- Event-driven architecture

---

#### **7. Strategy Pattern**

**Purpose**: Choose algorithm at runtime  
**Use Case**: Different pricing strategies (seasonal, loyalty, early-bird)

```typescript
// Strategy interface
export interface PricingStrategy {
  calculatePrice(room: Room, nights: number, guest: User): number;
}

// Concrete strategies
export class StandardPricingStrategy implements PricingStrategy {
  calculatePrice(room: Room, nights: number, guest: User): number {
    return room.pricePerNight * nights;
  }
}

export class SeasonalPricingStrategy implements PricingStrategy {
  calculatePrice(room: Room, nights: number, guest: User): number {
    const isSeason = this.isHighSeason();
    const multiplier = isSeason ? 1.5 : 0.8;
    return room.pricePerNight * nights * multiplier;
  }

  private isHighSeason(): boolean {
    const month = new Date().getMonth();
    return month >= 5 && month <= 8; // June to September
  }
}

export class LoyaltyPricingStrategy implements PricingStrategy {
  calculatePrice(room: Room, nights: number, guest: User): number {
    const basePrice = room.pricePerNight * nights;
    const discount = guest.bookingCount > 10 ? 0.2 : 0; // 20% if 10+ bookings
    return basePrice * (1 - discount);
  }
}

// Context
export class PricingService {
  private strategy: PricingStrategy;

  constructor(strategy: PricingStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: PricingStrategy) {
    this.strategy = strategy;
  }

  calculatePrice(room: Room, nights: number, guest: User): number {
    return this.strategy.calculatePrice(room, nights, guest);
  }
}

// Usage: Switch strategy at runtime
const pricingService = new PricingService(new StandardPricingStrategy());

// Black Friday - Switch to seasonal strategy
pricingService.setStrategy(new SeasonalPricingStrategy());

// Loyalty member - Switch to loyalty strategy
if (guest.isLoyaltyMember) {
  pricingService.setStrategy(new LoyaltyPricingStrategy());
}

const price = pricingService.calculatePrice(room, 5, guest);
```

**Benefits**:

- Encapsulate algorithms
- Switch at runtime
- New strategies don't require code changes
- Tests each strategy in isolation

---

#### **8. Repository Pattern**

**Purpose**: Abstract data access logic  
**Use Case**: Swap PostgreSQL for MongoDB without changing business logic

```typescript
// Interface (Abstraction)
export interface IBookingRepository {
  findById(id: string): Promise<Booking | null>;
  save(booking: Booking): Promise<void>;
  findByUserId(userId: string): Promise<Booking[]>;
}

// PostgreSQL Implementation
export class PostgresBookingRepository implements IBookingRepository {
  constructor(private pool: Pool) {}

  async findById(id: string): Promise<Booking | null> {
    const result = await this.pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async save(booking: Booking): Promise<void> {
    await this.pool.query(
      'INSERT INTO bookings (id, user_id, room_id, ...) VALUES ($1, $2, $3, ...)',
      [booking.id, booking.userId, booking.roomId, ...]
    );
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    const result = await this.pool.query(
      'SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }
}

// MongoDB Implementation (Same interface, different implementation)
export class MongoBookingRepository implements IBookingRepository {
  constructor(private collection: Collection) {}

  async findById(id: string): Promise<Booking | null> {
    return this.collection.findOne({ _id: new ObjectId(id) });
  }

  async save(booking: Booking): Promise<void> {
    await this.collection.insertOne(booking);
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    return this.collection.find({ userId }).sort({ createdAt: -1 }).toArray();
  }
}

// Service doesn't care which implementation
export class BookingService {
  constructor(private repository: IBookingRepository) {}

  async getBooking(id: string): Promise<Booking> {
    const booking = await this.repository.findById(id);
    if (!booking) throw new BookingNotFoundError(id);
    return booking;
  }

  async saveBooking(booking: Booking): Promise<void> {
    await this.repository.save(booking);
  }
}

// Can swap easily
const postgresRepo = new PostgresBookingRepository(pool);
const mongoRepo = new MongoBookingRepository(collection);

const service1 = new BookingService(postgresRepo);  // Uses PostgreSQL
const service2 = new BookingService(mongoRepo);      // Uses MongoDB
```

**Benefits**:

- Swap database without changing business logic
- Test with in-memory repository
- Clear separation of concerns

---

## Part 3: New Folder Structure

### Current Structure (Problematic)

```
apps/backend/src/
├── controllers/       # Fat controllers (all logic here)
├── models/           # Just schemas
├── routes/           # Route definitions
├── middleware/       # Auth & CORS
├── config/           # Database connection
├── scripts/          # One-off scripts
└── types/            # Type definitions
```

### ✅ Improved Structure (SOLID + Design Patterns)

```
apps/backend/
├── src/
│   ├── application/              # 🆕 Use cases/workflows
│   │   ├── booking/
│   │   │   ├── create-booking.usecase.ts
│   │   │   ├── confirm-booking.usecase.ts
│   │   │   └── cancel-booking.usecase.ts
│   │   ├── room/
│   │   ├── notification/
│   │   └── dto/                  # Data Transfer Objects
│   │
│   ├── domain/                   # 🆕 Business logic & rules
│   │   ├── entities/             # Core business objects
│   │   │   ├── Booking.ts
│   │   │   ├── Room.ts
│   │   │   └── User.ts
│   │   ├── value-objects/        # Immutable objects
│   │   │   ├── DateRange.ts
│   │   │   ├── Price.ts
│   │   │   └── Address.ts
│   │   ├── repositories/         # Repository interfaces (Abstraction)
│   │   │   ├── IBookingRepository.ts
│   │   │   ├── IRoomRepository.ts
│   │   │   └── IUserRepository.ts
│   │   ├── services/             # Domain services
│   │   │   ├── PricingService.ts
│   │   │   └── AvailabilityService.ts
│   │   └── events/               # Domain events
│   │       ├── BookingConfirmedEvent.ts
│   │       └── RoomApprovedEvent.ts
│   │
│   ├── infrastructure/           # 🆕 Implementation details
│   │   ├── persistence/          # Repository implementations
│   │   │   ├── mongoose/
│   │   │   │   ├── MongoBookingRepository.ts
│   │   │   │   ├── MongoRoomRepository.ts
│   │   │   │   └── MongoUserRepository.ts
│   │   │   └── postgres/         # Alternative implementations
│   │   │       ├── PostgresBookingRepository.ts
│   │   │       └── ...
│   │   │
│   │   ├── external-services/    # External APIs
│   │   │   ├── payment/
│   │   │   │   ├── IPaymentProvider.ts
│   │   │   │   ├── StripeAdapter.ts
│   │   │   │   └── PayPalAdapter.ts
│   │   │   ├── notification/
│   │   │   │   ├── INotificationService.ts
│   │   │   │   ├── EmailNotificationService.ts
│   │   │   │   └── SMSNotificationService.ts
│   │   │   └── storage/
│   │   │       ├── IS3Service.ts
│   │   │       └── S3Service.ts
│   │   │
│   │   ├── http/                 # HTTP layer
│   │   │   ├── controllers/      # Thin controllers
│   │   │   │   ├── BookingController.ts
│   │   │   │   ├── RoomController.ts
│   │   │   │   └── AdminController.ts
│   │   │   ├── middleware/
│   │   │   │   ├── AuthMiddleware.ts
│   │   │   │   ├── ValidationMiddleware.ts
│   │   │   │   └── ErrorHandlerMiddleware.ts
│   │   │   ├── routes/
│   │   │   │   ├── booking.routes.ts
│   │   │   │   └── room.routes.ts
│   │   │   └── requests/         # Request DTO validation
│   │   │       └── BookingRequest.ts
│   │   │
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── environment.ts
│   │   │   └── factories.ts      # 🆕 Creational patterns
│   │   │
│   │   └── logging/
│   │       ├── Logger.ts         # Singleton
│   │       └── LogLevel.ts
│   │
│   ├── shared/                   # 🆕 Shared utilities
│   │   ├── errors/               # Custom error types
│   │   │   ├── AppError.ts
│   │   │   ├── ValidationError.ts
│   │   │   └── NotFoundError.ts
│   │   ├── validators/
│   │   └── utils/
│   │
│   ├── container.ts              # 🆕 IoC Container (Dependency Injection)
│   └── server.ts                 # Express app
│
├── __tests__/
│   ├── unit/
│   │   ├── domain/              # Test domain logic
│   │   └── application/         # Test use cases
│   ├── integration/
│   ├── e2e/
│   └── mocks/                   # 🆕 Mock implementations
│       ├── MockBookingRepository.ts
│       └── MockNotificationService.ts
│
└── package.json
```

---

## Part 4: Implementation Examples

### Example 1: Booking Module with All Patterns

#### Step 1: Domain Layer (Business Rules)

```typescript
// src/domain/entities/Booking.ts
export interface IBooking {
  id: string;
  userId: string;
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date;
}

// 🆕 Entity class (encapsulates logic)
export class Booking implements IBooking {
  id!: string;
  userId!: string;
  roomId!: string;
  checkInDate!: Date;
  checkOutDate!: Date;
  totalPrice!: number;
  status!: BookingStatus;
  createdAt!: Date;

  // Business rule: Can only cancel pending bookings
  canCancel(): boolean {
    return this.status === "Pending";
  }

  // Business rule: Calculate refund based on cancellation timing
  calculateRefund(refundPolicy: RefundPolicy): number {
    const daysBefore = this.calculateDaysBefore();

    if (daysBefore >= 14) return this.totalPrice; // Full refund
    if (daysBefore >= 7) return this.totalPrice * 0.5; // 50% refund
    return 0; // No refund
  }

  private calculateDaysBefore(): number {
    const now = new Date();
    const days = Math.ceil(
      (this.checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return days;
  }

  // Business rule: Mark as confirmed
  confirm(): void {
    if (this.status !== "Pending") {
      throw new InvalidStateError("Can only confirm pending bookings");
    }
    this.status = "Confirmed";
  }
}

// src/domain/value-objects/DateRange.ts
export class DateRange {
  constructor(
    readonly checkInDate: Date,
    readonly checkOutDate: Date,
  ) {
    if (checkOutDate <= checkInDate) {
      throw new InvalidDateRangeError("Check-out must be after check-in");
    }
  }

  get nights(): number {
    return Math.ceil(
      (this.checkOutDate.getTime() - this.checkInDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );
  }

  overlaps(other: DateRange): boolean {
    return (
      this.checkInDate < other.checkOutDate &&
      this.checkOutDate > other.checkInDate
    );
  }
}
```

#### Step 2: Repository Interfaces (Abstraction)

```typescript
// src/domain/repositories/IBookingRepository.ts
export interface IBookingRepository {
  findById(id: string): Promise<Booking | null>;
  findByUserId(userId: string): Promise<Booking[]>;
  findOverlapping(roomId: string, dates: DateRange): Promise<Booking[]>;
  save(booking: Booking): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IRoomRepository {
  findById(id: string): Promise<Room | null>;
  findByUserId(userId: string): Promise<Room[]>;
  save(room: Room): Promise<void>;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
```

#### Step 3: Domain Services (Business Logic)

```typescript
// src/domain/services/PricingService.ts
export interface IPricingStrategy {
  calculatePrice(room: Room, dates: DateRange, guest: User): number;
}

export class PricingService {
  constructor(private strategy: IPricingStrategy) {}

  setStrategy(strategy: IPricingStrategy): void {
    this.strategy = strategy;
  }

  calculate(room: Room, dates: DateRange, guest: User): number {
    return this.strategy.calculatePrice(room, dates, guest);
  }
}

export class StandardPricingStrategy implements IPricingStrategy {
  calculatePrice(room: Room, dates: DateRange, guest: User): number {
    return room.pricePerNight * dates.nights;
  }
}

export class LoyaltyPricingStrategy implements IPricingStrategy {
  calculatePrice(room: Room, dates: DateRange, guest: User): number {
    const basePrice = room.pricePerNight * dates.nights;
    const discount = guest.bookingCount > 10 ? 0.2 : 0;
    return basePrice * (1 - discount);
  }
}

// src/domain/services/AvailabilityService.ts
export class AvailabilityService {
  constructor(private bookingRepository: IBookingRepository) {}

  async isAvailable(roomId: string, dates: DateRange): Promise<boolean> {
    const overlapping = await this.bookingRepository.findOverlapping(
      roomId,
      dates,
    );
    return overlapping.length === 0;
  }
}
```

#### Step 4: Application Services (Use Cases)

```typescript
// src/application/booking/create-booking.usecase.ts
export interface CreateBookingRequest {
  userId: string;
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
}

export interface CreateBookingResponse {
  bookingId: string;
  totalPrice: number;
  status: string;
}

export class CreateBookingUseCase {
  constructor(
    private bookingRepository: IBookingRepository,
    private roomRepository: IRoomRepository,
    private availabilityService: AvailabilityService,
    private pricingService: PricingService,
    private eventBus: IEventBus,
  ) {}

  async execute(request: CreateBookingRequest): Promise<CreateBookingResponse> {
    // 1. Validate input (using value objects)
    const dateRange = new DateRange(
      new Date(request.checkInDate),
      new Date(request.checkOutDate),
    );

    // 2. Check room exists
    const room = await this.roomRepository.findById(request.roomId);
    if (!room) throw new RoomNotFoundError(request.roomId);

    // 3. Check availability
    const isAvailable = await this.availabilityService.isAvailable(
      request.roomId,
      dateRange,
    );
    if (!isAvailable) {
      throw new RoomNotAvailableError(request.roomId);
    }

    // 4. Calculate price using strategy
    const user = await this.userRepository.findById(request.userId);
    const totalPrice = this.pricingService.calculate(room, dateRange, user);

    // 5. Create booking (domain entity)
    const booking = new Booking();
    booking.id = generateId();
    booking.userId = request.userId;
    booking.roomId = request.roomId;
    booking.checkInDate = dateRange.checkInDate;
    booking.checkOutDate = dateRange.checkOutDate;
    booking.totalPrice = totalPrice;
    booking.status = "Pending";
    booking.createdAt = new Date();

    // 6. Save
    await this.bookingRepository.save(booking);

    // 7. Emit event (Observer pattern)
    await this.eventBus.publish(new BookingCreatedEvent(booking));

    return {
      bookingId: booking.id,
      totalPrice: booking.totalPrice,
      status: booking.status,
    };
  }
}
```

#### Step 5: Infrastructure - Repository Implementation

```typescript
// src/infrastructure/persistence/MongoBookingRepository.ts
export class MongoBookingRepository implements IBookingRepository {
  constructor(private collection: Collection<IBooking>) {}

  async findById(id: string): Promise<Booking | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    return doc ? this.toDomain(doc) : null;
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    const docs = await this.collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findOverlapping(roomId: string, dates: DateRange): Promise<Booking[]> {
    const docs = await this.collection
      .find({
        roomId,
        $or: [
          {
            checkInDate: { $lt: dates.checkOutDate },
            checkOutDate: { $gt: dates.checkInDate },
          },
        ],
      })
      .toArray();
    return docs.map((doc) => this.toDomain(doc));
  }

  async save(booking: Booking): Promise<void> {
    const doc = this.toPersistence(booking);
    await this.collection.updateOne(
      { _id: doc._id },
      { $set: doc },
      { upsert: true },
    );
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: new ObjectId(id) });
  }

  private toDomain(doc: IBooking): Booking {
    const booking = new Booking();
    Object.assign(booking, doc);
    return booking;
  }

  private toPersistence(booking: Booking) {
    return {
      _id: new ObjectId(booking.id),
      ...booking,
    };
  }
}
```

#### Step 6: HTTP Layer - Thin Controller

```typescript
// src/infrastructure/http/controllers/BookingController.ts
export class BookingController {
  constructor(
    private createBookingUseCase: CreateBookingUseCase,
    private errorHandler: ErrorHandler,
  ) {}

  async createBooking(req: AuthRequest, res: Response): Promise<void> {
    try {
      // 1. Validate request
      const request = CreateBookingRequest.parse(req.body);

      // 2. Execute use case
      const response = await this.createBookingUseCase.execute({
        userId: req.user!.id,
        ...request,
      });

      // 3. Return response
      res.status(201).json(response);
    } catch (error) {
      this.errorHandler.handle(error, res);
    }
  }
}
```

#### Step 7: Dependency Injection Container

```typescript
// src/container.ts
export class DIContainer {
  private services: Map<string, any> = new Map();

  // Register repositories
  registerBookingRepository(repo: IBookingRepository): this {
    this.services.set("BookingRepository", repo);
    return this;
  }

  registerRoomRepository(repo: IRoomRepository): this {
    this.services.set("RoomRepository", repo);
    return this;
  }

  // Register services
  registerAvailabilityService(service: AvailabilityService): this {
    this.services.set("AvailabilityService", service);
    return this;
  }

  registerPricingService(service: PricingService): this {
    this.services.set("PricingService", service);
    return this;
  }

  // Register use cases
  registerCreateBookingUseCase(useCase: CreateBookingUseCase): this {
    this.services.set("CreateBookingUseCase", useCase);
    return this;
  }

  // Get service (Singleton pattern)
  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) throw new Error(`Service ${name} not registered`);
    return service as T;
  }
}

// Setup in server.ts
export function setupContainer(): DIContainer {
  const container = new DIContainer();

  // 1. Repositories (Concrete implementations)
  const bookingRepo = new MongoBookingRepository(bookingCollection);
  const roomRepo = new MongoRoomRepository(roomCollection);
  const userRepo = new MongoUserRepository(userCollection);

  container
    .registerBookingRepository(bookingRepo)
    .registerRoomRepository(roomRepo);

  // 2. Domain services
  const availabilityService = new AvailabilityService(bookingRepo);
  const pricingService = new PricingService(new StandardPricingStrategy());

  container
    .registerAvailabilityService(availabilityService)
    .registerPricingService(pricingService);

  // 3. Event bus (Observer pattern) - SINGLETON
  const eventBus = EventBus.getInstance();

  // 4. Use cases
  const createBookingUseCase = new CreateBookingUseCase(
    bookingRepo,
    roomRepo,
    availabilityService,
    pricingService,
    eventBus,
  );

  container.registerCreateBookingUseCase(createBookingUseCase);

  // 5. Controllers
  const bookingController = new BookingController(
    createBookingUseCase,
    new ErrorHandler(),
  );

  container.set("BookingController", bookingController);

  return container;
}

// Usage in server.ts
const container = setupContainer();
const bookingController = container.get<BookingController>("BookingController");

app.post("/api/bookings", (req, res) => {
  bookingController.createBooking(req as AuthRequest, res);
});
```

---

## Part 5: Complete Refactoring Plan

### Phase 1: Setup (Week 1)

- [ ] Create new folder structure
- [ ] Define all interfaces (Abstraction)
- [ ] Create base classes and types
- [ ] Setup TypeScript paths

### Phase 2: Domain Layer (Week 2)

- [ ] Implement domain entities
- [ ] Implement value objects
- [ ] Define repository interfaces
- [ ] Implement domain services

### Phase 3: Application Layer (Week 2-3)

- [ ] Create use cases
- [ ] Implement event system (Observer)
- [ ] Create DTOs
- [ ] Validation

### Phase 4: Infrastructure (Week 3-4)

- [ ] Implement repositories (MongoDB)
- [ ] External service adapters
- [ ] HTTP controllers
- [ ] Middleware

### Phase 5: Integration (Week 4)

- [ ] Setup DI container
- [ ] Wire up application
- [ ] Create factories
- [ ] Setup singletons

### Phase 6: Testing & Refinement (Week 5-6)

- [ ] Unit tests for domain
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance testing

---

## Summary: Design Patterns Used in UniLodge

| Pattern                  | Use Case                        | Example                                          |
| ------------------------ | ------------------------------- | ------------------------------------------------ |
| **Factory**              | Creating repositories by config | `RepositoryFactory.create('mongo')`              |
| **Singleton**            | Database, Logger, Event Bus     | `Database.getInstance()`                         |
| **Repository**           | Data access abstraction         | `IBookingRepository` interface                   |
| **Service**              | Business logic orchestration    | `PricingService`, `AvailabilityService`          |
| **Strategy**             | Runtime algorithm selection     | Pricing strategies (standard, seasonal, loyalty) |
| **Decorator**            | Add behavior dynamically        | Retry, Logging, Encryption decorators            |
| **Adapter**              | Third-party service integration | Stripe, PayPal payment adapters                  |
| **Observer**             | Event notifications             | Room approved, booking confirmed events          |
| **Builder**              | Complex object creation         | `BookingBuilder` for complex bookings            |
| **Dependency Injection** | Loose coupling                  | Constructor injection in services                |
| **Value Objects**        | Immutable domain objects        | `DateRange`, `Price`, `Address`                  |

---

## SOLID Principles Compliance

| Principle                 | Implementation                                                       |
| ------------------------- | -------------------------------------------------------------------- |
| **S**ingle Responsibility | Each class has one job (Controller, Service, Repository, Entity)     |
| **O**pen/Closed           | Open for extension (strategies, decorators), closed for modification |
| **L**iskov Substitution   | All implementations honor interface contracts                        |
| **I**nterface Segregation | Small interfaces (IPricingStrategy, INotificationService)            |
| **D**ependency Inversion  | Depend on abstractions (interfaces), not concrete classes            |

This is **enterprise-grade architecture** ready for growth!
