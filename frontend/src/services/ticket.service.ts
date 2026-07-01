import { fetchApi, fetchData, type PaginatedResponse } from '@/services/api-client';
import type {
  TicketResponse,
  CreateTicketRequest,
  UpdateTicketRequest,
  TicketFilters,
} from '@/types/ticket.types';

export class TicketService {
  async getTickets(filters?: TicketFilters): Promise<PaginatedResponse<TicketResponse[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.assignedTo) params.set('assignedTo', filters.assignedTo);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));

    const query = params.toString();
    const path = `/tickets${query ? `?${query}` : ''}`;

    const result = await fetchApi<TicketResponse[]>(path);
    if (result && typeof result === 'object' && 'pagination' in result) {
      return result as PaginatedResponse<TicketResponse[]>;
    }
    return {
      data: result as TicketResponse[],
      pagination: { page: filters?.page ?? 1, limit: filters?.limit ?? 20, total: 0 },
    };
  }

  async getTicket(id: string): Promise<TicketResponse> {
    return fetchData<TicketResponse>(`/tickets/${id}`);
  }

  async createTicket(data: CreateTicketRequest): Promise<TicketResponse> {
    return fetchData<TicketResponse>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createTicketFromConversation(conversationId: string, data: CreateTicketRequest): Promise<TicketResponse> {
    return fetchData<TicketResponse>(`/tickets/from-conversation/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTicket(id: string, data: UpdateTicketRequest): Promise<TicketResponse> {
    return fetchData<TicketResponse>(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const ticketService = new TicketService();
