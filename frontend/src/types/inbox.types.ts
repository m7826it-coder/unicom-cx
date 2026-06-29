export type ChannelType = 'WHATSAPP' | 'INSTAGRAM' | 'TELEGRAM' | 'EMAIL';
export type ConversationStatus = 'OPEN' | 'CLOSED' | 'WAITING';
export type Classification = 'INQUIRY' | 'COMPLAINT' | 'REQUEST' | 'OTHER';
export type SenderType = 'AGENT' | 'CUSTOMER' | 'BOT';
export type ContentType = 'TEXT' | 'IMAGE' | 'FILE' | 'INTERACTIVE';

export interface ConversationSummary {
  id: string;
  customerId: string;
  customer: { id: string; name: string; avatar: string | null };
  channel: ChannelType;
  status: ConversationStatus;
  classification: Classification | null;
  assignedTo: string | null;
  assignedAgent: { id: string; name: string } | null;
  lastMessage: { content: string; senderType: SenderType; createdAt: string } | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetail extends ConversationSummary {}

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderType: SenderType;
  agentId: string | null;
  agent: { id: string; name: string } | null;
  customerId: string | null;
  customer: { id: string; name: string } | null;
  content: string;
  contentType: ContentType;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface SendMessageRequest {
  content: string;
  contentType?: ContentType;
}

export interface UpdateConversationRequest {
  status?: ConversationStatus;
  assignedTo?: string | null;
}

export interface ConversationFilters {
  status?: ConversationStatus;
  channel?: ChannelType;
  classification?: Classification;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}