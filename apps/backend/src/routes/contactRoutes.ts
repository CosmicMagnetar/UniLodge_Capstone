import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth';
import {
    submitContactForm,
    getAllContacts,
    updateContactStatus,
} from '../controllers/contactController';

const router = Router();

router.post('/', submitContactForm);
router.get('/', authMiddleware, adminOnly, getAllContacts);
router.patch('/:id/status', authMiddleware, adminOnly, updateContactStatus);

export default router;
