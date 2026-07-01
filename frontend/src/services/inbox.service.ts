import { fetchApi, fetchData, type PaginatedResponse } from '@/services/api-client';
import type {
  ConversationSummary,
  ConversationDetail,
  MessageResponse,
  SendMessageRequest,
  UpdateConversationRequest,
  ConversationFilters,
} from '@/types/inbox.types';

export class InboxService {
  async getConversations(filters?: ConversationFilters): Promise<PaginatedResponse<ConversationSummary[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.channel) params.set('channel', filters.channel);
    if (filters?.classification) params.set('classification', filters.classification);
    if (filters?.assignedTo) params.set('assignedTo', filters.assignedTo);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));

    const query = params.toString();
    const path = `/inbox/conversations${query ? `?${query}` : ''}`;

    const result = await fetchApi<ConversationSummary[]>(path);
    if (result && typeof result === 'object' && 'pagination' in result) {
      return result as PaginatedResponse<ConversationSummary[]>;
    }
    return {
      data: result as ConversationSummary[],
      pagination: { page: filters?.page ?? 1, limit: filters?.limit ?? 20, total: 0 },
    };
  }

  async getConversation(id: string): Promise<ConversationDetail> {
    return fetchData<ConversationDetail>(`/inbox/conversations/${id}`);
  }

  async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<PaginatedResponse<MessageResponse[]>> {
    const path = `/inbox/conversations/${conversationId}/messages?page=${page}&limit=${limit}`;
    const result = await fetchApi<MessageResponse[]>(path);
    if (result && typeof result === 'object' && 'pagination' in result) {
      return result as PaginatedResponse<MessageResponse[]>;
    }
    return {
      data: result as MessageResponse[],
      pagination: { page, limit, total: 0 },
    };
  }

  async sendMessage(conversationId: string, data: SendMessageRequest): Promise<MessageResponse> {
    return fetchData<MessageResponse>(`/inbox/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateConversation(conversationId: string, data: UpdateConversationRequest): Promise<ConversationSummary> {
    return fetchData<ConversationSummary>(`/inbox/conversations/${conversationId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const inboxService = new InboxService();
