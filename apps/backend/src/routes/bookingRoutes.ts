import { Router } from 'express';
import { getBookings, getBooking, createBooking, updateBookingStatus, processPayment, completeCheckIn, completeCheckOut } from '../controllers/bookingController';
import { authMiddleware, adminOnly, adminOrWardenOnly } from '../middleware/auth';

const router = Router();

// All booking routes require authentication
router.use((req, res, next) => {
  authMiddleware(req as any, res, next);
});

// Admin: View all bookings, Guests: View own bookings (handled in controller)
router.get('/', getBookings);
router.get('/:id', getBooking);

// Guests can create bookings
router.post('/', createBooking);

// Admin only: Update booking status
router.patch('/:id/status', adminOnly, updateBookingStatus);

// Guests can process payment for their own bookings (handled in controller)
router.post('/:id/payment', processPayment);

// Admin or Warden: Check-in and check-out operations
router.post('/:id/checkin', adminOrWardenOnly, completeCheckIn);
router.post('/:id/checkout', adminOrWardenOnly, completeCheckOut);

export default router;
