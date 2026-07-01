// src/modules/csat/csat.routes.ts
import { Router } from 'express';
import { csatController } from './csat.controller.js';
import { authMiddleware } from '../../common/middleware/auth.middleware.js';
import { body } from 'express-validator';

const router = Router();

router.post(
  '/generate',
  authMiddleware,
  body('conversationId').notEmpty().withMessage('Conversation ID is required'),
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('channel').notEmpty().withMessage('Channel is required'),
  csatController.generateSurvey.bind(csatController)
);

router.post(
  '/respond',
  body('conversationId').notEmpty().withMessage('Conversation ID is required'),
  body('orgId').notEmpty().withMessage('Organization ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  csatController.respondToSurvey.bind(csatController)
);

router.get('/', authMiddleware, csatController.list.bind(csatController));
router.get('/:conversationId', authMiddleware, csatController.getByConversation.bind(csatController));

export default router;