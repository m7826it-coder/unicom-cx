'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MemberList from '@/components/team/member-list';
import InviteMemberDialog from '@/components/team/invite-member-dialog';
import { authService } from '@/services/auth.service';
export const dynamic = 'force-dynamic';
export default function TeamPage() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const { data: me } = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => authService.getMe(),
    staleTime: 5 * 60 * 1000,
  });

  const isAdmin = me?.user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الفريق</h1>
          <p className="text-sm text-muted-foreground">إدارة أعضاء فريق الدعم</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="ml-2 h-4 w-4" />
            دعوة عضو
          </Button>
        )}
      </div>

      <MemberList isAdmin={isAdmin} />

      <InviteMemberDialog isOpen={isInviteDialogOpen} onClose={() => setIsInviteDialogOpen(false)} />
    </div>
  );
}
