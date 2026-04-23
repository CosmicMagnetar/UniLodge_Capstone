import { Router } from 'express';
import { register, login, logout, refreshTokenEndpoint, getMe, getWardens, getUniversities } from '../controllers/authController';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/universities', getUniversities);

// Protected routes
router.post('/logout', authMiddleware, logout);
router.post('/refresh', refreshTokenEndpoint);
router.get('/me', authMiddleware, getMe);
router.get('/wardens', authMiddleware, adminOnly, getWardens);

export default router;
