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
import { TokenFactory } from '../factories/TokenFactory';
import { CookieFactory } from '../factories/CookieFactory';
import { NotificationFactory } from '../factories/NotificationFactory';

// ─── Repositories (Concrete Implementations) ───────────────
import { UserRepository } from '../repositories/UserRepository';
import { RoomRepository } from '../repositories/RoomRepository';
import { BookingRepository } from '../repositories/BookingRepository';
import { BookingRequestRepository } from '../repositories/BookingRequestRepository';
import { ContactRepository } from '../repositories/ContactRepository';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { ReviewRepository } from '../repositories/ReviewRepository';

// ─── Services ───────────────────────────────────────────────
import { AuthService } from '../services/AuthService';
import { RoomService } from '../services/RoomService';
import { BookingService } from '../services/BookingService';
import { BookingRequestService } from '../services/BookingRequestService';
import { ContactService } from '../services/ContactService';
import { NotificationService } from '../services/NotificationService';
import { AnalyticsService } from '../services/AnalyticsService';

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
