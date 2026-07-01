// src/common/middleware/errorHandler.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../common/utils/ApiError.js';
import { logger } from '../../common/utils/logger.js';
import { env } from '../../config/env.js';

interface ValidationError {
  msg: string;
  param: string;
  location?: string;
}

function isExpressValidatorError(err: unknown): err is { array: () => ValidationError[] } {
  return typeof err === 'object' && err !== null && 'array' in err && typeof (err as any).array === 'function';
}

/**
 * وسيط معالجة الأخطاء العام (4 parameters).
 * يحول جميع الأخطاء إلى استجابات RFC 7807.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  let apiError: ApiError;

  if (err instanceof ApiError) {
    apiError = err;
  } else if (isExpressValidatorError(err)) {
    const validationErrors = err.array().map((e) => ({
      field: e.param,
      message: e.msg,
    }));
    apiError = ApiError.validation(validationErrors);
  } else {
    const message = err instanceof Error ? err.message : 'Internal server error';
    apiError = ApiError.internal(message);
  }

  if (apiError.statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} - ${apiError.statusCode}`, {
      error: err instanceof Error ? err.stack : String(err),
      user: req.user?.id,
    });
  } else {
    logger.warn(`[${req.method}] ${req.path} - ${apiError.statusCode} ${apiError.detail}`);
  }

  const responseBody = apiError.toJSON();

  if (env.NODE_ENV === 'development' && err instanceof Error && err.stack) {
    (responseBody as any).stack = err.stack;
  }

  res.status(apiError.statusCode).json(responseBody);
}