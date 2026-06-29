'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Menu,
  Sun,
  Moon,
  Languages,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebarStore } from '@/stores/sidebar.store';
import { authService } from '@/services/auth.service';
import type { UserResponse } from '@/types/auth.types';

export default function Topbar() {
  const router = useRouter();
  const { toggle } = useSidebarStore();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    async function loadUser() {
      try {
        const result = await authService.getMe();
        setUser(result.user);
      } catch {}
    }
    loadUser();
  }, []);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    setTheme(next);
    localStorage.setItem('theme', next);
  }, [theme]);

  const toggleLocale = useCallback(() => {
    const next = locale === 'ar' ? 'en' : 'ar';
    setLocale(next);
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
    localStorage.setItem('locale', next);
  }, [locale]);

  async function handleLogout() {
    try {
      await authService.logout();
    } catch {}
    router.push('/login');
  }

  const userInitials = user?.name
    ? user.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggle} aria-label="فتح القائمة">
        <Menu className="h-5 w-5" />
      </Button>

      <nav className="hidden items-center gap-1.5 text-sm text-muted-foreground md:flex">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">لوحة التحكم</Link>
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">الرئيسية</span>
      </nav>

      <div className="flex-1" />

      <Button variant="ghost" size="icon" onClick={toggleLocale} className="hidden sm:flex" aria-label="تغيير اللغة">
        <Languages className="h-5 w-5" />
      </Button>

      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="تغيير المظهر">
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-accent">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar ?? undefined} alt={user?.name ?? 'المستخدم'} />
              <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="hidden flex-col items-start text-sm md:flex">
              <span className="font-medium">{user?.name ?? 'جاري التحميل...'}</span>
              <span className="text-xs text-muted-foreground">{user?.role === 'ADMIN' ? 'مدير' : 'وكيل'}</span>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{user?.name ?? 'المستخدم'}</span>
              <span className="text-xs font-normal text-muted-foreground">{user?.email ?? ''}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile" className="cursor-pointer"><User className="ml-2 h-4 w-4" />الملف الشخصي</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings" className="cursor-pointer"><Settings className="ml-2 h-4 w-4" />الإعدادات</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="ml-2 h-4 w-4" />تسجيل الخروج
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}