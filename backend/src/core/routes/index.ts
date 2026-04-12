import { Router } from 'express';
import authRoutes from '../../modules/auth/authRoutes';
import roomRoutes from '../../modules/rooms/roomRoutes';
import bookingRoutes from '../../modules/bookings/bookingRoutes';
import analyticsRoutes from '../../modules/analytics/analyticsRoutes';
import bookingRequestRoutes from '../../modules/bookings/bookingRequestRoutes';
import contactRoutes from '../../modules/contact/contactRoutes';
import notificationRoutes from '../../modules/notifications/notificationRoutes';

/**
 * Route Index — Aggregates all route modules
 */
const router = Router();

router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/booking-requests', bookingRequestRoutes);
router.use('/contacts', contactRoutes);
router.use('/notifications', notificationRoutes);

export default router;
