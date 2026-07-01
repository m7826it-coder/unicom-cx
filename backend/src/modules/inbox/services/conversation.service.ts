// src/modules/inbox/services/conversation.service.ts
import prisma from '../../../config/database.js';
import { ApiError } from '../../../common/utils/ApiError.js';
import { logger } from '../../../common/utils/logger.js';
import { csatQueue, notificationQueue } from '../../../common/queues/index.js';
import { Events } from '../../../common/events/events.js';
import type { Prisma, ChannelType, ConversationStatus, Classification } from '@prisma/client';

export class ConversationService {
  /**
   * العثور على محادثة مفتوحة لنفس العميل والقناة، أو إنشاء واحدة جديدة.
   */
  async findOrCreate(orgId: string, customerId: string, channel: ChannelType) {
    let conversation = await prisma.conversation.findFirst({
      where: { orgId, customerId, channel, status: { in: ['OPEN', 'WAITING'] } },
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({ data: { orgId, customerId, channel, status: 'OPEN' } });
      logger.info(`New conversation created: ${conversation.id} for customer ${customerId} on ${channel}`);
    }
    return conversation;
  }

  /**
   * جلب محادثة محددة مع العميل والوكيل وآخر 50 رسالة.
   */
  async getById(orgId: string, conversationId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, orgId },
      include: {
        customer: true,
        assignedAgent: { select: { id: true, name: true, avatar: true } },
        messages: { take: 50, orderBy: { createdAt: 'asc' }, include: { agent: { select: { id: true, name: true } }, customer: { select: { id: true, name: true } } } },
      },
    });
    if (!conversation) throw ApiError.notFound('Conversation not found');
    return conversation;
  }

  /**
   * جلب قائمة المحادثات مع فلترة وترقيم.
   */
  async list(orgId: string, filters: {
    status?: ConversationStatus | ConversationStatus[]; channel?: ChannelType; classification?: Classification;
    assignedTo?: string; search?: string; page?: number; limit?: number;
  }) {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const skip = (page - 1) * limit;
    const where: Prisma.ConversationWhereInput = { orgId };

    if (filters.status) where.status = Array.isArray(filters.status) ? { in: filters.status } : filters.status;
    if (filters.channel) where.channel = filters.channel;
    if (filters.classification) where.classification = filters.classification;
    if (filters.assignedTo) where.assignedTo = filters.assignedTo;
    if (filters.search) where.customer = { name: { contains: filters.search, mode: 'insensitive' } };

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, avatar: true } },
          assignedAgent: { select: { id: true, name: true } },
          messages: { take: 1, orderBy: { createdAt: 'desc' }, select: { content: true, senderType: true, createdAt: true } },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip, take: limit,
      }),
      prisma.conversation.count({ where }),
    ]);

    const data = conversations.map((conv) => {
      const lastMessage = conv.messages.length > 0 ? conv.messages[0] : null;
      const unreadCount = 0;
      return { ...conv, lastMessage, unreadCount };
    });
    return { data, pagination: { page, limit, total } };
  }

  /**
   * تحديث حالة المحادثة. إذا أُغلقت، يتم إرسال مهمة استبيان CSAT.
   */
  async updateStatus(orgId: string, conversationId: string, status: ConversationStatus) {
    const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, orgId } });
    if (!conversation) throw ApiError.notFound('Conversation not found');

    const updated = await prisma.conversation.update({ where: { id: conversationId }, data: { status } });

    if (status === 'CLOSED') {
      await csatQueue.add(Events.CSAT_SURVEY_GENERATE, { conversationId: conversation.id, orgId: conversation.orgId, customerId: conversation.customerId, channel: conversation.channel });
      logger.info(`CSAT survey job queued for conversation ${conversation.id}`);
    }
    await notificationQueue.add(Events.CONVERSATION_UPDATED, { conversationId: conversation.id, orgId: conversation.orgId, changes: { status } });
    return updated;
  }

  /**
   * تعيين المحادثة لوكيل.
   */
  async assign(orgId: string, conversationId: string, agentId: string | null) {
    const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, orgId } });
    if (!conversation) throw ApiError.notFound('Conversation not found');
    if (agentId) {
      const agent = await prisma.user.findFirst({ where: { id: agentId, orgId } });
      if (!agent || (agent.role !== 'AGENT' && agent.role !== 'ADMIN')) throw ApiError.badRequest('Agent not found or invalid role');
    }
    const updated = await prisma.conversation.update({ where: { id: conversationId }, data: { assignedTo: agentId } });
    await notificationQueue.add(Events.CONVERSATION_UPDATED, { conversationId: conversation.id, orgId: conversation.orgId, changes: { assignedTo: agentId } });
    return updated;
  }

  /**
   * تصنيف المحادثة.
   */
  async classify(orgId: string, conversationId: string, classification: Classification) {
    const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, orgId } });
    if (!conversation) throw ApiError.notFound('Conversation not found');
    const updated = await prisma.conversation.update({ where: { id: conversationId }, data: { classification } });
    await notificationQueue.add(Events.CONVERSATION_UPDATED, { conversationId: conversation.id, orgId: conversation.orgId, changes: { classification } });
    return updated;
  }
}

export const conversationService = new ConversationService();