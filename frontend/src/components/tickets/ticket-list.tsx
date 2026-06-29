'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { RefreshCw, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ticketService } from '@/services/ticket.service';
import type { TicketFilters } from '@/types/ticket.types';

const PRIORITY_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  LOW: 'outline', MEDIUM: 'default', HIGH: 'secondary', URGENT: 'destructive',
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'منخفضة', MEDIUM: 'متوسطة', HIGH: 'عالية', URGENT: 'عاجلة',
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'مفتوحة', IN_PROGRESS: 'قيد المعالجة', RESOLVED: 'تم الحل', CLOSED: 'مغلقة',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  OPEN: 'default', IN_PROGRESS: 'secondary', RESOLVED: 'outline', CLOSED: 'outline',
};

export default function TicketList() {
  const [filters, setFilters] = useState<TicketFilters>({ page: 1, limit: 20 });

  const { data: result, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketService.getTickets(filters),
    staleTime: 30_000,
  });

  const tickets = result?.data ?? [];
  const pagination = result?.pagination ?? { page: 1, limit: 20, total: 0 };

  function updateFilter(key: keyof TicketFilters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="flex-1 space-y-2"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-32" /></div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <p className="text-sm text-destructive">{error instanceof Error ? error.message : 'فشل تحميل التذاكر'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="ml-2 h-4 w-4" />إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select value={filters.status ?? ''} onValueChange={(val) => updateFilter('status', val)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">الكل</SelectItem>
            <SelectItem value="OPEN">مفتوحة</SelectItem>
            <SelectItem value="IN_PROGRESS">قيد المعالجة</SelectItem>
            <SelectItem value="RESOLVED">تم الحل</SelectItem>
            <SelectItem value="CLOSED">مغلقة</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.priority ?? ''} onValueChange={(val) => updateFilter('priority', val)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="الأولوية" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">الكل</SelectItem>
            <SelectItem value="LOW">منخفضة</SelectItem>
            <SelectItem value="MEDIUM">متوسطة</SelectItem>
            <SelectItem value="HIGH">عالية</SelectItem>
            <SelectItem value="URGENT">عاجلة</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.assignedTo ?? ''} onValueChange={(val) => updateFilter('assignedTo', val)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="التعيين" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">الكل</SelectItem>
            <SelectItem value="me">معينة لي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm font-medium text-muted-foreground">لا توجد تذاكر</p>
          <p className="text-xs text-muted-foreground mt-1">قم بإنشاء تذكرة جديدة لمتابعة مشاكل العملاء</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">العنوان</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">الأولوية</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">الحالة</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">المسؤول</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">التاريخ</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium truncate max-w-60">{ticket.subject}</p>
                    {ticket.description && <p className="text-xs text-muted-foreground truncate max-w-60">{ticket.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-center"><Badge variant={PRIORITY_VARIANTS[ticket.priority] ?? 'outline'}>{PRIORITY_LABELS[ticket.priority] ?? ticket.priority}</Badge></td>
                  <td className="px-4 py-3 text-center"><Badge variant={STATUS_VARIANTS[ticket.status] ?? 'outline'}>{STATUS_LABELS[ticket.status] ?? ticket.status}</Badge></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{ticket.assignee?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString('ar-SA')}</td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/tickets/${ticket.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}>السابق</Button>
          <span className="text-sm text-muted-foreground">صفحة {pagination.page} من {Math.ceil(pagination.total / pagination.limit)}</span>
          <Button variant="outline" size="sm" disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)} onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}>التالي</Button>
        </div>
      )}
    </div>
  );
}