// src/modules/channels/channels.controller.ts
import type { Request, Response, NextFunction } from 'express';
import prisma from '@/config/database.js';
import { channelService } from './channels.service.js';
import { success, created } from '@/common/utils/responseHelper.js';
import { ApiError } from '@/common/utils/ApiError.js';
import { logger } from '@/common/utils/logger.js';
import type { ChannelType } from '@prisma/client';

export class ChannelsController {
  /**
   * جلب قائمة القنوات المربوطة للمنظمة.
   */
  async getChannels(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const channels = await prisma.channel.findMany({
        where: { orgId: req.user!.orgId },
        select: { id: true, orgId: true, type: true, status: true, webhookUrl: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
      success(res, channels);
    } catch (error) {
      logger.error('Failed to get channels', error);
      next(error);
    }
  }

  /**
   * ربط قناة جديدة.
   */
  async connectChannel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, credentials } = req.body;
      const orgId = req.user!.orgId;

      if (!type || !credentials) throw ApiError.badRequest('نوع القناة وبيانات الاعتماد مطلوبة');

      const validTypes: ChannelType[] = ['WHATSAPP', 'INSTAGRAM', 'TELEGRAM', 'EMAIL'];
      if (!validTypes.includes(type as ChannelType)) throw ApiError.badRequest(`نوع قناة غير صالح: ${type}`);

      const existing = await prisma.channel.findUnique({
        where: { orgId_type: { orgId, type: type as ChannelType } },
      });
      if (existing) throw ApiError.conflict(`قناة ${type} مربوطة بالفعل`);

      const encryptedCredentials = channelService.encryptCredentials(credentials);

      const channel = await prisma.channel.create({
        data: {
          orgId,
          type: type as ChannelType,
          credentials: encryptedCredentials,
          status: 'ACTIVE',
        },
        select: { id: true, orgId: true, type: true, status: true, webhookUrl: true, createdAt: true },
      });

      logger.info(`Channel connected: ${channel.id} (${type}) for org ${orgId}`);
      created(res, channel);
    } catch (error) {
      logger.error('Failed to connect channel', error);
      next(error);
    }
  }

  /**
   * حذف قناة.
   */
  async deleteChannel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.orgId;
      const channelId = req.params.id;

      const channel = await prisma.channel.findFirst({ where: { id: channelId, orgId } });
      if (!channel) throw ApiError.notFound('القناة غير موجودة');

      await prisma.channel.delete({ where: { id: channelId } });

      logger.info(`Channel deleted: ${channelId} from org ${orgId}`);
      success(res, { message: 'تم حذف القناة بنجاح' });
    } catch (error) {
      logger.error('Failed to delete channel', error);
      next(error);
    }
  }
}

export const channelsController = new ChannelsController();