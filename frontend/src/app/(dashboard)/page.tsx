'use client';

import { useQuery } from '@tanstack/react-query';
import { MessageSquareText, MessageCircle, CheckCircle2, Clock } from 'lucide-react';
import { fetchApi } from '@/services/api-client';
import StatsCard from '@/components/dashboard/stats-card';
import ChannelPieChart from '@/components/dashboard/channel-pie-chart';
import VolumeLineChart from '@/components/dashboard/volume-line-chart';
import AgentPerformanceTable from '@/components/dashboard/agent-performance-table';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardData } from '@/types/dashboard.types';

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => fetchApi<DashboardData>('/analytics/overview'),
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground">ملخص أداء المنصة وفريق الدعم</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading || isError ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))
        ) : (
          <>
            <StatsCard
              title="إجمالي المحادثات اليوم"
              value={data?.stats.totalConversationsToday ?? 0}
              icon={<MessageSquareText className="h-5 w-5" />}
              description="منذ منتصف الليل"
            />
            <StatsCard
              title="المحادثات المفتوحة"
              value={data?.stats.openConversations ?? 0}
              icon={<MessageCircle className="h-5 w-5" />}
              description="بانتظار الرد"
            />
            <StatsCard
              title="مغلقة اليوم"
              value={data?.stats.closedConversationsToday ?? 0}
              icon={<CheckCircle2 className="h-5 w-5" />}
              description="تم حلها بنجاح"
            />
            <StatsCard
              title="متوسط زمن الرد"
              value={`${data?.stats.avgFirstResponseTimeMinutes ?? 0} د`}
              icon={<Clock className="h-5 w-5" />}
              description="أول رد"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">توزيع القنوات</h2>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ChannelPieChart data={data?.channelDistribution ?? []} />
          )}
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">حجم المحادثات</h2>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <VolumeLineChart data={data?.volumeOverTime ?? []} />
          )}
        </div>
      </div>

      <AgentPerformanceTable data={data?.agentPerformance ?? []} isLoading={isLoading} />
    </div>
  );
}