// src/modules/inbox/services/customer.service.ts
import prisma from '@/config/database.js';
import { ApiError } from '@/common/utils/ApiError.js';
import { logger } from '@/common/utils/logger.js';
import type { ChannelType, Prisma } from '@prisma/client';

export class CustomerService {
  /**
   * البحث عن عميل موجود أو إنشاء واحد جديد بناءً على معرف القناة.
   */
  async getOrCreate(orgId: string, channelType: ChannelType, identifier: string) {
    const whereClause = this.buildChannelWhere(orgId, channelType, identifier);
    const existingCustomer = await prisma.customer.findFirst({ where: whereClause });

    if (existingCustomer) {
      await prisma.customer.update({
        where: { id: existingCustomer.id },
        data: { lastSeen: new Date(), totalConversations: { increment: 1 } },
      });
      return existingCustomer;
    }

    const createData: Prisma.CustomerUncheckedCreateInput = {
      orgId,
      name: `عميل ${channelType}`,
    };
    this.setChannelField(createData, channelType, identifier);

    const newCustomer = await prisma.customer.create({
      data: {
        ...createData,
        totalConversations: 1,
        firstSeen: new Date(),
        lastSeen: new Date(),
      },
    });

    logger.info(`New customer created: ${newCustomer.id} via ${channelType}`);
    return newCustomer;
  }

  /**
   * جلب ملف عميل كامل مع الوسوم والملاحظات وآخر المحادثات.
   */
  async getById(orgId: string, customerId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, orgId },
      include: {
        tags: true,
        notes: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } },
        conversations: { take: 10, orderBy: { updatedAt: 'desc' }, select: { id: true, channel: true, status: true, classification: true, lastMessageAt: true, createdAt: true } },
      },
    });
    if (!customer) throw ApiError.notFound('Customer not found');
    return customer;
  }

  /**
   * تحديث بيانات العميل الأساسية.
   */
  async update(orgId: string, customerId: string, data: { name?: string; phone?: string; email?: string; avatar?: string }) {
    const customer = await prisma.customer.findFirst({ where: { id: customerId, orgId } });
    if (!customer) throw ApiError.notFound('Customer not found');
    const updated = await prisma.customer.update({ where: { id: customerId }, data });
    logger.info(`Customer ${customerId} updated by org ${orgId}`);
    return updated;
  }

  /**
   * إضافة وسم للعميل (يمنع التكرار).
   */
  async addTag(orgId: string, customerId: string, tag: string) {
    const customer = await prisma.customer.findFirst({ where: { id: customerId, orgId } });
    if (!customer) throw ApiError.notFound('Customer not found');
    const existing = await prisma.customerTag.findFirst({ where: { customerId, tag } });
    if (existing) throw ApiError.conflict('Tag already exists');
    const newTag = await prisma.customerTag.create({ data: { customerId, tag } });
    logger.info(`Tag "${tag}" added to customer ${customerId}`);
    return newTag;
  }

  /**
   * إزالة وسم من العميل.
   */
  async removeTag(orgId: string, customerId: string, tag: string) {
    const customer = await prisma.customer.findFirst({ where: { id: customerId, orgId } });
    if (!customer) throw ApiError.notFound('Customer not found');
    const deleted = await prisma.customerTag.deleteMany({ where: { customerId, tag } });
    if (deleted.count === 0) throw ApiError.notFound('Tag not found');
    logger.info(`Tag "${tag}" removed from customer ${customerId}`);
    return { message: 'Tag removed' };
  }

  /**
   * إضافة ملاحظة داخلية على العميل.
   */
  async addNote(orgId: string, customerId: string, content: string, createdBy: string) {
    const customer = await prisma.customer.findFirst({ where: { id: customerId, orgId } });
    if (!customer) throw ApiError.notFound('Customer not found');
    const note = await prisma.customerNote.create({
      data: { customerId, content, createdBy },
      include: { author: { select: { id: true, name: true } } },
    });
    logger.info(`Note added to customer ${customerId} by user ${createdBy}`);
    return note;
  }

  /**
   * دمج عميلين: ينقل جميع البيانات إلى العميل المستهدف ثم يحذف المصدر.
   */
  async merge(orgId: string, sourceId: string, targetId: string) {
    if (sourceId === targetId) throw ApiError.badRequest('Cannot merge a customer with itself');
    const [source, target] = await Promise.all([
      prisma.customer.findFirst({ where: { id: sourceId, orgId } }),
      prisma.customer.findFirst({ where: { id: targetId, orgId } }),
    ]);
    if (!source || !target) throw ApiError.notFound('One of the customers not found');

    await prisma.$transaction(async (tx) => {
      await tx.conversation.updateMany({ where: { customerId: sourceId }, data: { customerId: targetId } });
      await tx.message.updateMany({ where: { customerId: sourceId }, data: { customerId: targetId } });
      await tx.ticket.updateMany({ where: { customerId: sourceId }, data: { customerId: targetId } });
      await tx.customerTag.updateMany({ where: { customerId: sourceId }, data: { customerId: targetId } });
      await tx.customerNote.updateMany({ where: { customerId: sourceId }, data: { customerId: targetId } });

      const sourceStats = await tx.customer.findUnique({ where: { id: sourceId }, select: { totalConversations: true, satisfactionScore: true } });
      const targetStats = await tx.customer.findUnique({ where: { id: targetId }, select: { totalConversations: true, satisfactionScore: true } });
      const newTotal = (targetStats!.totalConversations ?? 0) + (sourceStats!.totalConversations ?? 0);
      const newScore = this.combineScores(targetStats!.satisfactionScore, sourceStats!.satisfactionScore);
      await tx.customer.update({ where: { id: targetId }, data: { totalConversations: newTotal, satisfactionScore: newScore } });
      await tx.customer.delete({ where: { id: sourceId } });
    });

    logger.info(`Customer ${sourceId} merged into ${targetId} in org ${orgId}`);
    return { message: 'Customers merged successfully' };
  }

  private buildChannelWhere(orgId: string, channelType: ChannelType, identifier: string): Prisma.CustomerWhereInput {
    const base: Prisma.CustomerWhereInput = { orgId };
    switch (channelType) {
      case 'WHATSAPP': return { ...base, whatsappPhone: identifier };
      case 'INSTAGRAM': return { ...base, instagramId: identifier };
      case 'TELEGRAM': return { ...base, telegramId: identifier };
      case 'EMAIL': return { ...base, email: identifier };
    }
  }

  private setChannelField(data: Prisma.CustomerUncheckedCreateInput, channelType: ChannelType, identifier: string): void {
    switch (channelType) {
      case 'WHATSAPP': data.whatsappPhone = identifier; break;
      case 'INSTAGRAM': data.instagramId = identifier; break;
      case 'TELEGRAM': data.telegramId = identifier; break;
      case 'EMAIL': data.email = identifier; break;
    }
  }

  private combineScores(scoreA: number | null, scoreB: number | null): number | null {
    if (scoreA === null && scoreB === null) return null;
    if (scoreA === null) return scoreB;
    if (scoreB === null) return scoreA;
    return (scoreA + scoreB) / 2;
  }
}

export const customerService = new CustomerService();