import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/roleAuthorizer';
import { Role } from '../types';
import {
  submitContactForm,
  getAllContacts,
  updateContactStatus,
} from '../controllers/contactController';

/**
 * Contact Routes — Using Strategy Pattern (OCP)
 */

const router = Router();

router.post('/', submitContactForm);
router.get('/', authMiddleware, authorize(Role.ADMIN), getAllContacts);
router.patch('/:id/status', authMiddleware, authorize(Role.ADMIN), updateContactStatus);

export default router;
