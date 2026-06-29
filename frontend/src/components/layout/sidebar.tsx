'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  Ticket,
  Users,
  MessageCircle,
  Smile,
  Settings,
  PanelLeftClose,
  PanelLeft,
  MessageSquareText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSidebarStore } from '@/stores/sidebar.store';

const links = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/dashboard/inbox', label: 'صندوق الوارد', icon: Inbox, badge: 5 },
  { href: '/dashboard/tickets', label: 'التذاكر', icon: Ticket },
  { href: '/dashboard/team', label: 'الفريق', icon: Users },
  { href: '/dashboard/channels', label: 'القنوات', icon: MessageCircle },
  { href: '/dashboard/csat', label: 'استبيانات الرضا', icon: Smile },
  { href: '/dashboard/settings', label: 'الإعدادات', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle, close } = useSidebarStore();

  return (
    <aside className={cn('fixed top-0 right-0 z-40 flex h-screen flex-col border-l bg-card text-card-foreground shadow-sm transition-all duration-300', isOpen ? 'w-64' : 'w-20')}>
      <div className="flex h-16 items-center justify-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={close}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <MessageSquareText className="h-5 w-5 text-primary-foreground" />
          </div>
          {isOpen && <span className="text-lg font-bold tracking-tight">UniCom CX</span>}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1.5">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link href={link.href} onClick={close} className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground', !isOpen && 'justify-center px-2')} title={link.label}>
                  <Icon className="h-5 w-5 shrink-0" />
                  {isOpen && (
                    <>
                      <span className="flex-1 truncate">{link.label}</span>
                      {link.badge && <Badge variant="secondary" className="h-5 min-w-5 rounded-full px-1.5 text-xs">{link.badge}</Badge>}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t p-3">
        <Button variant="ghost" size="icon" className={cn('w-full', isOpen ? 'justify-start px-3' : 'justify-center')} onClick={toggle}>
          {isOpen ? (
            <>
              <PanelLeftClose className="h-5 w-5" />
              <span className="mr-2 text-sm font-medium">طي القائمة</span>
            </>
          ) : (
            <PanelLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
    </aside>
  );
}