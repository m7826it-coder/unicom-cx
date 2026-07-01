'use client';

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, User, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { fetchApi } from '@/services/api-client';
import { acceptInvitationSchema, type AcceptInvitationFormData } from '@/lib/validators';
import { cn } from '@/lib/utils';

// المكون الداخلي الذي يستخدم useSearchParams
function AcceptInvitationForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInvitationFormData>({ resolver: zodResolver(acceptInvitationSchema) });

  async function onSubmit(data: AcceptInvitationFormData) {
    if (!token) { setError('رمز الدعوة مفقود'); return; }
    setError(null);
    setIsLoading(true);
    try {
      await fetchApi('/team/accept-invitation', {
        method: 'POST',
        body: JSON.stringify({ token, name: data.name, password: data.password }),
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message || 'فشل قبول الدعوة');
      else setError('فشل قبول الدعوة');
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10"><UserCheck className="h-6 w-6 text-destructive" /></div>
            <CardTitle className="text-2xl font-bold">رابط غير صالح</CardTitle>
            <CardDescription>رابط الدعوة غير صالح أو مفقود. يرجى التواصل مع مدير المنظمة للحصول على رابط صحيح.</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center"><Link href="/login" className="text-sm font-medium text-primary underline-offset-4 hover:underline">العودة إلى تسجيل الدخول</Link></CardFooter>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"><UserCheck className="h-6 w-6 text-primary" /></div>
            <CardTitle className="text-2xl font-bold">تم تفعيل الحساب</CardTitle>
            <CardDescription>تم تفعيل حسابك بنجاح. يمكنك الآن تسجيل الدخول.</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center"><Link href="/login"><Button>تسجيل الدخول</Button></Link></CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"><UserCheck className="h-6 w-6 text-primary" /></div>
          <CardTitle className="text-2xl font-bold">قبول الدعوة</CardTitle>
          <CardDescription>أكمل بياناتك لتفعيل حسابك</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">الاسم</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" placeholder="أحمد محمد" className={cn('pr-10', errors.name && 'border-destructive')} disabled={isLoading} {...register('name')} />
              </div>
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" className={cn('pr-10 pl-10', errors.password && 'border-destructive')} disabled={isLoading} {...register('password')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="passwordConfirmation" className="text-sm font-medium">تأكيد كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="passwordConfirmation" type={showPasswordConfirmation ? 'text' : 'password'} placeholder="••••••••" className={cn('pr-10 pl-10', errors.passwordConfirmation && 'border-destructive')} disabled={isLoading} {...register('passwordConfirmation')} />
                <button type="button" onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.passwordConfirmation && <p className="text-xs text-destructive">{errors.passwordConfirmation.message}</p>}
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  جاري تفعيل الحساب...
                </span>
              ) : (
                <span className="flex items-center gap-2"><UserCheck className="h-4 w-4" />تفعيل الحساب</span>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">لديك حساب بالفعل؟{' '}<Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">تسجيل الدخول</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}

// الصفحة الرئيسية مع Suspense
export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">جاري التحميل...</div>}>
      <AcceptInvitationForm />
    </Suspense>
  );
}
