// src/modules/analytics/analytics.controller.ts
import type { Request, Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service.js';
import { success } from '@/common/utils/responseHelper.js';
import { logger } from '@/common/utils/logger.js';

export class AnalyticsController {
  async getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getOverview(req.user!.orgId);
      success(res, data);
    } catch (error) {
      logger.error('Failed to get analytics overview', error);
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();