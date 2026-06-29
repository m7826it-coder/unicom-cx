'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, Building2, User, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { registerSchema, type RegisterFormData } from '@/lib/validators';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterFormData) {
    setError(null);
    setIsLoading(true);
    try {
      await authService.register(data);
      router.push(returnUrl);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message || 'فشل إنشاء الحساب');
      else setError('فشل إنشاء الحساب');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">إنشاء حساب جديد</CardTitle>
        <CardDescription>أنشئ منظمتك وابدأ في إدارة تجربة عملائك</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
          <div className="space-y-2">
            <label htmlFor="organizationName" className="text-sm font-medium">اسم المنظمة</label>
            <div className="relative">
              <Building2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="organizationName" placeholder="متجر أناقة" className={cn('pr-10', errors.organizationName && 'border-destructive')} disabled={isLoading} {...register('organizationName')} />
            </div>
            {errors.organizationName && <p className="text-xs text-destructive">{errors.organizationName.message}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">اسم المدير</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="name" placeholder="أحمد محمد" className={cn('pr-10', errors.name && 'border-destructive')} disabled={isLoading} {...register('name')} />
            </div>
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" placeholder="ahmed@example.com" className={cn('pr-10', errors.email && 'border-destructive')} disabled={isLoading} {...register('email')} />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
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
          <div className="flex items-start gap-2">
            <input type="checkbox" id="acceptTerms" className="mt-1 h-4 w-4 rounded border-input accent-primary" disabled={isLoading} {...register('acceptTerms')} />
            <label htmlFor="acceptTerms" className="text-sm text-muted-foreground">أوافق على <Link href="/terms" className="underline underline-offset-4 hover:text-primary">الشروط والأحكام</Link> وسياسة الخصوصية</label>
          </div>
          {errors.acceptTerms && <p className="text-xs text-destructive -mt-2 mr-6">{errors.acceptTerms.message}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                جاري إنشاء الحساب...
              </span>
            ) : (
              <span className="flex items-center gap-2"><UserPlus className="h-4 w-4" />إنشاء الحساب</span>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          لديك حساب بالفعل؟{' '}
          <Link href={`/login${returnUrl !== '/dashboard' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`} className="font-medium text-primary underline-offset-4 hover:underline">تسجيل الدخول</Link>
        </p>
      </CardFooter>
    </Card>
  );
}