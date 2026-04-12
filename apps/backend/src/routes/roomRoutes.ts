import { Router } from 'express';
import { getRooms, getRoom, createRoom, updateRoom, deleteRoom, approveRoom, rejectRoom, getPendingRooms } from '../controllers/roomController';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

// Admin only: View pending rooms
router.get('/pending', authMiddleware, adminOnly, getPendingRooms);

// Public: View available rooms (guests can browse)
router.get('/', getRooms);
router.get('/:id', getRoom);

// Admin only: Create, update, delete rooms
router.post('/', authMiddleware, adminOnly, createRoom);
router.put('/:id', authMiddleware, adminOnly, updateRoom);
router.delete('/:id', authMiddleware, adminOnly, deleteRoom);

// Admin only: Approve/reject rooms
router.patch('/:id/approve', authMiddleware, adminOnly, approveRoom);
router.patch('/:id/reject', authMiddleware, adminOnly, rejectRoom);

export default router;
