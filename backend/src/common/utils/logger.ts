// src/common/utils/logger.ts

import pino from 'pino';
import { env } from '@/config/env.js';

const isProduction = env.NODE_ENV === 'production' || env.NODE_ENV === 'staging';

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

type InfoMethod = (...args: Parameters<typeof pinoLogger.info>) => void;
type WarnMethod = (...args: Parameters<typeof pinoLogger.warn>) => void;
type DebugMethod = (...args: Parameters<typeof pinoLogger.debug>) => void;
type TraceMethod = (...args: Parameters<typeof pinoLogger.trace>) => void;
type FatalMethod = (...args: Parameters<typeof pinoLogger.fatal>) => void;

type ErrorMethod = {
  (message: string, error: Error): void;
  (obj: unknown, message?: string): void;
};

const info: InfoMethod = (...args) => {
  pinoLogger.info(...args);
};

const warn: WarnMethod = (...args) => {
  pinoLogger.warn(...args);
};

const debug: DebugMethod = (...args) => {
  pinoLogger.debug(...args);
};

const trace: TraceMethod = (...args) => {
  pinoLogger.trace(...args);
};

const fatal: FatalMethod = (...args) => {
  pinoLogger.fatal(...args);
};

const error = ((arg1: unknown, arg2?: unknown): void => {
  if (arg2 instanceof Error) {
    pinoLogger.error({ err: arg2 }, String(arg1));
    return;
  }

  if (typeof arg2 === 'string') {
    pinoLogger.error(arg1 as never, arg2);
    return;
  }

  if (arg1 instanceof Error) {
    pinoLogger.error({ err: arg1 });
    return;
  }

  pinoLogger.error(arg1 as never);
}) as ErrorMethod;

export const logger = {
  info,
  warn,
  debug,
  trace,
  fatal,
  error,
};