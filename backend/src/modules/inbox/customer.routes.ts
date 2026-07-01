// src/modules/inbox/customer.routes.ts
import { Router } from 'express';
import { customerController } from './customer.controller.js';
import { authMiddleware } from '../../common/middleware/auth.middleware.js';
import { body } from 'express-validator';

const router = Router();
router.use(authMiddleware);

router.get('/:id', customerController.getCustomer.bind(customerController));
router.post('/:id/tags', body('tag').notEmpty().withMessage('Tag is required'), customerController.addTag.bind(customerController));
router.delete('/:id/tags/:tag', customerController.removeTag.bind(customerController));
router.post('/:id/notes', body('content').notEmpty().withMessage('Note content is required'), customerController.addNote.bind(customerController));

export default router;