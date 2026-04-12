/**
 * DI Container — Dependency Injection (DIP)
 * 
 * This is the application's composition root. It wires all dependencies together:
 *   Factories → Repositories → Services
 * 
 * SOLID Principles:
 * - DIP: High-level modules (services) depend on abstractions (interfaces),
 *   not low-level modules (Mongoose models). The wiring happens HERE.
 * - SRP: Each class wired here has a single responsibility
 * - OCP: Swapping implementations (e.g., Mongoose → PostgreSQL) only requires
 *   changes HERE, not in any service or controller
 */

// ─── Factories ──────────────────────────────────────────────
import { TokenFactory } from '../../shared/factories/TokenFactory';
import { CookieFactory } from '../../shared/factories/CookieFactory';
import { NotificationFactory } from '../../shared/factories/NotificationFactory';

// ─── Repositories (Concrete Implementations) ───────────────
import { UserRepository } from '../../modules/users/UserRepository';
import { RoomRepository } from '../../modules/rooms/RoomRepository';
import { BookingRepository } from '../../modules/bookings/BookingRepository';
import { BookingRequestRepository } from '../../modules/bookings/BookingRequestRepository';
import { ContactRepository } from '../../modules/contact/ContactRepository';
import { NotificationRepository } from '../../modules/notifications/NotificationRepository';
import { ReviewRepository } from '../../modules/reviews/ReviewRepository';

// ─── Services ───────────────────────────────────────────────
import { AuthService } from '../../modules/auth/AuthService';
import { RoomService } from '../../modules/rooms/RoomService';
import { BookingService } from '../../modules/bookings/BookingService';
import { BookingRequestService } from '../../modules/bookings/BookingRequestService';
import { ContactService } from '../../modules/contact/ContactService';
import { NotificationService } from '../../modules/notifications/NotificationService';
import { AnalyticsService } from '../../modules/analytics/AnalyticsService';

// ═══════════════════════════════════════════════════════════
// 1. Instantiate Factories
// ═══════════════════════════════════════════════════════════

export const tokenFactory = new TokenFactory();
export const cookieFactory = new CookieFactory();
export const notificationFactory = new NotificationFactory();

// ═══════════════════════════════════════════════════════════
// 2. Instantiate Repositories
// ═══════════════════════════════════════════════════════════

export const userRepository = new UserRepository();
export const roomRepository = new RoomRepository();
export const bookingRepository = new BookingRepository();
export const bookingRequestRepository = new BookingRequestRepository();
export const contactRepository = new ContactRepository();
export const notificationRepository = new NotificationRepository();
export const reviewRepository = new ReviewRepository();

// ═══════════════════════════════════════════════════════════
// 3. Instantiate Services (injecting dependencies)
// ═══════════════════════════════════════════════════════════

export const authService = new AuthService(
  userRepository,
  tokenFactory
);

export const notificationService = new NotificationService(
  notificationRepository,
  notificationFactory
);

export const roomService = new RoomService(
  roomRepository,
  reviewRepository,
  notificationRepository,
  notificationFactory
);

export const bookingService = new BookingService(
  bookingRepository,
  roomRepository
);

export const bookingRequestService = new BookingRequestService(
  bookingRequestRepository,
  bookingRepository,
  roomRepository,
  notificationRepository,
  notificationFactory
);

export const contactService = new ContactService(
  contactRepository
);

export const analyticsService = new AnalyticsService(
  bookingRepository,
  roomRepository
);
