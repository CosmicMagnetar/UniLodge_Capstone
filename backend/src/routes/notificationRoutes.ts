import { Router } from 'express';
import { getUserNotifications, markAsRead, deleteNotification } from '../controllers/notificationController';
import { authMiddleware } from '../middleware/auth';

/**
 * Notification Routes
 */

const router = Router();

// All notification routes require authentication
router.use(authMiddleware as any);

router.get('/', getUserNotifications);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
