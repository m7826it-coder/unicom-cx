'use client';

import { useQuery } from '@tanstack/react-query';
import { inboxService } from '@/services/inbox.service';

export function useConversation(id: string) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => inboxService.getConversation(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}