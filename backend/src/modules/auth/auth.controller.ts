// src/modules/auth/auth.controller.ts
import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { success, created } from '../../common/utils/responseHelper.js';
import { env } from '../../config/env.js';

export class AuthController {
  /**
   * تسجيل منظمة جديدة.
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      created(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * تسجيل الدخول وتعيين كوكيز JWT.
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);

      res.cookie('token', result.token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
      });

      success(res, {
        user: result.user,
        organization: result.organization,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * جلب بيانات المستخدم الحالي.
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.getMe(req.user!.id);
      success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * طلب استعادة كلمة المرور.
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.forgotPassword(req.body.email);
      success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * تأكيد استعادة كلمة المرور.
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.password);
      success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * تسجيل الخروج: يمسح كوكيز token.
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.cookie('token', '', {
        httpOnly: true,
        sameSite: 'strict',
        secure: env.NODE_ENV === 'production',
        maxAge: 0,
        path: '/',
      });

      success(res, { message: 'تم تسجيل الخروج بنجاح' });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();