// src/modules/analytics/analytics.service.ts
import prisma from '../../config/database.js';
import { ApiError } from '../../common/utils/ApiError.js';
import { logger } from '../../common/utils/logger.js';

export interface DashboardData {
  stats: {
    totalConversationsToday: number;
    openConversations: number;
    closedConversationsToday: number;
    avgFirstResponseTimeMinutes: number;
  };
  channelDistribution: { channel: string; count: number; percentage: number }[];
  volumeOverTime: { date: string; count: number }[];
  agentPerformance: {
    agentId: string;
    agentName: string;
    conversationsHandled: number;
    avgResponseTimeMinutes: number;
    avgCSAT: number;
  }[];
}

export class AnalyticsService {
  /**
   * جلب نظرة عامة على أداء المنظمة للوحة التحكم.
   */
  async getOverview(orgId: string): Promise<DashboardData> {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const totalConversationsToday = await prisma.conversation.count({
        where: { orgId, createdAt: { gte: startOfToday } },
      });

      const openConversations = await prisma.conversation.count({
        where: { orgId, status: { in: ['OPEN', 'WAITING'] } },
      });

      const closedConversationsToday = await prisma.conversation.count({
        where: { orgId, status: 'CLOSED', updatedAt: { gte: startOfToday } },
      });

      // متوسط وقت الرد الأول – مبسط بصفر، يمكن تحسينه لاحقاً
      const avgFirstResponseTimeMinutes = 0;

      return {
        stats: {
          totalConversationsToday,
          openConversations,
          closedConversationsToday,
          avgFirstResponseTimeMinutes,
        },
        channelDistribution: [],
        volumeOverTime: [],
        agentPerformance: [],
      };
    } catch (error) {
      logger.error('Failed to get analytics overview', error);
      throw ApiError.internal('Failed to load analytics');
    }
  }
}

export const analyticsService = new AnalyticsService();