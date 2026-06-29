export interface DashboardStats {
  totalConversationsToday: number;
  openConversations: number;
  closedConversationsToday: number;
  avgFirstResponseTimeMinutes: number;
}

export interface ChannelDistribution {
  channel: string;
  count: number;
  percentage: number;
}

export interface VolumeDataPoint {
  date: string;
  count: number;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  conversationsHandled: number;
  avgResponseTimeMinutes: number;
  avgCSAT: number;
}

export interface DashboardData {
  stats: DashboardStats;
  channelDistribution: ChannelDistribution[];
  volumeOverTime: VolumeDataPoint[];
  agentPerformance: AgentPerformance[];
}