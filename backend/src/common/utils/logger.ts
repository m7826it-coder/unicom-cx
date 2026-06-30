// src/common/utils/logger.ts

import pino from 'pino';
import { env } from '@/config/env.js';

const isProduction =
  env.NODE_ENV === 'production' ||
  env.NODE_ENV === 'staging';

const pinoLogger = pino({
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
    paths: [
      'req.headers.cookie',
      'req.headers.authorization',
    ],
    censor: '[REDACTED]',
  },
});

export const logger = {
  info: (...args: Parameters<typeof pinoLogger.info>) =>
    pinoLogger.info(...args),

  warn: (...args: Parameters<typeof pinoLogger.warn>) =>
    pinoLogger.warn(...args),

  debug: (...args: Parameters<typeof pinoLogger.debug>) =>
    pinoLogger.debug(...args),

  trace: (...args: Parameters<typeof pinoLogger.trace>) =>
    pinoLogger.trace(...args),

  fatal: (...args: Parameters<typeof pinoLogger.fatal>) =>
    pinoLogger.fatal(...args),

  // Overloads
  error(message: string, error: Error): void;
  error(obj: unknown, message?: string): void;

  error(arg1: unknown, arg2?: unknown): void {
    if (arg2 instanceof Error) {
      pinoLogger.error(
        { err: arg2 },
        String(arg1),
      );
      return;
    }

    if (typeof arg2 === 'string') {
      pinoLogger.error(arg1, arg2);
      return;
    }

    pinoLogger.error(arg1);
  },
};