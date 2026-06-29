// src/common/middleware/idempotency.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import redis from '@/config/redis.js';
import { logger } from '@/common/utils/logger.js';

const IDEMPOTENCY_PREFIX = 'idempotency:';
const TTL_SECONDS = 24 * 60 * 60;

/**
 * وسيط Idempotency. يمنع تكرار العمليات باستخدام Idempotency-Key.
 * إذا كان المفتاح موجودًا ومستخدَمًا سابقًا، يُعيد الاستجابة المخزنة.
 * إذا لم يكن موجودًا، يخزن الاستجابة عند النجاح.
 */
export function idempotencyMiddleware(req: Request, res: Response, next: NextFunction): void {
  const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

  if (!idempotencyKey) {
    return next();
  }

  const redisKey = `${IDEMPOTENCY_PREFIX}${idempotencyKey}`;

  redis.get(redisKey)
    .then((cached) => {
      if (cached) {
        try {
          const cachedResponse = JSON.parse(cached) as { status: number; body: any };
          logger.info(`Idempotency key reused: ${idempotencyKey}`);
          return res.status(cachedResponse.status).json(cachedResponse.body);
        } catch (parseError) {
          logger.error(`Failed to parse cached idempotency response for key ${idempotencyKey}`, parseError);
          return processRequest();
        }
      } else {
        return processRequest();
      }
    })
    .catch((err) => {
      logger.error(`Redis error while checking idempotency key ${idempotencyKey}`, err);
      return processRequest();
    });

  function processRequest(): void {
    const originalJson = res.json.bind(res);
    res.json = function (body: any): Response<any, Record<string, any>> {
      res.locals._idempotencyBody = body;
      return originalJson(body);
    };

    next();

    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const bodyToStore = res.locals._idempotencyBody || { success: true };
        const value = JSON.stringify({ status: res.statusCode, body: bodyToStore });
        redis.setex(redisKey, TTL_SECONDS, value).catch((err) =>
          logger.error(`Failed to store idempotency key ${idempotencyKey}`, err)
        );
      }
    });
  }
}