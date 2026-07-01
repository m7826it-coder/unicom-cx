'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TicketList from '@/components/tickets/ticket-list';
import CreateTicketDialog from '@/components/tickets/create-ticket-dialog';
export const dynamic = 'force-dynamic';
export default function TicketsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">التذاكر</h1>
          <p className="text-sm text-muted-foreground">إدارة تذاكر الدعم والتصعيد</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />إنشاء تذكرة
        </Button>
      </div>

      <TicketList />

      <CreateTicketDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />
    </div>
  );
}
