import { Router } from 'express';
import { getRooms, getRoom, createRoom, updateRoom, deleteRoom, approveRoom, rejectRoom, getPendingRooms } from '../controllers/roomController';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { validateBody, validateQuery } from '../shared/validators/zodValidator';
import { CreateRoomSchema, UpdateRoomSchema, RoomQuerySchema } from '../../../../packages/shared/src/schemas/room.schema';

const router = Router();

// Admin only: View pending rooms
router.get('/pending', authMiddleware, adminOnly, getPendingRooms);

// Public: View available rooms (guests can browse) — with query validation
router.get('/', validateQuery(RoomQuerySchema), getRooms);
router.get('/:id', getRoom);

// Admin only: Create, update, delete rooms — with body validation
router.post('/', authMiddleware, adminOnly, validateBody(CreateRoomSchema), createRoom);
router.put('/:id', authMiddleware, adminOnly, validateBody(UpdateRoomSchema), updateRoom);
router.delete('/:id', authMiddleware, adminOnly, deleteRoom);

// Admin only: Approve/reject rooms
router.patch('/:id/approve', authMiddleware, adminOnly, approveRoom);
router.patch('/:id/reject', authMiddleware, adminOnly, rejectRoom);

export default router;
