'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { ticketService } from '@/services/ticket.service';

const createTicketSchema = z.object({
  subject: z.string().min(1, 'الموضوع مطلوب'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

type CreateTicketFormData = z.infer<typeof createTicketSchema>;

interface CreateTicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTicketDialog({ isOpen, onClose }: CreateTicketDialogProps) {
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
  } = useForm<CreateTicketFormData>({ resolver: zodResolver(createTicketSchema), defaultValues: { priority: 'MEDIUM' } });

  const priority = watch('priority');

  async function onSubmit(data: CreateTicketFormData) {
    setError(null);
    setIsSubmitting(true);
    try {
      await ticketService.createTicket(data);
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      reset();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message || 'فشل إنشاء التذكرة');
      else setError('فشل إنشاء التذكرة');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>إنشاء تذكرة جديدة</DialogTitle>
          <DialogDescription>أدخل تفاصيل التذكرة لمتابعة المشكلة</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>}
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">الموضوع <span className="text-destructive">*</span></label>
            <Input id="subject" placeholder="موضوع التذكرة" {...register('subject')} />
            {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">الوصف</label>
            <Textarea id="description" placeholder="وصف المشكلة..." rows={3} {...register('description')} />
          </div>
          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-medium">الأولوية</label>
            <Select value={priority} onValueChange={(val) => setValue('priority', val as typeof priority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">منخفضة</SelectItem>
                <SelectItem value="MEDIUM">متوسطة</SelectItem>
                <SelectItem value="HIGH">عالية</SelectItem>
                <SelectItem value="URGENT">عاجلة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'جاري الإنشاء...' : 'إنشاء التذكرة'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}