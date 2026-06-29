'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { teamService } from '@/services/team.service';
import type { TeamMember } from '@/types/team.types';

interface MemberListProps {
  isAdmin: boolean;
}

export default function MemberList({ isAdmin }: MemberListProps) {
  const queryClient = useQueryClient();
  const { data: members, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => teamService.getMembers(),
    staleTime: 30_000,
  });

  async function handleRemove(userId: string, name: string) {
    if (!confirm(`هل أنت متأكد من إزالة ${name} من الفريق؟`)) return;
    try {
      await teamService.removeMember(userId);
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل إزالة العضو');
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <p className="text-sm text-destructive">{error instanceof Error ? error.message : 'فشل تحميل أعضاء الفريق'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="ml-2 h-4 w-4" />إعادة المحاولة
        </Button>
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-muted-foreground">لا يوجد أعضاء بعد</p>
        <p className="text-xs text-muted-foreground mt-1">قم بدعوة أعضاء جدد للانضمام إلى فريق الدعم</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {member.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{member.name}</p>
            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
          </div>
          <Badge variant={member.role === 'ADMIN' ? 'default' : 'secondary'}>
            {member.role === 'ADMIN' ? 'مدير' : 'وكيل'}
          </Badge>
          <span className="text-xs text-muted-foreground hidden md:block">
            {new Date(member.createdAt).toLocaleDateString('ar-SA')}
          </span>
          {isAdmin && member.role !== 'ADMIN' && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => handleRemove(member.id, member.name)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}