import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/roleAuthorizer';
import { Role } from '../types';
import {
  createBookingRequest,
  getAllBookingRequests,
  getUserBookingRequests,
  approveBookingRequest,
  rejectBookingRequest,
} from '../controllers/bookingRequestController';

/**
 * Booking Request Routes — Using Strategy Pattern (OCP)
 */

const router = Router();

router.post('/', authMiddleware, createBookingRequest);
router.get('/', authMiddleware, authorize(Role.ADMIN), getAllBookingRequests);
router.get('/my-requests', authMiddleware, getUserBookingRequests);
router.post('/:id/approve', authMiddleware, authorize(Role.ADMIN), approveBookingRequest);
router.post('/:id/reject', authMiddleware, authorize(Role.ADMIN), rejectBookingRequest);

export default router;
