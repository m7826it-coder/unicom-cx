// src/modules/inbox/customer.controller.ts
import type { Request, Response, NextFunction } from 'express';
import { customerService } from './services/customer.service.js';
import { success, created } from '../../common/utils/responseHelper.js';
import { logger } from '../../common/utils/logger.js';

export class CustomerController {
  async getCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const customer = await customerService.getById(req.user!.orgId, req.params.id); success(res, customer); } catch (error) { logger.error('Failed to get customer', error); next(error); }
  }

  async addTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const tag = await customerService.addTag(req.user!.orgId, req.params.id, req.body.tag); created(res, tag); } catch (error) { logger.error('Failed to add customer tag', error); next(error); }
  }

  async removeTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await customerService.removeTag(req.user!.orgId, req.params.id, req.params.tag); success(res, { message: 'Tag removed' }); } catch (error) { logger.error('Failed to remove customer tag', error); next(error); }
  }

  async addNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const note = await customerService.addNote(req.user!.orgId, req.params.id, req.body.content, req.user!.id); created(res, note); } catch (error) { logger.error('Failed to add customer note', error); next(error); }
  }
}

export const customerController = new CustomerController();