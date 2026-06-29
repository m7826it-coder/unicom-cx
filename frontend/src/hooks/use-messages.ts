'use client';

import { useQuery } from '@tanstack/react-query';
import { inboxService } from '@/services/inbox.service';

export function useMessages(conversationId: string, page: number = 1, limit: number = 50) {
  return useQuery({
    queryKey: ['messages', conversationId, page],
    queryFn: () => inboxService.getMessages(conversationId, page, limit),
    enabled: !!conversationId,
    staleTime: 10_000,
  });
}