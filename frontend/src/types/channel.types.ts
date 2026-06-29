export type ChannelType = 'WHATSAPP' | 'INSTAGRAM' | 'TELEGRAM' | 'EMAIL';

export interface Channel {
  id: string;
  orgId: string;
  type: ChannelType;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  webhookUrl: string | null;
  createdAt: string;
}

export interface ConnectChannelRequest {
  type: ChannelType;
  credentials: Record<string, string>;
}