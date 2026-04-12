import { Router } from 'express';
import { getAnalytics } from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/roleAuthorizer';
import { Role } from '../types';

/**
 * Analytics Routes — Simplified with Strategy Pattern (OCP)
 * 
 * BEFORE: 3 separate router.use() calls with wrapped async middleware
 * AFTER: Clean middleware chain using authorize()
 */

const router = Router();

router.get('/', authMiddleware, authorize(Role.ADMIN), getAnalytics);

export default router;
