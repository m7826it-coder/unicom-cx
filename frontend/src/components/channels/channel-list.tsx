'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { channelService } from '@/services/channel.service';
import type { Channel } from '@/types/channel.types';

const CHANNEL_ICONS: Record<string, string> = {
  WHATSAPP: '📱',
  INSTAGRAM: '📷',
  TELEGRAM: '✈️',
  EMAIL: '📧',
};

const CHANNEL_LABELS: Record<string, string> = {
  WHATSAPP: 'واتساب',
  INSTAGRAM: 'إنستغرام',
  TELEGRAM: 'تيليجرام',
  EMAIL: 'بريد إلكتروني',
};

const STATUS_VARIANTS: Record<string, 'default' | 'destructive' | 'secondary'> = {
  ACTIVE: 'default',
  INACTIVE: 'secondary',
  ERROR: 'destructive',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'نشط',
  INACTIVE: 'غير نشط',
  ERROR: 'خطأ',
};

export default function ChannelList() {
  const queryClient = useQueryClient();
  const { data: channels, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['channels'],
    queryFn: () => channelService.getChannels(),
    staleTime: 60_000,
  });

  async function handleRemove(id: string, type: string) {
    if (!confirm(`هل أنت متأكد من إزالة قناة ${CHANNEL_LABELS[type] ?? type}؟`)) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/channels/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    } catch (err) {
      alert('فشل إزالة القناة');
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <p className="text-sm text-destructive">{error instanceof Error ? error.message : 'فشل تحميل القنوات'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="ml-2 h-4 w-4" />إعادة المحاولة
        </Button>
      </div>
    );
  }

  if (!channels || channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-muted-foreground">لا توجد قنوات مربوطة بعد</p>
        <p className="text-xs text-muted-foreground mt-1">اربط قنواتك للبدء في استقبال رسائل العملاء</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {channels.map((channel) => (
        <div key={channel.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{CHANNEL_ICONS[channel.type] ?? '💬'}</span>
              <h3 className="font-semibold text-sm">{CHANNEL_LABELS[channel.type] ?? channel.type}</h3>
            </div>
            <Badge variant={STATUS_VARIANTS[channel.status] ?? 'secondary'}>{STATUS_LABELS[channel.status] ?? channel.status}</Badge>
          </div>
          {channel.webhookUrl && <p className="text-xs text-muted-foreground truncate mb-2">{channel.webhookUrl}</p>}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">{new Date(channel.createdAt).toLocaleDateString('ar-SA')}</span>
            <div className="flex items-center gap-1">
              {channel.webhookUrl && (
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href={channel.webhookUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemove(channel.id, channel.type)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}