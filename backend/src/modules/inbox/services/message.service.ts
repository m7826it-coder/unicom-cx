// src/modules/inbox/services/message.service.ts
import prisma from '@/config/database.js';
import { ApiError } from '@/common/utils/ApiError.js';
import { logger } from '@/common/utils/logger.js';
import { outboundQueue, aiAnalysisQueue, notificationQueue } from '@/common/queues/index.js';
import { Events } from '@/common/events/events.js';
import { conversationService } from './conversation.service.js';
import { customerService } from './customer.service.js';
import type { ContentType, ChannelType } from '@prisma/client';

export class MessageService {
  /**
   * إرسال رسالة من وكيل مع فحص مشاعر غير متزامن.
   */
  async sendAgentMessage(orgId: string, conversationId: string, agentId: string, content: string, contentType: ContentType = 'TEXT') {
    const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, orgId } });
    if (!conversation) throw ApiError.notFound('Conversation not found');
    if (conversation.status === 'CLOSED') throw ApiError.badRequest('Cannot send message to a closed conversation');
    if (conversation.assignedTo && conversation.assignedTo !== agentId) throw ApiError.forbidden('Conversation is assigned to another agent');

    const message = await prisma.message.create({ data: { conversationId, senderType: 'AGENT', agentId, content, contentType, metadata: { sentimentStatus: 'pending' } } });
    await prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } });

    aiAnalysisQueue.add(Events.AGENT_MESSAGE_SENTIMENT_CHECK, { messageId: message.id, conversationId, orgId, agentId, content }).catch((err: Error) => logger.error('Failed to queue sentiment check', err));
    outboundQueue.add(Events.MESSAGE_SEND, { messageId: message.id, conversationId, orgId, channel: conversation.channel, content, contentType, customerId: conversation.customerId }).catch((err: Error) => logger.error('Failed to queue outbound message', err));
    notificationQueue.add(Events.MESSAGE_NEW, { conversationId, orgId, messageId: message.id }).catch((err: Error) => logger.error('Failed to queue notification', err));
    return message;
  }

  /**
   * معالجة رسالة واردة من عميل عبر قناة خارجية.
   */
  async receiveCustomerMessage(orgId: string, channel: ChannelType, identifier: string, content: string, contentType: ContentType = 'TEXT', idempotencyKey?: string) {
    const customer = await customerService.getOrCreate(orgId, channel, identifier);
    const conversation = await conversationService.findOrCreate(orgId, customer.id, channel);

    if (idempotencyKey) {
      const existing = await prisma.message.findFirst({ where: { conversationId: conversation.id, senderType: 'CUSTOMER', metadata: { path: ['idempotencyKey'], equals: idempotencyKey } } });
      if (existing) { logger.info(`Idempotent message skipped: ${idempotencyKey}`); return existing; }
    }

    const message = await prisma.message.create({ data: { conversationId: conversation.id, senderType: 'CUSTOMER', customerId: customer.id, content, contentType, metadata: idempotencyKey ? { idempotencyKey } : undefined } });
    await prisma.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: new Date() } });

    aiAnalysisQueue.add(Events.AI_ANALYZE, { messageId: message.id, conversationId: conversation.id, orgId, channel, content, customerId: customer.id }).catch((err: Error) => logger.error('Failed to queue AI analysis', err));
    notificationQueue.add(Events.MESSAGE_NEW, { conversationId: conversation.id, orgId, messageId: message.id }).catch((err: Error) => logger.error('Failed to queue notification', err));
    logger.info(`Customer message received: conv=${conversation.id} channel=${channel}`);
    return message;
  }

  /**
   * جلب قائمة رسائل محادثة مرتبة تصاعديًا مع ترقيم.
   */
  async getMessages(conversationId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      prisma.message.findMany({ where: { conversationId }, include: { agent: { select: { id: true, name: true } }, customer: { select: { id: true, name: true } } }, orderBy: { createdAt: 'asc' }, skip, take: limit }),
      prisma.message.count({ where: { conversationId } }),
    ]);
    return { messages, pagination: { page, limit, total } };
  }
}

export const messageService = new MessageService();