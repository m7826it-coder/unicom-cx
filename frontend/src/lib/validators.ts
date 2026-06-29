import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('بريد إلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    organizationName: z.string().min(1, 'اسم المنظمة مطلوب'),
    name: z.string().min(1, 'الاسم مطلوب'),
    email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('بريد إلكتروني غير صالح'),
    password: z
      .string()
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
      .regex(/[0-9]/, 'يجب أن تحتوي على رقم')
      .regex(/[^A-Za-z0-9]/, 'يجب أن تحتوي على رمز خاص'),
    passwordConfirmation: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'يجب الموافقة على الشروط والأحكام' }),
    }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'كلمات المرور غير متطابقة',
    path: ['passwordConfirmation'],
  });
export type RegisterFormData = z.infer<typeof registerSchema>;

export const acceptInvitationSchema = z
  .object({
    name: z.string().min(1, 'الاسم مطلوب'),
    password: z
      .string()
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
      .regex(/[0-9]/, 'يجب أن تحتوي على رقم')
      .regex(/[^A-Za-z0-9]/, 'يجب أن تحتوي على رمز خاص'),
    passwordConfirmation: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'كلمات المرور غير متطابقة',
    path: ['passwordConfirmation'],
  });
export type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('بريد إلكتروني غير صالح'),
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
      .regex(/[0-9]/, 'يجب أن تحتوي على رقم')
      .regex(/[^A-Za-z0-9]/, 'يجب أن تحتوي على رمز خاص'),
    passwordConfirmation: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'كلمات المرور غير متطابقة',
    path: ['passwordConfirmation'],
  });
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;