export interface TeamMember {
  id: string;
  orgId: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'AGENT';
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InviteRequest {
  email: string;
  role: 'AGENT' | 'ADMIN';
}