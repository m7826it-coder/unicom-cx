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
    paths: ['req.headers.cookie', 'req.headers.authorization'],
    censor: '[REDACTED]',
  },
});

type LoggerFacade = {
  info: typeof pinoLogger.info;
  warn: typeof pinoLogger.warn;
  debug: typeof pinoLogger.debug;
  trace: typeof pinoLogger.trace;
  fatal: typeof pinoLogger.fatal;
  error: {
    (message: string, error: Error): void;
    (obj: unknown, message?: string): void;
  };
};

const error: LoggerFacade['error'] = ((arg1: unknown, arg2?: unknown): void => {
  if (arg2 instanceof Error) {
    pinoLogger.error({ err: arg2 }, String(arg1));
    return;
  }

  if (typeof arg2 === 'string') {
    pinoLogger.error(arg1, arg2);
    return;
  }

  if (arg1 instanceof Error) {
    pinoLogger.error({ err: arg1 });
    return;
  }

  pinoLogger.error(arg1);
}) as LoggerFacade['error'];

export const logger: LoggerFacade = {
  info: (...args) => pinoLogger.info(...args),
  warn: (...args) => pinoLogger.warn(...args),
  debug: (...args) => pinoLogger.debug(...args),
  trace: (...args) => pinoLogger.trace(...args),
  fatal: (...args) => pinoLogger.fatal(...args),
  error,
};