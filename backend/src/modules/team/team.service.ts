// src/modules/team/team.service.ts
import prisma from '@/config/database.js';
import redis from '@/config/redis.js';
import { env } from '@/config/env.js';
import { ApiError } from '@/common/utils/ApiError.js';
import { logger } from '@/common/utils/logger.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class TeamService {
  /**
   * دعوة عضو جديد للفريق. ينشئ مستخدمًا معلقًا (بدون كلمة مرور) ويرسل رابط دعوة.
   */
  async invite(orgId: string, email: string, role: 'AGENT' | 'ADMIN', inviterId: string) {
    const inviter = await prisma.user.findUnique({ where: { id: inviterId } });
    if (!inviter || inviter.role !== 'ADMIN' || inviter.orgId !== orgId) {
      throw ApiError.forbidden('Only admins can invite team members');
    }

    const existingUser = await prisma.user.findFirst({
      where: { email, orgId },
    });
    if (existingUser) {
      throw ApiError.conflict('A user with this email already exists in your organization');
    }

    const user = await prisma.user.create({
      data: {
        orgId,
        email,
        name: email,
        role,
        passwordHash: '',
      },
    });

    const invitationToken = jwt.sign(
      { userId: user.id, orgId, email, role },
      env.JWT_SECRET,
      { expiresIn: '48h' }
    );

    logger.info(
      `[DEV] Invitation for ${email} to org ${orgId}: https://app.unicomcx.com/accept-invitation?token=${invitationToken}`
    );

    return {
      message: 'Invitation sent successfully',
      userId: user.id,
      invitationToken,
    };
  }

  /**
   * قبول الدعوة وتفعيل الحساب.
   */
  async acceptInvitation(token: string, name: string, password: string) {
    let decoded: { userId: string; orgId: string; email: string; role: string };
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as typeof decoded;
    } catch {
      throw ApiError.badRequest('Invalid or expired invitation token');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      throw ApiError.badRequest('Invalid invitation token');
    }

    if (user.passwordHash !== '') {
      throw ApiError.conflict('Account already activated');
    }

    if (password.length < 8) {
      throw ApiError.badRequest('Password must be at least 8 characters');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { name, passwordHash },
    });

    logger.info(`User ${user.id} activated via invitation`);

    return { message: 'Account activated successfully' };
  }

  /**
   * جلب قائمة أعضاء المنظمة (بدون كلمات المرور).
   */
  async getMembers(orgId: string) {
    const members = await prisma.user.findMany({
      where: { orgId },
      select: {
        id: true,
        orgId: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return members;
  }

  /**
   * إزالة عضو من الفريق (للمدراء فقط، ولا يمكن حذف النفس).
   * يضيف معرف المستخدم إلى القائمة السوداء في Redis لإبطال جميع جلساته النشطة.
   */
  async removeMember(orgId: string, userId: string, requesterId: string) {
    if (userId === requesterId) {
      throw ApiError.badRequest('Cannot remove yourself');
    }

    const requester = await prisma.user.findUnique({ where: { id: requesterId } });
    if (!requester || requester.role !== 'ADMIN' || requester.orgId !== orgId) {
      throw ApiError.forbidden('Only admins can remove members');
    }

    const userToRemove = await prisma.user.findUnique({ where: { id: userId } });
    if (!userToRemove || userToRemove.orgId !== orgId) {
      throw ApiError.notFound('User not found');
    }

    await prisma.user.delete({ where: { id: userId } });

    // إضافة userId إلى القائمة السوداء لإبطال جميع جلساته النشطة
    await redis.setex(`blacklist:user:${userId}`, 24 * 60 * 60, '1');

    logger.info(`User ${userId} removed from org ${orgId} by ${requesterId}. All sessions revoked.`);

    return { message: 'Member removed and all sessions revoked successfully' };
  }
}

export const teamService = new TeamService();