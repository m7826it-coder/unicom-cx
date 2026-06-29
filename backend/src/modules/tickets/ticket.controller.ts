// src/modules/tickets/ticket.controller.ts
import type { Request, Response, NextFunction } from 'express';
import { ticketService } from './ticket.service.js';
import { success, created } from '@/common/utils/responseHelper.js';

export class TicketController {
  async createFromConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.createFromConversation(
        req.user!.orgId,
        req.params.conversationId,
        req.body
      );
      created(res, ticket);
    } catch (err) { next(err); }
  }

  async createStandalone(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.createStandalone(req.user!.orgId, req.body);
      created(res, ticket);
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.getById(req.user!.orgId, req.params.id);
      success(res, ticket);
    } catch (err) { next(err); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, priority, assignedTo, page, limit } = req.query;
      const result = await ticketService.list(req.user!.orgId, {
        status: status as any,
        priority: priority as any,
        assignedTo: assignedTo === 'me' ? req.user!.id : (assignedTo as string | undefined),
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });
      success(res, result.tickets, 200);
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.update(
        req.user!.orgId,
        req.params.id,
        req.body,
        req.user!.id,
        req.user!.role
      );
      success(res, ticket);
    } catch (err) { next(err); }
  }
}

export const ticketController = new TicketController();