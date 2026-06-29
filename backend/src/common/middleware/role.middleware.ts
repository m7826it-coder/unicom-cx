// src/common/middleware/role.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/common/utils/ApiError.js';
import { logger } from '@/common/utils/logger.js';

/**
 * وسيط الصلاحيات. يتحقق من أن المستخدم يملك أحد الأدوار المطلوبة.
 * يجب أن يسبقه `authMiddleware` لضمان وجود `req.user`.
 *
 * @param roles الأدوار المسموح بها (مثلاً 'ADMIN', 'AGENT').
 * @returns وسيط Express
 *
 * @example
 * router.post('/invite', authMiddleware, requireRole('ADMIN'), handler);
 */
export function requireRole(...roles: ('ADMIN' | 'AGENT')[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      if (!roles.includes(req.user.role)) {
        logger.warn(
          `Access denied for user ${req.user.id} with role ${req.user.role}. Required roles: ${roles.join(', ')}`
        );
        throw ApiError.forbidden('Insufficient permissions');
      }

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        logger.error('Unexpected role middleware error', error);
        next(ApiError.internal('Authorization check failed'));
      }
    }
  };
}