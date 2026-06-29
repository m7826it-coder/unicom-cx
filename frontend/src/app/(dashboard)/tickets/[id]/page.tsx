'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ArrowRight, RefreshCw, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ticketService } from '@/services/ticket.service';
import { teamService } from '@/services/team.service';

const PRIORITY_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  LOW: 'outline', MEDIUM: 'default', HIGH: 'secondary', URGENT: 'destructive',
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'مفتوحة', IN_PROGRESS: 'قيد المعالجة', RESOLVED: 'تم الحل', CLOSED: 'مغلقة',
};

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const { data: ticket, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['ticket', params.id],
    queryFn: () => ticketService.getTicket(params.id),
    enabled: !!params.id,
  });

  const { data: members } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => teamService.getMembers(),
    staleTime: 5 * 60 * 1000,
  });

  const [editStatus, setEditStatus] = useState<string>('');
  const [editPriority, setEditPriority] = useState<string>('');
  const [editAssignedTo, setEditAssignedTo] = useState<string>('');

  async function handleSave() {
    if (!ticket) return;
    setIsSaving(true);
    try {
      const updateData: any = {};
      if (editStatus && editStatus !== ticket.status) updateData.status = editStatus;
      if (editPriority && editPriority !== ticket.priority) updateData.priority = editPriority;
      if (editAssignedTo !== undefined && editAssignedTo !== (ticket.assignedTo || '')) {
        updateData.assignedTo = editAssignedTo || null;
      }
      if (Object.keys(updateData).length > 0) {
        await ticketService.updateTicket(params.id, updateData);
        queryClient.invalidateQueries({ queryKey: ['ticket', params.id] });
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل حفظ التغييرات');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <p className="text-sm text-destructive">{error instanceof Error ? error.message : 'فشل تحميل التذكرة'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="ml-2 h-4 w-4" />إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowRight className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-2xl font-bold">{ticket.subject}</h1>
          <p className="text-sm text-muted-foreground">تذكرة #{ticket.id.slice(0, 8)}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">الأولوية</p>
              <Badge variant={PRIORITY_VARIANTS[ticket.priority] ?? 'outline'} className="mt-1">{ticket.priority}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الحالة</p>
              <p className="text-sm font-medium mt-1">{STATUS_LABELS[ticket.status] ?? ticket.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">المسؤول</p>
              <p className="text-sm font-medium mt-1">{ticket.assignee?.name ?? 'غير معين'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">التاريخ</p>
              <p className="text-sm font-medium mt-1">{new Date(ticket.createdAt).toLocaleDateString('ar-SA')}</p>
            </div>
          </div>
          {ticket.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">الوصف</p>
              <p className="text-sm">{ticket.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">تحديث التذكرة</CardTitle></CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">الحالة</label>
              <Select value={editStatus || ticket.status} onValueChange={setEditStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">مفتوحة</SelectItem>
                  <SelectItem value="IN_PROGRESS">قيد المعالجة</SelectItem>
                  <SelectItem value="RESOLVED">تم الحل</SelectItem>
                  <SelectItem value="CLOSED">مغلقة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الأولوية</label>
              <Select value={editPriority || ticket.priority} onValueChange={setEditPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">منخفضة</SelectItem>
                  <SelectItem value="MEDIUM">متوسطة</SelectItem>
                  <SelectItem value="HIGH">عالية</SelectItem>
                  <SelectItem value="URGENT">عاجلة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">تعيين إلى</label>
              <Select value={editAssignedTo || ticket.assignedTo || ''} onValueChange={setEditAssignedTo}>
                <SelectTrigger><SelectValue placeholder="اختر وكيلاً" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">غير معين</SelectItem>
                  {members?.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name} ({m.role === 'ADMIN' ? 'مدير' : 'وكيل'})</SelectItem>
                  )) ?? []}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="mt-4" onClick={handleSave} disabled={isSaving}>
            <Save className="ml-2 h-4 w-4" />{isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}