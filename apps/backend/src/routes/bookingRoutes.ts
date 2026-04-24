import { Router, Request, Response, NextFunction } from 'express';
import {
  getBookings, getBooking, createBooking,
  updateBookingStatus, processPayment,
  completeCheckIn, completeCheckOut
} from '../controllers/bookingController';
import { authMiddleware, adminOnly, adminOrWardenOnly } from '../middleware/auth';
import { validateBody } from '../shared/validators/zodValidator';
import {
  CreateBookingSchema,
  UpdateBookingStatusSchema,
  ProcessPaymentSchema,
} from '../../../../packages/shared/src/schemas/booking.schema';
import { DIContainer } from '../container';
import { AuthRequest } from '../types';

const router = Router();

// All booking routes require authentication
router.use((req, res, next) => {
  authMiddleware(req as any, res, next);
});

// ── DDD Controller Bridge ──────────────────────────────────────────────────
// If the DI container is initialized, route to the clean-arch BookingController.
// Otherwise, fall back to the v1 Mongoose controllers for backward compatibility.

function useDDD(
  method: 'createBooking' | 'getBookings' | 'getBooking' | 'confirmBooking' | 'cancelBooking'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const container: DIContainer | undefined = req.app.get('diContainer');
    if (container?.has('BookingController')) {
      const controller = container.get<any>('BookingController');
      return controller[method](req, res);
    }
    // Fallback to v1 — this path is removed once all controllers are migrated
    next();
  };
}

// ── Routes ─────────────────────────────────────────────────────────────────

// Admin: View all bookings, Guests: View own bookings (handled in controller)
router.get('/', useDDD('getBookings'), getBookings);
router.get('/:id', useDDD('getBooking'), getBooking);

// Guests can create bookings — with Zod validation
router.post(
  '/',
  validateBody(CreateBookingSchema),
  useDDD('createBooking'),
  createBooking
);

// Admin only: Update booking status — with Zod validation
router.patch(
  '/:id/status',
  adminOnly,
  validateBody(UpdateBookingStatusSchema),
  updateBookingStatus
);

// Guests can process payment for their own bookings — with Zod validation
router.post(
  '/:id/payment',
  validateBody(ProcessPaymentSchema),
  processPayment
);

// Admin or Warden: Check-in and check-out operations
router.post('/:id/checkin', adminOrWardenOnly, completeCheckIn);
router.post('/:id/checkout', adminOrWardenOnly, completeCheckOut);

export default router;
