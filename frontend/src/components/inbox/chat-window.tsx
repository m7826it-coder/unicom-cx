'use client';

import { useEffect, useRef } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import MessageBubble from './message-bubble';
import MessageInput from './message-input';
import QuickReplies from './quick-replies';
import AISuggestions from './ai-suggestions';
import { useConversation } from '@/hooks/use-conversation';
import { useMessages } from '@/hooks/use-messages';
import { useSendMessage } from '@/hooks/use-send-message';

interface ChatWindowProps {
  conversationId: string;
}

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'مفتوحة',
  CLOSED: 'مغلقة',
  WAITING: 'قيد الانتظار',
};

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversation, isLoading: convLoading } = useConversation(conversationId);
  const { data: messages, isLoading: msgLoading, isError, error, refetch } = useMessages(conversationId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage(conversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const customerInitials = conversation?.customer?.name
    ? conversation.customer.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : '؟';

  const isLoading = convLoading || msgLoading;
  const isClosed = conversation?.status === 'CLOSED';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{customerInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-semibold">{conversation?.customer?.name ?? 'جاري التحميل...'}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{conversation?.channel ?? ''}</span>
              {conversation?.status && (
                <Badge variant="secondary" className="h-4 text-xs px-1.5">
                  {STATUS_LABELS[conversation.status] ?? conversation.status}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {isClosed && <Badge variant="outline" className="text-xs">محادثة مغلقة</Badge>}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {isLoading && (
          <div className="space-y-4 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-64 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive">{error instanceof Error ? error.message : 'فشل تحميل الرسائل'}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="ml-2 h-4 w-4" />إعادة المحاولة
            </Button>
          </div>
        )}

        {!isLoading && !isError && messages && (
          <>
            {messages.pagination?.total === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">لا توجد رسائل بعد</div>
            ) : (
              messages.data?.map((msg) => <MessageBubble key={msg.id} message={msg} />)
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t">
        <AISuggestions onSelect={(text) => sendMessage({ content: text })} />
        <QuickReplies onSelect={(text) => sendMessage({ content: text })} />
        <MessageInput onSend={(content) => sendMessage({ content })} isPending={isSending} disabled={isClosed} />
      </div>
    </div>
  );
}