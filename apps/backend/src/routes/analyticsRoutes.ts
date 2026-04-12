import { Router } from 'express';
import { getAnalytics } from '../controllers/analyticsController';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

// Analytics only for admins - wrap async middleware
router.use((req, res, next) => {
  authMiddleware(req as any, res, next);
});
router.use((req, res, next) => {
  adminOnly(req as any, res, next);
});

router.get('/', async (req, res, next) => {
  try {
    await getAnalytics(req as any, res);
  } catch (error) {
    next(error);
  }
});

export default router;
