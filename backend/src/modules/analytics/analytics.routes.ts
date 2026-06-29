// src/modules/analytics/analytics.routes.ts
import { Router } from 'express';
import { analyticsController } from './analytics.controller.js';
import { authMiddleware } from '@/common/middleware/auth.middleware.js';

const router = Router();
router.use(authMiddleware);

router.get('/overview', analyticsController.getOverview.bind(analyticsController));

export default router;