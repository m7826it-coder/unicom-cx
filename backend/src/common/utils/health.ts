// src/common/utils/health.ts
import prisma from '../../config/database.js';
import redis from '../../config/redis.js';
import { logger } from '../../common/utils/logger.js';

/**
 * فحص اتصال قاعدة البيانات.
 */
export async function checkDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed', error);
    return false;
  }
}

/**
 * فحص اتصال Redis.
 */
export async function checkRedis(): Promise<boolean> {
  try {
    const result = await redis.ping();
    return result === 'PONG';
  } catch (error) {
    logger.error('Redis health check failed', error);
    return false;
  }
}

/**
 * فحص صحة جميع التبعيات.
 */
export async function getHealthStatus(): Promise<{ database: boolean; redis: boolean }> {
  const [database, redisStatus] = await Promise.all([
    checkDatabase(),
    checkRedis(),
  ]);
  return { database, redis: redisStatus };
}