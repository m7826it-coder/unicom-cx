// src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authMiddleware } from '../../common/middleware/auth.middleware.js';
import {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} from './auth.validators.js';
import { createAuthLimiter, createGeneralLimiter } from '../../common/middleware/rateLimiter.middleware.js';

const router = Router();

// تطبيق Rate Limiter العام على جميع مسارات المصادقة
router.use(createGeneralLimiter());

// POST /register – تسجيل منظمة جديدة (Rate Limit 5/15min)
router.post(
  '/register',
  createAuthLimiter(),
  registerRules,
  authController.register.bind(authController)
);

// POST /login – تسجيل دخول (Rate Limit 5/15min)
router.post(
  '/login',
  createAuthLimiter(),
  loginRules,
  authController.login.bind(authController)
);

// GET /me – جلب بيانات المستخدم الحالي (تتطلب مصادقة)
router.get('/me', authMiddleware, authController.getMe.bind(authController));

// POST /logout – تسجيل الخروج (تتطلب مصادقة)
router.post('/logout', authMiddleware, authController.logout.bind(authController));

// POST /forgot-password – طلب إعادة تعيين كلمة المرور
router.post(
  '/forgot-password',
  forgotPasswordRules,
  authController.forgotPassword.bind(authController)
);

// POST /reset-password – تأكيد إعادة تعيين كلمة المرور
router.post(
  '/reset-password',
  resetPasswordRules,
  authController.resetPassword.bind(authController)
);

export default router;