'use client';

import { type ReactNode } from 'react';
import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/topbar';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useWebSocket } from '@/hooks/use-websocket';
import { cn } from '@/lib/utils';
import { WifiOff } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isOpen } = useSidebarStore();
  const { isConnected } = useWebSocket();

  return (
    <div className="flex min-h-screen">
      {!isConnected && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-destructive px-4 py-1.5 text-xs text-destructive-foreground shadow-sm">
          <WifiOff className="h-3 w-3" />
          انقطع الاتصال بالخادم – جاري إعادة الاتصال...
        </div>
      )}

      <Sidebar />

      <div className={cn('flex flex-1 flex-col transition-all duration-300', isOpen ? 'mr-64' : 'mr-20')}>
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}