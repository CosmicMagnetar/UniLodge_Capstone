import { Router } from 'express';
import authRoutes from './authRoutes';
import roomRoutes from './roomRoutes';
import bookingRoutes from './bookingRoutes';
import analyticsRoutes from './analyticsRoutes';
import bookingRequestRoutes from './bookingRequestRoutes';
import contactRoutes from './contactRoutes';
import notificationRoutes from './notificationRoutes';

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
