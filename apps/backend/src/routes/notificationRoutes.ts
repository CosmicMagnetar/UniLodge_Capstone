import express from 'express';
import { getUserNotifications, markAsRead, deleteNotification } from '../controllers/notificationController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// All notification routes require authentication
router.use(authMiddleware);

// Get user's notifications
router.get('/', getUserNotifications);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

export default router;
