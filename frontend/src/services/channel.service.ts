import { fetchApi } from '@/services/api-client';
import type { Channel, ConnectChannelRequest } from '@/types/channel.types';

export class ChannelService {
  async getChannels(): Promise<Channel[]> {
    return fetchApi<Channel[]>('/channels');
  }

  async connectChannel(data: ConnectChannelRequest): Promise<Channel> {
    return fetchApi<Channel>('/channels/connect', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const channelService = new ChannelService();