// src/modules/auth/auth.validators.ts
import { body } from 'express-validator';

/**
 * قواعد التحقق من صحة بيانات التسجيل.
 */
export const registerRules = [
  body('organizationName')
    .notEmpty()
    .withMessage('Organization name is required')
    .trim(),
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('passwordConfirmation')
    .custom((value: string, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  body('acceptTerms')
    .isBoolean()
    .withMessage('You must accept the terms')
    .custom((value: boolean) => value === true)
    .withMessage('You must accept the terms'),
];

/**
 * قواعد التحقق من صحة بيانات تسجيل الدخول.
 */
export const loginRules = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * قواعد التحقق من صحة طلب استعادة كلمة المرور.
 */
export const forgotPasswordRules = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
];

/**
 * قواعد التحقق من صحة إعادة تعيين كلمة المرور.
 */
export const resetPasswordRules = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('passwordConfirmation')
    .custom((value: string, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];