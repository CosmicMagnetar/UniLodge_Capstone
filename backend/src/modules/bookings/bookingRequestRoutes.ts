import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth';
import { authorize } from '../../shared/middleware/roleAuthorizer';
import { Role } from '../../shared/types';
import {
  createBookingRequest,
  getAllBookingRequests,
  getUserBookingRequests,
  approveBookingRequest,
  rejectBookingRequest,
} from './bookingRequestController';

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
