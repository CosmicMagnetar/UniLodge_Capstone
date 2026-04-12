import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth';
import {
    createBookingRequest,
    getAllBookingRequests,
    getUserBookingRequests,
    approveBookingRequest,
    rejectBookingRequest,
} from '../controllers/bookingRequestController';

const router = Router();

router.post('/', authMiddleware, createBookingRequest);
router.get('/', authMiddleware, adminOnly, getAllBookingRequests);
router.get('/my-requests', authMiddleware, getUserBookingRequests);
router.post('/:id/approve', authMiddleware, adminOnly, approveBookingRequest);
router.post('/:id/reject', authMiddleware, adminOnly, rejectBookingRequest);

export default router;
