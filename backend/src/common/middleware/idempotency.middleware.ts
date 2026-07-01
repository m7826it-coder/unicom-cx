// src/common/middleware/idempotency.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import redis from '../../config/redis.js';
import { logger } from '../../common/utils/logger.js';

const IDEMPOTENCY_PREFIX = 'idempotency:';
const TTL_SECONDS = 24 * 60 * 60;

type CachedResponse = {
  status: number;
  body: unknown;
};

export function idempotencyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

  if (!idempotencyKey) {
    return next();
  }

  const redisKey = `${IDEMPOTENCY_PREFIX}${idempotencyKey}`;

  redis
    .get(redisKey)
    .then((cached: string | null) => {
      if (cached) {
        try {
          const cachedResponse: CachedResponse = JSON.parse(cached);

          logger.info(`Idempotency key reused: ${idempotencyKey}`);

          return res
            .status(cachedResponse.status)
            .json(cachedResponse.body);
        } catch (parseError: unknown) {
          logger.error(
            `Failed to parse cached idempotency response for key ${idempotencyKey}`,
            parseError as Error
          );
          return processRequest();
        }
      }

      return processRequest();
    })
    .catch((err: unknown) => {
      logger.error(
        `Redis error while checking idempotency key ${idempotencyKey}`,
        err as Error
      );
      return processRequest();
    });

  function processRequest(): void {
    const originalJson = res.json.bind(res);

    res.json = function (body: unknown): Response {
      (res.locals as any)._idempotencyBody = body;
      return originalJson(body);
    };

    next();

    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const bodyToStore =
          (res.locals as any)._idempotencyBody || { success: true };

        const value = JSON.stringify({
          status: res.statusCode,
          body: bodyToStore,
        });

        redis
          .setex(redisKey, TTL_SECONDS, value)
          .catch((err: unknown) =>
            logger.error(
              `Failed to store idempotency key ${idempotencyKey}`,
              err as Error
            )
          );
      }
    });
  }
}