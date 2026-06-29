'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChannelList from '@/components/channels/channel-list';
import ConnectChannelDialog from '@/components/channels/connect-channel-dialog';

export default function ChannelsPage() {
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">القنوات</h1>
          <p className="text-sm text-muted-foreground">إدارة القنوات المربوطة بالمنصة</p>
        </div>
        <Button onClick={() => setIsConnectDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />ربط قناة جديدة
        </Button>
      </div>

      <ChannelList />

      <ConnectChannelDialog isOpen={isConnectDialogOpen} onClose={() => setIsConnectDialogOpen(false)} />
    </div>
  );
}