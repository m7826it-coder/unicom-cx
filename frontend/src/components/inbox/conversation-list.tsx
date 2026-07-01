'use client';
import type { ConversationSummary } from '@/types/inbox.types';
import { useState, useCallback } from 'react';
import ConversationItem from './conversation-item';
import ConversationFilters from './conversation-filters';
import InboxSkeleton from './inbox-skeleton';
import { useConversations } from '@/hooks/use-conversations';
import { Button } from '@/components/ui/button';
import type { ConversationFilters as Filters } from '@/types/inbox.types';

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
  selectedConversationId?: string;
}

export default function ConversationList({ onSelectConversation, selectedConversationId }: ConversationListProps) {
  const [filters, setFilters] = useState<Filters>({ page: 1, limit: 20 });

  const { data: conversations, isLoading, isError, error, refetch, pagination } = useConversations(filters);

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const loadMore = useCallback(() => {
    if (pagination.page * pagination.limit < pagination.total) {
      setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }));
    }
  }, [pagination]);

  return (
    <div className="flex h-full flex-col border-l">
      <div className="border-b p-3">
        <ConversationFilters onFiltersChange={handleFiltersChange} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && <InboxSkeleton />}

        {isError && (
          <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : 'فشل تحميل المحادثات'}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              إعادة المحاولة
            </Button>
          </div>
        )}

        {!isLoading && !isError && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-1 p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">لا توجد محادثات</p>
            <p className="text-xs text-muted-foreground">لا توجد محادثات تطابق معايير البحث الحالية</p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          conversations.map((conv: ConversationSummary) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === selectedConversationId}
              onClick={() => onSelectConversation(conv.id)}
            />
          ))}

        {pagination.page * pagination.limit < pagination.total && (
          <div className="p-3 text-center">
            <Button variant="ghost" size="sm" onClick={loadMore}>
              تحميل المزيد
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
