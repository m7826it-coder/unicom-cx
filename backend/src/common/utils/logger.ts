// src/common/utils/logger.ts
import pino from 'pino';

const isProduction =
  process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';

const pinoLogger = pino({
  level: isProduction ? 'info' : 'debug',
  ...(process.env.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
  redact: {
    paths: ['req.headers.cookie', 'req.headers.authorization'],
    censor: '[REDACTED]',
  },
});

type LogMethod = (...args: unknown[]) => void;

type ErrorMethod = {
  (message: string, error: Error): void;
  (message: string, error: unknown): void;
  (obj: unknown, message?: string): void;
  (error: Error): void;
  (error: unknown): void;
};

const callLogger = (method: (...args: any[]) => void, args: unknown[]) => {
  method.apply(pinoLogger, args as any[]);
};

const info: LogMethod = (...args) => {
  callLogger(pinoLogger.info.bind(pinoLogger), args);
};

const warn: LogMethod = (...args) => {
  callLogger(pinoLogger.warn.bind(pinoLogger), args);
};

const debug: LogMethod = (...args) => {
  callLogger(pinoLogger.debug.bind(pinoLogger), args);
};

const trace: LogMethod = (...args) => {
  callLogger(pinoLogger.trace.bind(pinoLogger), args);
};

const fatal: LogMethod = (...args) => {
  callLogger(pinoLogger.fatal.bind(pinoLogger), args);
};

const error = ((arg1: unknown, arg2?: unknown): void => {
  if (arg1 instanceof Error) {
    pinoLogger.error({ err: arg1 }, arg1.message);
    return;
  }

  if (arg2 instanceof Error) {
    pinoLogger.error({ err: arg2 }, String(arg1));
    return;
  }

  if (typeof arg2 === 'string') {
    if (typeof arg1 === 'object' && arg1 !== null) {
      pinoLogger.error(arg1 as Record<string, unknown>, arg2);
      return;
    }
    pinoLogger.error({ value: arg1 }, arg2);
    return;
  }

  if (typeof arg1 === 'object' && arg1 !== null) {
    pinoLogger.error(arg1 as Record<string, unknown>);
    return;
  }

  pinoLogger.error({ value: arg1 });
}) as ErrorMethod;

export const logger = {
  info,
  warn,
  debug,
  trace,
  fatal,
  error,
};
