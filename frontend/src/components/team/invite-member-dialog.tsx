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
import { teamService } from '@/services/team.service';

const inviteSchema = z.object({
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('بريد إلكتروني غير صالح'),
  role: z.enum(['AGENT', 'ADMIN']),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteMemberDialog({ isOpen, onClose }: InviteMemberDialogProps) {
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
  } = useForm<InviteFormData>({ resolver: zodResolver(inviteSchema), defaultValues: { role: 'AGENT' } });

  const role = watch('role');

  async function onSubmit(data: InviteFormData) {
    setError(null);
    setIsSubmitting(true);
    try {
      await teamService.invite(data);
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      reset();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message || 'فشل إرسال الدعوة');
      else setError('فشل إرسال الدعوة');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>دعوة عضو جديد</DialogTitle>
          <DialogDescription>أدخل البريد الإلكتروني للعضو واختر دوره</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</label>
            <Input id="email" type="email" placeholder="agent@example.com" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">الدور</label>
            <Select value={role} onValueChange={(val) => setValue('role', val as 'AGENT' | 'ADMIN')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AGENT">وكيل</SelectItem>
                <SelectItem value="ADMIN">مدير</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'جاري الإرسال...' : 'إرسال الدعوة'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}