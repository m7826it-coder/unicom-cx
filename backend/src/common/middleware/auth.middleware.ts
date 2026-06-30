// src/common/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env.js';
import { ApiError } from '@/common/utils/ApiError.js';
import { logger } from '@/common/utils/logger.js';
import redis from '@/config/redis.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        orgId: string;
        role: 'ADMIN' | 'AGENT';
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  orgId: string;
  role: 'ADMIN' | 'AGENT';
}

/**
 * وسيط المصادقة. يتحقق من وجود JWT صالح في كوكيز `token`
 * ويرفق معلومات المستخدم والمنظمة في `req.user`.
 * يتحقق أيضًا من أن المستخدم ليس في القائمة السوداء (Token Revocation).
 */
export async function authMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      throw ApiError.unauthorized('No token provided');
    }

    const tokenCookie = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('token='));

    if (!tokenCookie) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = tokenCookie.substring('token='.length);
    if (!token) {
      throw ApiError.unauthorized('No token provided');
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (jwtError) {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    const isRevoked = await redis.get(`blacklist:user:${decoded.userId}`);
    if (isRevoked) {
      logger.warn(`Blocked access attempt by revoked user ${decoded.userId}`);
      throw ApiError.unauthorized('Token has been revoked');
    }

    req.user = {
      id: decoded.userId,
      orgId: decoded.orgId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      logger.error('Unexpected auth middleware error', error);
      next(ApiError.internal('Authentication failed'));
    }
  }
}