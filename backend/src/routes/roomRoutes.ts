import { Router } from 'express';
import { getRooms, getRoom, createRoom, updateRoom, deleteRoom, approveRoom, rejectRoom, getPendingRooms } from '../controllers/roomController';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/roleAuthorizer';
import { Role } from '../types';

/**
 * Room Routes — Using Strategy Pattern for authorization (OCP)
 */

const router = Router();

// Admin only: View pending rooms
router.get('/pending', authMiddleware, authorize(Role.ADMIN), getPendingRooms);

// Public: View available rooms
router.get('/', getRooms);
router.get('/:id', getRoom);

// Admin only: CRUD
router.post('/', authMiddleware, authorize(Role.ADMIN), createRoom);
router.put('/:id', authMiddleware, authorize(Role.ADMIN), updateRoom);
router.delete('/:id', authMiddleware, authorize(Role.ADMIN), deleteRoom);

// Admin only: Approve/reject
router.patch('/:id/approve', authMiddleware, authorize(Role.ADMIN), approveRoom);
router.patch('/:id/reject', authMiddleware, authorize(Role.ADMIN), rejectRoom);

export default router;
