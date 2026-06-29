// src/modules/channels/channels.routes.ts
import { Router } from 'express';
import { channelsController } from './channels.controller.js';
import { authMiddleware } from '@/common/middleware/auth.middleware.js';
import { body } from 'express-validator';

const router = Router();
router.use(authMiddleware);

router.get('/', channelsController.getChannels.bind(channelsController));

router.post(
  '/connect',
  body('type').notEmpty().withMessage('نوع القناة مطلوب'),
  body('credentials').isObject().withMessage('بيانات الاعتماد مطلوبة'),
  channelsController.connectChannel.bind(channelsController)
);

router.delete('/:id', channelsController.deleteChannel.bind(channelsController));

export default router;