'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { channelService } from '@/services/channel.service';

const channelTypes = [
  { value: 'WHATSAPP', label: 'واتساب' },
  { value: 'INSTAGRAM', label: 'إنستغرام' },
  { value: 'TELEGRAM', label: 'تيليجرام' },
  { value: 'EMAIL', label: 'بريد إلكتروني' },
] as const;

const connectSchema = z.object({
  type: z.enum(['WHATSAPP', 'INSTAGRAM', 'TELEGRAM', 'EMAIL']),
  phoneNumberId: z.string().optional(),
  accessToken: z.string().optional(),
  instagramAccountId: z.string().optional(),
  facebookPageId: z.string().optional(),
  botToken: z.string().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.string().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
});

type ConnectFormData = z.infer<typeof connectSchema>;

interface ConnectChannelDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConnectChannelDialog({ isOpen, onClose }: ConnectChannelDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ConnectFormData>({ resolver: zodResolver(connectSchema), defaultValues: { type: 'WHATSAPP' } });

  const type = watch('type');

  async function onSubmit(data: ConnectFormData) {
    setError(null);
    setIsSubmitting(true);

    let credentials: Record<string, string> = {};
    switch (data.type) {
      case 'WHATSAPP':
        credentials = { phoneNumberId: data.phoneNumberId ?? '', accessToken: data.accessToken ?? '' };
        break;
      case 'INSTAGRAM':
        credentials = { instagramAccountId: data.instagramAccountId ?? '', facebookPageId: data.facebookPageId ?? '' };
        break;
      case 'TELEGRAM':
        credentials = { botToken: data.botToken ?? '' };
        break;
      case 'EMAIL':
        credentials = { smtpHost: data.smtpHost ?? '', smtpPort: data.smtpPort ?? '', smtpUser: data.smtpUser ?? '', smtpPassword: data.smtpPassword ?? '' };
        break;
    }

    try {
      await channelService.connectChannel({ type: data.type, credentials });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      reset();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message || 'فشل ربط القناة');
      else setError('فشل ربط القناة');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ربط قناة جديدة</DialogTitle>
          <DialogDescription>اختر نوع القناة وأدخل بيانات الاعتماد</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>}
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">نوع القناة</label>
            <Select value={type} onValueChange={(val) => setValue('type', val as typeof type)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {channelTypes.map((ct) => <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {type === 'WHATSAPP' && (
            <>
              <div className="space-y-2">
                <label htmlFor="phoneNumberId" className="text-sm font-medium">معرف رقم الهاتف</label>
                <Input id="phoneNumberId" {...register('phoneNumberId')} />
              </div>
              <div className="space-y-2">
                <label htmlFor="accessToken" className="text-sm font-medium">رمز الوصول (Access Token)</label>
                <Input id="accessToken" type="password" {...register('accessToken')} />
              </div>
            </>
          )}

          {type === 'INSTAGRAM' && (
            <>
              <div className="space-y-2">
                <label htmlFor="instagramAccountId" className="text-sm font-medium">معرف حساب إنستغرام</label>
                <Input id="instagramAccountId" {...register('instagramAccountId')} />
              </div>
              <div className="space-y-2">
                <label htmlFor="facebookPageId" className="text-sm font-medium">معرف صفحة فيسبوك</label>
                <Input id="facebookPageId" {...register('facebookPageId')} />
              </div>
            </>
          )}

          {type === 'TELEGRAM' && (
            <div className="space-y-2">
              <label htmlFor="botToken" className="text-sm font-medium">رمز البوت (Bot Token)</label>
              <Input id="botToken" type="password" {...register('botToken')} />
            </div>
          )}

          {type === 'EMAIL' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="smtpHost" className="text-sm font-medium">مضيف SMTP</label>
                  <Input id="smtpHost" placeholder="smtp.example.com" {...register('smtpHost')} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="smtpPort" className="text-sm font-medium">المنفذ</label>
                  <Input id="smtpPort" placeholder="587" {...register('smtpPort')} />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="smtpUser" className="text-sm font-medium">اسم المستخدم</label>
                <Input id="smtpUser" {...register('smtpUser')} />
              </div>
              <div className="space-y-2">
                <label htmlFor="smtpPassword" className="text-sm font-medium">كلمة المرور</label>
                <Input id="smtpPassword" type="password" {...register('smtpPassword')} />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'جاري الربط...' : 'ربط القناة'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}