// src/common/middleware/rateLimiter.middleware.ts
import rateLimit from 'express-rate-limit';

/**
 * منشئ Rate Limiter للمسارات الحساسة (تسجيل الدخول، التسجيل).
 * يسمح بـ 5 محاولات فقط كل 15 دقيقة لكل IP.
 */
export function createAuthLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
      success: false,
      error: {
        type: 'https://api.unicomcx.com/errors/rate-limit',
        title: 'Too Many Requests',
        status: 429,
        detail: 'Too many login attempts. Please try again in 15 minutes.',
      },
    },
    skipSuccessfulRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip ?? 'unknown',
  });
}

/**
 * منشئ Rate Limiter عام لجميع المسارات.
 * يسمح بـ 100 طلب في الدقيقة لكل IP.
 */
export function createGeneralLimiter() {
  return rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip ?? 'unknown',
  });
}