'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Mail, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { fetchApi } from '@/services/api-client';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validators';
import { cn } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(data: ForgotPasswordFormData) {
    setError(null);
    setIsLoading(true);
    try {
      await fetchApi('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) });
      setIsSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message || 'فشل إرسال الطلب');
      else setError('فشل إرسال الطلب');
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"><MailCheck className="h-6 w-6 text-primary" /></div>
            <CardTitle className="text-2xl font-bold">تم إرسال رابط إعادة التعيين</CardTitle>
            <CardDescription>إذا كان البريد الإلكتروني مسجلاً، ستتلقى رابطًا لإعادة تعيين كلمة المرور. يرجى التحقق من بريدك الإلكتروني.</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center"><Link href="/login" className="text-sm font-medium text-primary underline-offset-4 hover:underline">العودة إلى تسجيل الدخول</Link></CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"><Mail className="h-6 w-6 text-primary" /></div>
          <CardTitle className="text-2xl font-bold">نسيت كلمة المرور</CardTitle>
          <CardDescription>أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="ahmed@example.com" className={cn('pr-10', errors.email && 'border-destructive')} disabled={isLoading} {...register('email')} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  جاري الإرسال...
                </span>
              ) : (
                <span className="flex items-center gap-2"><Mail className="h-4 w-4" />إرسال رابط إعادة التعيين</span>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center"><Link href="/login" className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline">العودة إلى تسجيل الدخول</Link></CardFooter>
      </Card>
    </div>
  );
}