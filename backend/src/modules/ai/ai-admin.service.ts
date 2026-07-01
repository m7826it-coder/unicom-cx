// src/modules/ai/ai-admin.service.ts
import prisma from '../../config/database.js';
import { ApiError } from '../../common/utils/ApiError.js';
import { logger } from '../../common/utils/logger.js';
import type { KnowledgeBaseEntry } from '@prisma/client';

export interface BotSettings {
  enabled: boolean;
  channels: string[];
  confidenceThreshold: number;
  welcomeMessage: string;
  escalationMessage: string;
}

export class AIAdminService {
  async getBotSettings(orgId: string): Promise<BotSettings> {
    logger.info(`Fetching bot settings for org ${orgId}`);
    return { enabled: false, channels: [], confidenceThreshold: 0.8, welcomeMessage: '', escalationMessage: 'سيتم تحويلك إلى وكيل للمساعدة.' };
  }

  async updateBotSettings(orgId: string, data: BotSettings): Promise<BotSettings> {
    const validChannels = ['WHATSAPP', 'INSTAGRAM', 'TELEGRAM', 'EMAIL'];
    for (const ch of data.channels) { if (!validChannels.includes(ch)) throw ApiError.badRequest(`قناة غير صالحة: ${ch}`); }
    if (data.confidenceThreshold < 0 || data.confidenceThreshold > 1) throw ApiError.badRequest('حد الثقة يجب أن يكون بين 0 و 1');
    logger.info(`Bot settings updated for org ${orgId}`, data);
    return data;
  }

  async getKnowledgeBase(orgId: string): Promise<KnowledgeBaseEntry[]> {
    return prisma.knowledgeBaseEntry.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' } });
  }

  async addKnowledgeBaseEntry(orgId: string, data: { question: string; answer: string }): Promise<KnowledgeBaseEntry> {
    if (!data.question?.trim()) throw ApiError.badRequest('السؤال مطلوب');
    if (!data.answer?.trim()) throw ApiError.badRequest('الجواب مطلوب');
    const entry = await prisma.knowledgeBaseEntry.create({ data: { orgId, question: data.question.trim(), answer: data.answer.trim(), source: 'MANUAL' } });
    logger.info(`Knowledge base entry added: ${entry.id} for org ${orgId}`);
    return entry;
  }

  async deleteKnowledgeBaseEntry(orgId: string, id: string): Promise<void> {
    const entry = await prisma.knowledgeBaseEntry.findFirst({ where: { id, orgId } });
    if (!entry) throw ApiError.notFound('إدخال قاعدة المعرفة غير موجود');
    await prisma.knowledgeBaseEntry.delete({ where: { id } });
    logger.info(`Knowledge base entry deleted: ${id} from org ${orgId}`);
  }

  async toggleKnowledgeBaseEntry(orgId: string, id: string): Promise<KnowledgeBaseEntry> {
    const entry = await prisma.knowledgeBaseEntry.findFirst({ where: { id, orgId } });
    if (!entry) throw ApiError.notFound('إدخال قاعدة المعرفة غير موجود');
    const updated = await prisma.knowledgeBaseEntry.update({ where: { id }, data: { isActive: !entry.isActive } });
    logger.info(`Knowledge base entry toggled: ${id} isActive=${updated.isActive}`);
    return updated;
  }
}

export const aiAdminService = new AIAdminService();