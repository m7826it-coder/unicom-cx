// src/modules/team/team.routes.ts
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { teamService } from './team.service.js';
import { authMiddleware } from '@/common/middleware/auth.middleware.js';
import { requireRole } from '@/common/middleware/role.middleware.js';
import { success, created } from '@/common/utils/responseHelper.js';
import { body } from 'express-validator';

const router = Router();

/**
 * دعوة عضو جديد للفريق.
 */
async function invite(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, role } = req.body;
    const result = await teamService.invite(req.user!.orgId, email, role, req.user!.id);
    created(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * قبول دعوة وتفعيل الحساب.
 */
async function acceptInvitation(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, name, password } = req.body;
    const result = await teamService.acceptInvitation(token, name, password);
    success(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * جلب قائمة أعضاء الفريق.
 */
async function getMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const members = await teamService.getMembers(req.user!.orgId);
    success(res, members);
  } catch (err) {
    next(err);
  }
}

/**
 * إزالة عضو من الفريق.
 */
async function removeMember(req: Request, res: Response, next: NextFunction) {
  try {
    await teamService.removeMember(req.user!.orgId, req.params.userId, req.user!.id);
    success(res, { message: 'Member removed successfully' });
  } catch (err) {
    next(err);
  }
}

const inviteRules = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('role').isIn(['AGENT', 'ADMIN']).withMessage('Role must be AGENT or ADMIN'),
];

const acceptInvitationRules = [
  body('token').notEmpty().withMessage('Token is required'),
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

// POST /invite – دعوة عضو جديد (ADMIN فقط)
router.post('/invite', authMiddleware, requireRole('ADMIN'), inviteRules, invite);

// POST /accept-invitation – قبول دعوة (عام بدون مصادقة)
router.post('/accept-invitation', acceptInvitationRules, acceptInvitation);

// GET /members – جلب قائمة الأعضاء
router.get('/members', authMiddleware, getMembers);

// DELETE /members/:userId – إزالة عضو (ADMIN فقط)
router.delete('/members/:userId', authMiddleware, requireRole('ADMIN'), removeMember);

export default router;