export type CSATSurveyStatus = 'PENDING' | 'SENT' | 'COMPLETED' | 'EXPIRED';

export interface CSATSurveyResponse {
  id: string;
  conversationId: string;
  status: CSATSurveyStatus;
  rating: number | null;
  feedback: string | null;
  sentAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface CSATSurveyFilters {
  status?: CSATSurveyStatus;
  page?: number;
  limit?: number;
}