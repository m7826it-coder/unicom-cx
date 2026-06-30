// src/modules/tickets/ticket.service.ts
import prisma from '@/config/database.js';
import { ApiError } from '@/common/utils/ApiError.js';
import { logger } from '@/common/utils/logger.js';
import { notificationQueue } from '@/common/queues/index.js';
import { Events } from '@/common/events/events.js';
import type { TicketPriority, TicketStatus } from '@prisma/client';

export class TicketService {
  /**
   * إنشاء تذكرة من محادثة موجودة.
   */
  async createFromConversation(
    orgId: string,
    conversationId: string,
    data: { subject: string; description?: string; priority?: TicketPriority }
  ) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, orgId },
      include: { ticket: true },
    });

    if (!conversation) throw ApiError.notFound('Conversation not found');
    if (conversation.ticket) throw ApiError.conflict('A ticket already exists for this conversation');

    const ticket = await prisma.ticket.create({
      data: {
        orgId,
        conversationId,
        subject: data.subject,
        description: data.description,
        priority: data.priority ?? 'MEDIUM',
      },
    });

    await notificationQueue.add(Events.TICKET_CREATED, {
      ticketId: ticket.id,
      orgId,
      conversationId,
    });

    logger.info(`Ticket ${ticket.id} created from conversation ${conversationId}`);
    return ticket;
  }

  /**
   * إنشاء تذكرة مستقلة (غير مرتبطة بمحادثة).
   */
  async createStandalone(
    orgId: string,
    data: { subject: string; description?: string; priority?: TicketPriority }
  ) {
    const ticket = await prisma.ticket.create({
      data: {
        orgId,
        subject: data.subject,
        description: data.description,
        priority: data.priority ?? 'MEDIUM',
      },
    });

    await notificationQueue.add(Events.TICKET_CREATED, {
      ticketId: ticket.id,
      orgId,
    });

    logger.info(`Standalone ticket ${ticket.id} created`);
    return ticket;
  }

  /**
   * جلب تذكرة مع المحادثة المرتبطة (إن وجدت).
   */
  async getById(orgId: string, ticketId: string) {
    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, orgId },
      include: {
        conversation: {
          include: { customer: { select: { id: true, name: true } } },
        },
        assignee: { select: { id: true, name: true } },
      },
    });

    if (!ticket) throw ApiError.notFound('Ticket not found');
    return ticket;
  }

  /**
   * قائمة التذاكر مع فلترة وترقيم.
   */
  async list(
    orgId: string,
    filters: {
      status?: TicketStatus;
      priority?: TicketPriority;
      assignedTo?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: any = { orgId };
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assignedTo) where.assignedTo = filters.assignedTo;

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          conversation: {
            select: { id: true, customer: { select: { id: true, name: true } } },
          },
          assignee: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.ticket.count({ where }),
    ]);

    return { tickets, pagination: { page, limit, total } };
  }

  /**
   * تحديث تذكرة (حالة، أولوية، تعيين).
   */
  async update(
    orgId: string,
    ticketId: string,
    data: { status?: TicketStatus; priority?: TicketPriority; assignedTo?: string | null },
    userId: string,
    userRole: string
  ) {
    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, orgId },
    });

    if (!ticket) throw ApiError.notFound('Ticket not found');

    if (userRole === 'AGENT') {
      if (ticket.assignedTo !== userId) {
        throw ApiError.forbidden('You can only update tickets assigned to you');
      }
      if (data.priority || data.assignedTo !== undefined) {
        throw ApiError.forbidden('Only admins can change priority or assignment');
      }
    }

    if (data.assignedTo) {
      const agent = await prisma.user.findFirst({
        where: { id: data.assignedTo, orgId },
      });
      if (!agent) throw ApiError.badRequest('Assigned agent not found');
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        ...data,
        ...(data.status === 'CLOSED' && { updatedAt: new Date() }),
      },
    });

    await notificationQueue.add(Events.CONVERSATION_UPDATED, {
      ticketId: updated.id,
      orgId,
      changes: data,
    });

    logger.info(`Ticket ${ticketId} updated by ${userId}`);
    return updated;
  }

  /**
   * تصعيد تلقائي: تحويل المحادثات المفتوحة لأكثر من 24 ساعة إلى تذاكر.
   * يستخدم createMany لتجنب مشكلة N+1 Query.
   */
  async autoEscalate() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const staleConversations = await prisma.conversation.findMany({
      where: {
        status: { in: ['OPEN', 'WAITING'] },
        updatedAt: { lt: cutoff },
        ticket: null,
        assignedTo: null,
      },
      select: { id: true, orgId: true, customerId: true, channel: true },
    });

    if (staleConversations.length === 0) {
      return { escalated: 0, total: 0 };
    }

    const result = await prisma.ticket.createMany({
     data: staleConversations.map((conv) => ({
     orgId: conv.orgId,
     customerId: conv.customerId,
     conversationId: conv.id ?? null,
     subject: 'Auto-escalated: Conversation inactive for >24h',
     description: `Automatically escalated due to inactivity. Original channel: ${conv.channel}. Customer: ${conv.customerId}`,
     priority: 'MEDIUM' as const,
     status: 'OPEN' as const,
  })),
  skipDuplicates: true,
});

    logger.info(
      `Auto-escalation complete: ${result.count} tickets created from ${staleConversations.length} stale conversations`
    );
    return { escalated: result.count, total: staleConversations.length };
  }
}

export const ticketService = new TicketService();