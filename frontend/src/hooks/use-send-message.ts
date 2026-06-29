'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inboxService } from '@/services/inbox.service';
import type { SendMessageRequest } from '@/types/inbox.types';

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageRequest) =>
      inboxService.sendMessage(conversationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}