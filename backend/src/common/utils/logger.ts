// src/common/utils/logger.ts
import pino from 'pino';

// استخدم process.env مباشرة بدلاً من استيراد env لتجنب الدوران
const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';

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

// تصدير نفس الواجهة التي تعتمد عليها جميع الملفات
export const logger = {
  info: (...args: unknown[]) => pinoLogger.info(...args),
  warn: (...args: unknown[]) => pinoLogger.warn(...args),
  error: (...args: unknown[]) => pinoLogger.error(...args),
  debug: (...args: unknown[]) => pinoLogger.debug(...args),
  trace: (...args: unknown[]) => pinoLogger.trace(...args),
  fatal: (...args: unknown[]) => pinoLogger.fatal(...args),
};
