'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { csatService } from '@/services/csat.service';
import type { CSATSurveyFilters } from '@/types/csat.types';

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  PENDING: 'outline', SENT: 'secondary', COMPLETED: 'default', EXPIRED: 'destructive',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'قيد الانتظار', SENT: 'مُرسل', COMPLETED: 'مكتمل', EXPIRED: 'منتهي',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'}`} />
      ))}
    </div>
  );
}

export default function SurveyList() {
  const [filters, setFilters] = useState<CSATSurveyFilters>({ page: 1, limit: 20 });

  const { data: result, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['csat-surveys', filters],
    queryFn: () => csatService.getSurveys(filters),
    staleTime: 30_000,
  });

  const surveys = result?.data ?? [];
  const pagination = result?.pagination ?? { page: 1, limit: 20, total: 0 };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="flex-1 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <p className="text-sm text-destructive">{error instanceof Error ? error.message : 'فشل تحميل الاستبيانات'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="ml-2 h-4 w-4" />إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Select value={filters.status ?? ''} onValueChange={(val) => setFilters((prev) => ({ ...prev, status: (val || undefined) as CSATSurveyFilters['status'], page: 1 }))}>
          <SelectTrigger className="w-40"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">الكل</SelectItem>
            <SelectItem value="PENDING">قيد الانتظار</SelectItem>
            <SelectItem value="SENT">مُرسل</SelectItem>
            <SelectItem value="COMPLETED">مكتمل</SelectItem>
            <SelectItem value="EXPIRED">منتهي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {surveys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm font-medium text-muted-foreground">لا توجد استبيانات</p>
          <p className="text-xs text-muted-foreground mt-1">ستظهر هنا استبيانات الرضا بعد إغلاق المحادثات</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">محادثة</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">الحالة</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">التقييم</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">ملاحظات</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map((survey) => (
                <tr key={survey.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono">{survey.conversationId.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-center"><Badge variant={STATUS_VARIANTS[survey.status] ?? 'outline'}>{STATUS_LABELS[survey.status] ?? survey.status}</Badge></td>
                  <td className="px-4 py-3 text-center">{survey.rating ? <div className="flex justify-center"><StarRating rating={survey.rating} /></div> : <span className="text-xs text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-40 truncate">{survey.feedback || '—'}</td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">{new Date(survey.createdAt).toLocaleDateString('ar-SA')}</td>
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