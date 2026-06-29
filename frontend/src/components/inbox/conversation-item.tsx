import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { MessageCircle, CheckCircle2, Clock } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ConversationSummary } from '@/types/inbox.types';

const CHANNEL_ICONS: Record<string, string> = {
  WHATSAPP: '📱',
  INSTAGRAM: '📷',
  TELEGRAM: '✈️',
  EMAIL: '📧',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  OPEN: <MessageCircle className="h-3 w-3" />,
  CLOSED: <CheckCircle2 className="h-3 w-3" />,
  WAITING: <Clock className="h-3 w-3" />,
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  OPEN: 'default',
  CLOSED: 'secondary',
  WAITING: 'outline',
};

interface ConversationItemProps {
  conversation: ConversationSummary;
  isActive: boolean;
  onClick: () => void;
}

export default function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const initials = conversation.customer.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const timeAgo = conversation.lastMessageAt
    ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true, locale: ar })
    : '';

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 px-4 py-3 text-right transition-colors hover:bg-accent',
        isActive && 'bg-accent'
      )}
    >
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">{conversation.customer.name}</span>
          <span className="shrink-0 text-xs text-muted-foreground">{timeAgo}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs">{CHANNEL_ICONS[conversation.channel] ?? '💬'}</span>
          <Badge variant={STATUS_VARIANTS[conversation.status] ?? 'outline'} className="h-4 gap-1 px-1.5 text-xs">
            {STATUS_ICONS[conversation.status]}
            {conversation.status === 'OPEN' ? 'مفتوحة' : conversation.status === 'CLOSED' ? 'مغلقة' : 'انتظار'}
          </Badge>
          {conversation.assignedAgent && (
            <span className="text-xs text-muted-foreground">· {conversation.assignedAgent.name}</span>
          )}
        </div>

        <p className="truncate text-xs text-muted-foreground">
          {conversation.lastMessage?.content ?? 'لا توجد رسائل'}
        </p>
      </div>

      {conversation.unreadCount > 0 && (
        <Badge className="h-5 min-w-5 shrink-0 rounded-full px-1.5 text-xs">{conversation.unreadCount}</Badge>
      )}
    </button>
  );
}