// src/modules/ai/ai.controller.ts
import type { Request, Response, NextFunction } from 'express';
import { aiAdminService } from './ai-admin.service.js';
import { success, created } from '../../common/utils/responseHelper.js';
import { logger } from '../../common/utils/logger.js';

export class AIController {
  async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const settings = await aiAdminService.getBotSettings(req.user!.orgId); success(res, settings); } catch (error) { logger.error('Failed to get bot settings', error); next(error); }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const settings = await aiAdminService.updateBotSettings(req.user!.orgId, req.body); success(res, settings); } catch (error) { logger.error('Failed to update bot settings', error); next(error); }
  }

  async getKnowledgeBase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const entries = await aiAdminService.getKnowledgeBase(req.user!.orgId); success(res, entries); } catch (error) { logger.error('Failed to get knowledge base', error); next(error); }
  }

  async addKnowledgeBaseEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const entry = await aiAdminService.addKnowledgeBaseEntry(req.user!.orgId, req.body); created(res, entry); } catch (error) { logger.error('Failed to add knowledge base entry', error); next(error); }
  }

  async deleteKnowledgeBaseEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await aiAdminService.deleteKnowledgeBaseEntry(req.user!.orgId, req.params.id); success(res, { message: 'تم حذف الإدخال بنجاح' }); } catch (error) { logger.error('Failed to delete knowledge base entry', error); next(error); }
  }

  async toggleKnowledgeBaseEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const entry = await aiAdminService.toggleKnowledgeBaseEntry(req.user!.orgId, req.params.id); success(res, entry); } catch (error) { logger.error('Failed to toggle knowledge base entry', error); next(error); }
  }
}

export const aiController = new AIController();