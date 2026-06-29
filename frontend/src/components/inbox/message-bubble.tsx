import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Check, CheckCheck, FileText, Image } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { MessageResponse } from '@/types/inbox.types';

interface MessageBubbleProps {
  message: MessageResponse;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isAgent = message.senderType === 'AGENT';
  const isBot = message.senderType === 'BOT';

  const senderName = isAgent ? message.agent?.name ?? 'وكيل' : message.customer?.name ?? 'عميل';

  const initials = senderName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const time = format(new Date(message.createdAt), 'HH:mm', { locale: ar });
  const deliveryStatus = (message.metadata as any)?.deliveryStatus;

  return (
    <div className={cn('flex gap-3 my-3', isAgent ? 'justify-end' : 'justify-start')}>
      {!isAgent && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      )}

      <div className={cn('max-w-[75%]', isAgent ? 'order-1' : 'order-2')}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-muted-foreground">{senderName}</span>
          {isBot && (
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">🤖 روبوت</span>
          )}
        </div>

        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isAgent
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : isBot
              ? 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-bl-md'
              : 'bg-muted rounded-bl-md'
          )}
        >
          {message.contentType === 'IMAGE' && (
            <div className="flex items-center gap-2 mb-1 text-xs opacity-75">
              <Image className="h-4 w-4" />صورة
            </div>
          )}
          {message.contentType === 'FILE' && (
            <div className="flex items-center gap-2 mb-1 text-xs opacity-75">
              <FileText className="h-4 w-4" />ملف
            </div>
          )}
          {message.contentType === 'INTERACTIVE' && message.metadata && (
            <div className="mb-2">
              {(message.metadata as any).buttons?.map((btn: any, idx: number) => (
                <span key={idx} className="inline-block bg-background/20 rounded px-2 py-1 text-xs mr-1 mb-1">
                  {btn.title}
                </span>
              ))}
            </div>
          )}
          <p>{message.content}</p>
        </div>

        <div className={cn('flex items-center gap-1 mt-1', isAgent ? 'justify-end' : 'justify-start')}>
          <span className="text-xs text-muted-foreground">{time}</span>
          {isAgent && (
            <>
              {deliveryStatus === 'delivered' && <CheckCheck className="h-3 w-3 text-muted-foreground" />}
              {deliveryStatus === 'sent' && <Check className="h-3 w-3 text-muted-foreground" />}
            </>
          )}
        </div>
      </div>

      {isAgent && (
        <Avatar className="h-8 w-8 shrink-0 order-3">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}