// src/modules/inbox/inbox.routes.ts
import { Router } from 'express';
import { inboxController } from './inbox.controller.js';
import { authMiddleware } from '../../common/middleware/auth.middleware.js';
import { body } from 'express-validator';

const router = Router();
router.use(authMiddleware);

router.get('/conversations', inboxController.listConversations.bind(inboxController));
router.get('/conversations/:id', inboxController.getConversation.bind(inboxController));
router.post('/conversations/:id/messages', body('content').notEmpty().withMessage('Content is required'), inboxController.sendMessage.bind(inboxController));
router.patch('/conversations/:id', inboxController.updateConversation.bind(inboxController));
router.get('/conversations/:id/messages', inboxController.getMessages.bind(inboxController));

export default router;