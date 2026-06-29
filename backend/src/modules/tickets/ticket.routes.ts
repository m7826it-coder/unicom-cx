// src/modules/tickets/ticket.routes.ts
import { Router } from 'express';
import { ticketController } from './ticket.controller.js';
import { authMiddleware } from '@/common/middleware/auth.middleware.js';
import { body } from 'express-validator';

const router = Router();
router.use(authMiddleware);

router.post(
  '/from-conversation/:conversationId',
  body('subject').notEmpty().withMessage('Subject is required'),
  ticketController.createFromConversation.bind(ticketController)
);

router.post(
  '/',
  body('subject').notEmpty().withMessage('Subject is required'),
  ticketController.createStandalone.bind(ticketController)
);

router.get('/', ticketController.list.bind(ticketController));
router.get('/:id', ticketController.getById.bind(ticketController));
router.patch('/:id', ticketController.update.bind(ticketController));

export default router;