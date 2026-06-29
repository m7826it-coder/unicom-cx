import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AgentPerformance } from '@/types/dashboard.types';

interface AgentPerformanceTableProps {
  data: AgentPerformance[];
  isLoading?: boolean;
}

function AgentRow({ agent }: { agent: AgentPerformance }) {
  const initials = agent.agentName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <tr className="border-b transition-colors hover:bg-muted/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{agent.agentName}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-center text-sm tabular-nums">{agent.conversationsHandled}</td>
      <td className="px-4 py-3 text-center text-sm tabular-nums">
        {agent.avgResponseTimeMinutes} دقيقة
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {agent.avgCSAT.toFixed(1)}
        </span>
      </td>
    </tr>
  );
}

function SkeletonRow() {
  return (
    <tr>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </td>
      <td className="px-4 py-3"><Skeleton className="mx-auto h-4 w-8" /></td>
      <td className="px-4 py-3"><Skeleton className="mx-auto h-4 w-16" /></td>
      <td className="px-4 py-3"><Skeleton className="mx-auto h-6 w-12 rounded-full" /></td>
    </tr>
  );
}

export default function AgentPerformanceTable({ data, isLoading = false }: AgentPerformanceTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">أداء الوكلاء</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">الوكيل</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">المحادثات</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">متوسط وقت الرد</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">تقييم CSAT</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                : data.map((agent) => <AgentRow key={agent.agentId} agent={agent} />)}
              {!isLoading && data.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    لا يوجد وكلاء بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}