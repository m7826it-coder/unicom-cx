// src/common/utils/logger.ts
import pino from 'pino';
import { env } from '@/config/env.js';

const isProduction = env.NODE_ENV === 'production' || env.NODE_ENV === 'staging';

/**
 * خدمة تسجيل موحدة (Singleton) باستخدام Pino.
 * في بيئة التطوير، تستخدم pino-pretty لتنسيق ملون.
 * في الإنتاج، تخرج JSON منظم.
 */
export const logger = pino({
  level: isProduction ? 'info' : 'debug',
  ...(env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
  redact: {
    paths: ['req.headers.cookie', 'req.headers.authorization'],
    censor: '[REDACTED]',
  },
});