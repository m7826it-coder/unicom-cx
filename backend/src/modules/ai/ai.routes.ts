// src/modules/ai/ai.routes.ts
import { Router } from 'express';
import { aiController } from './ai.controller.js';
import { authMiddleware } from '../../common/middleware/auth.middleware.js';
import { body } from 'express-validator';

const router = Router();
router.use(authMiddleware);

router.get('/settings', aiController.getSettings.bind(aiController));
router.put('/settings', aiController.updateSettings.bind(aiController));
router.get('/knowledge-base', aiController.getKnowledgeBase.bind(aiController));
router.post('/knowledge-base', body('question').notEmpty().withMessage('السؤال مطلوب'), body('answer').notEmpty().withMessage('الجواب مطلوب'), aiController.addKnowledgeBaseEntry.bind(aiController));
router.delete('/knowledge-base/:id', aiController.deleteKnowledgeBaseEntry.bind(aiController));
router.patch('/knowledge-base/:id/toggle', aiController.toggleKnowledgeBaseEntry.bind(aiController));

export default router;