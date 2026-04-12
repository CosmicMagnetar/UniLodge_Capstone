import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth';
import { authorize } from '../../shared/middleware/roleAuthorizer';
import { Role } from '../../shared/types';
import {
  submitContactForm,
  getAllContacts,
  updateContactStatus,
} from './contactController';

/**
 * Contact Routes — Using Strategy Pattern (OCP)
 */

const router = Router();

router.post('/', submitContactForm);
router.get('/', authMiddleware, authorize(Role.ADMIN), getAllContacts);
router.patch('/:id/status', authMiddleware, authorize(Role.ADMIN), updateContactStatus);

export default router;
