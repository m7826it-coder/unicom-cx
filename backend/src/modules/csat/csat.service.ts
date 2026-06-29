// src/modules/csat/csat.service.ts
import prisma from '@/config/database.js';
import { ApiError } from '@/common/utils/ApiError.js';
import { logger } from '@/common/utils/logger.js';
import { notificationQueue } from '@/common/queues/index.js';
import { Events } from '@/common/events/events.js';

export class CSATService {
  /**
   * إنشاء استبيان رضا جديد عند إغلاق محادثة.
   */
  async generateSurvey(
    orgId: string,
    conversationId: string,
    customerId: string,
    channel: string
  ) {
    const existing = await prisma.satisfactionSurvey.findUnique({
      where: { conversationId },
    });
    if (existing) throw ApiError.conflict('A survey already exists for this conversation');

    const survey = await prisma.satisfactionSurvey.create({
      data: { orgId, conversationId, status: 'PENDING' },
    });

    await notificationQueue.add(Events.SURVEY_GENERATED, {
      surveyId: survey.id,
      orgId,
      conversationId,
      customerId,
      channel,
    });

    logger.info(
      `[DEV] CSAT survey generated for conversation ${conversationId}. In production, a survey link would be sent to customer ${customerId} via ${channel}`
    );

    return survey;
  }

  /**
   * معالجة رد العميل على الاستبيان.
   */
  async processResponse(
    orgId: string,
    conversationId: string,
    rating: number,
    feedback?: string
  ) {
    if (rating < 1 || rating > 5) throw ApiError.badRequest('Rating must be between 1 and 5');

    const survey = await prisma.satisfactionSurvey.findFirst({
      where: { conversationId, orgId },
    });
    if (!survey) throw ApiError.notFound('Survey not found for this conversation');
    if (survey.status === 'COMPLETED' || survey.status === 'EXPIRED') {
      throw ApiError.conflict('Survey already completed or expired');
    }

    const updatedSurvey = await prisma.satisfactionSurvey.update({
      where: { id: survey.id },
      data: {
        rating,
        feedback: feedback || null,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    await this.updateCustomerSatisfactionScore(orgId, conversationId);

    await notificationQueue.add(Events.CONVERSATION_UPDATED, {
      conversationId,
      orgId,
      changes: { surveyCompleted: true, rating },
    });

    logger.info(`CSAT survey completed for conversation ${conversationId}, rating: ${rating}`);
    return updatedSurvey;
  }

  /**
   * جلب استبيان محادثة محددة.
   */
  async getByConversation(orgId: string, conversationId: string) {
    const survey = await prisma.satisfactionSurvey.findFirst({
      where: { conversationId, orgId },
    });
    if (!survey) throw ApiError.notFound('Survey not found');
    return survey;
  }

  /**
   * قائمة الاستبيانات مع فلترة وترقيم.
   */
  async list(
    orgId: string,
    filters: { status?: string; page?: number; limit?: number }
  ) {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: any = { orgId };
    if (filters.status) where.status = filters.status;

    const [surveys, total] = await Promise.all([
      prisma.satisfactionSurvey.findMany({
        where,
        include: {
          conversation: {
            select: {
              id: true,
              customer: { select: { id: true, name: true } },
              channel: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.satisfactionSurvey.count({ where }),
    ]);

    return { surveys, pagination: { page, limit, total } };
  }

  /**
   * تحديث متوسط درجة رضا العميل.
   */
  private async updateCustomerSatisfactionScore(orgId: string, conversationId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, orgId },
      select: { customerId: true },
    });
    if (!conversation) return;

    const result = await prisma.satisfactionSurvey.aggregate({
      _avg: { rating: true },
      where: {
        orgId,
        status: 'COMPLETED',
        conversation: { customerId: conversation.customerId },
      },
    });

    if (result._avg.rating !== null) {
      await prisma.customer.update({
        where: { id: conversation.customerId },
        data: { satisfactionScore: result._avg.rating },
      });
    }
  }
}

export const csatService = new CSATService();