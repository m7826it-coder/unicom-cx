// src/modules/csat/csat.controller.ts
import type { Request, Response, NextFunction } from 'express';
import { csatService } from './csat.service.js';
import { success, created } from '../../common/utils/responseHelper.js';

export class CSATController {
  async generateSurvey(req: Request, res: Response, next: NextFunction) {
    try {
      const { conversationId, customerId, channel } = req.body;
      const survey = await csatService.generateSurvey(
        req.user!.orgId,
        conversationId,
        customerId,
        channel
      );
      created(res, survey);
    } catch (err) { next(err); }
  }

  async respondToSurvey(req: Request, res: Response, next: NextFunction) {
    try {
      const { conversationId, orgId, rating, feedback } = req.body;
      const survey = await csatService.processResponse(
        orgId,
        conversationId,
        rating,
        feedback
      );
      success(res, survey);
    } catch (err) { next(err); }
  }

  async getByConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const survey = await csatService.getByConversation(
        req.user!.orgId,
        req.params.conversationId
      );
      success(res, survey);
    } catch (err) { next(err); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query;
      const result = await csatService.list(req.user!.orgId, {
        status: status as string | undefined,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });
      success(res, result.surveys, 200);
    } catch (err) { next(err); }
  }
}

export const csatController = new CSATController();