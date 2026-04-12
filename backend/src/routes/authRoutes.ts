import { Router } from 'express';
import { register, login, logout, refreshTokenEndpoint, getMe, getWardens } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/roleAuthorizer';
import { Role } from '../types';

/**
 * Auth Routes — Using Strategy Pattern for authorization
 * 
 * BEFORE: import { adminOnly } → router.get('/wardens', authMiddleware, adminOnly, getWardens)
 * AFTER:  import { authorize } → router.get('/wardens', authMiddleware, authorize(Role.ADMIN), getWardens)
 * 
 * OCP: Adding a new role just requires authorize(Role.NEW_ROLE) — no new function needed
 */

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.post('/refresh', refreshTokenEndpoint);
router.get('/me', authMiddleware, getMe);
router.get('/wardens', authMiddleware, authorize(Role.ADMIN), getWardens);

export default router;
