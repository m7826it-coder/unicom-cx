'use client';

import { useQuery } from '@tanstack/react-query';
import { inboxService } from '@/services/inbox.service';
import type { ConversationFilters } from '@/types/inbox.types';

export function useConversations(filters: ConversationFilters = {}) {
  const query = useQuery({
    queryKey: ['conversations', filters],
    queryFn: () => inboxService.getConversations(filters),
    staleTime: 30_000,
    select: (data) => {
      if (data && typeof data === 'object' && 'pagination' in data) {
        return {
          conversations: data.data,
          pagination: data.pagination,
        };
      }
      return {
        conversations: data as any,
        pagination: { page: 1, limit: 20, total: 0 },
      };
    },
  });

  return {
    data: query.data?.conversations ?? [],
    pagination: query.data?.pagination ?? { page: 1, limit: 20, total: 0 },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}