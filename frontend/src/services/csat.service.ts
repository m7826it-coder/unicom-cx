import { fetchApi, type PaginatedResponse } from '@/services/api-client';
import type {
  CSATSurveyResponse,
  CSATSurveyFilters,
} from '@/types/csat.types';

export class CSATService {
  async getSurveys(filters?: CSATSurveyFilters): Promise<PaginatedResponse<CSATSurveyResponse[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));

    const query = params.toString();
    const path = `/csat${query ? `?${query}` : ''}`;

    const result = await fetchApi<CSATSurveyResponse[]>(path);
    if (result && typeof result === 'object' && 'pagination' in result) {
      return result as PaginatedResponse<CSATSurveyResponse[]>;
    }
    return {
      data: result as CSATSurveyResponse[],
      pagination: { page: filters?.page ?? 1, limit: filters?.limit ?? 20, total: 0 },
    };
  }

  async getSurvey(conversationId: string): Promise<CSATSurveyResponse> {
    return fetchApi<CSATSurveyResponse>(`/csat/${conversationId}`);
  }

  async generateSurvey(conversationId: string, customerId: string, channel: string): Promise<CSATSurveyResponse> {
    return fetchApi<CSATSurveyResponse>('/csat/generate', {
      method: 'POST',
      body: JSON.stringify({ conversationId, customerId, channel }),
    });
  }

  async respondToSurvey(conversationId: string, orgId: string, rating: number, feedback?: string): Promise<CSATSurveyResponse> {
    return fetchApi<CSATSurveyResponse>('/csat/respond', {
      method: 'POST',
      body: JSON.stringify({ conversationId, orgId, rating, feedback }),
    });
  }
}

export const csatService = new CSATService();