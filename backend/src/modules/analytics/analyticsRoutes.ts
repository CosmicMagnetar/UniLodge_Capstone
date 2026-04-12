import { Router } from 'express';
import { getAnalytics } from './analyticsController';
import { authMiddleware } from '../../shared/middleware/auth';
import { authorize } from '../../shared/middleware/roleAuthorizer';
import { Role } from '../../shared/types';

/**
 * Analytics Routes — Simplified with Strategy Pattern (OCP)
 * 
 * BEFORE: 3 separate router.use() calls with wrapped async middleware
 * AFTER: Clean middleware chain using authorize()
 */

const router = Router();

router.get('/', authMiddleware, authorize(Role.ADMIN), getAnalytics);

export default router;
