import { Router } from 'express';
import { register, login, logout, refreshTokenEndpoint, getMe, getWardens } from '../controllers/authController';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.post('/refresh', refreshTokenEndpoint);
router.get('/me', authMiddleware, getMe);
router.get('/wardens', authMiddleware, adminOnly, getWardens);

export default router;
