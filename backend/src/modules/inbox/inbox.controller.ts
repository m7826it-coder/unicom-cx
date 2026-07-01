// src/modules/inbox/inbox.controller.ts
import type { Request, Response, NextFunction } from 'express';
import { conversationService } from './services/conversation.service.js';
import { messageService } from './services/message.service.js';
import { success, created, paginated } from '../../common/utils/responseHelper.js';
import type { ConversationStatus, ContentType } from '@prisma/client';

export class InboxController {
  async listConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, channel, classification, assignedTo, search, page, limit } = req.query;
      const filters: Parameters<typeof conversationService.list>[1] = { page: page ? parseInt(page as string, 10) : 1, limit: limit ? parseInt(limit as string, 10) : 20 };
      if (status) filters.status = (status as string).split(',') as ConversationStatus[];
      if (channel) filters.channel = channel as any;
      if (classification) filters.classification = classification as any;
      if (assignedTo === 'me') filters.assignedTo = req.user!.id; else if (assignedTo) filters.assignedTo = assignedTo as string;
      if (search) filters.search = search as string;
      const result = await conversationService.list(req.user!.orgId, filters);
      paginated(res, result.data, result.pagination);
    } catch (err) { next(err); }
  }

  async getConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const conv = await conversationService.getById(req.user!.orgId, req.params.id);
      success(res, conv);
    } catch (err) { next(err); }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { content, contentType } = req.body;
      const msg = await messageService.sendAgentMessage(req.user!.orgId, req.params.id, req.user!.id, content, (contentType as ContentType) ?? 'TEXT');
      created(res, msg);
    } catch (err) { next(err); }
  }

  async updateConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, assignedTo } = req.body;
      let conv;
      if (status) conv = await conversationService.updateStatus(req.user!.orgId, req.params.id, status as ConversationStatus);
      if (assignedTo !== undefined) {
        const agentId = assignedTo === 'me' ? req.user!.id : assignedTo;
        conv = await conversationService.assign(req.user!.orgId, req.params.id, agentId);
      }
      success(res, conv);
    } catch (err) { next(err); }
  }

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt((req.query.page as string) ?? '1', 10);
      const limit = parseInt((req.query.limit as string) ?? '50', 10);
      const result = await messageService.getMessages(req.params.id, page, limit);
      paginated(res, result.messages, result.pagination);
    } catch (err) { next(err); }
  }
}

export const inboxController = new InboxController();