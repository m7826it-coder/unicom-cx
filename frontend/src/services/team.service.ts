import { fetchApi } from '@/services/api-client';
import type { TeamMember, InviteRequest } from '@/types/team.types';

export class TeamService {
  async getMembers(): Promise<TeamMember[]> {
    return fetchApi<TeamMember[]>('/team/members');
  }

  async invite(data: InviteRequest): Promise<{ message: string }> {
    return fetchApi<{ message: string }>('/team/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeMember(userId: string): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/team/members/${userId}`, {
      method: 'DELETE',
    });
  }
}

export const teamService = new TeamService();