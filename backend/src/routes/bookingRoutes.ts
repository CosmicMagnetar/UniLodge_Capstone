import { Router } from 'express';
import { getBookings, getBooking, createBooking, updateBookingStatus, processPayment, completeCheckIn, completeCheckOut } from '../controllers/bookingController';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/roleAuthorizer';
import { Role } from '../types';

/**
 * Booking Routes — Using Strategy Pattern for authorization (OCP)
 * 
 * BEFORE: adminOrWardenOnly (a dedicated function)
 * AFTER: authorize(Role.ADMIN, Role.WARDEN) (composable, extensible)
 */

const router = Router();

// All booking routes require authentication
router.use(authMiddleware as any);

// View bookings (admin sees all, guests see own — handled in service)
router.get('/', getBookings);
router.get('/:id', getBooking);

// Guests can create bookings
router.post('/', createBooking);

// Admin only: Update booking status
router.patch('/:id/status', authorize(Role.ADMIN), updateBookingStatus);

// Guests can process payment (authorization in service)
router.post('/:id/payment', processPayment);

// Admin or Warden: Check-in and check-out
router.post('/:id/checkin', authorize(Role.ADMIN, Role.WARDEN), completeCheckIn);
router.post('/:id/checkout', authorize(Role.ADMIN, Role.WARDEN), completeCheckOut);

export default router;
