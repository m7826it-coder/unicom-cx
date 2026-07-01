'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ConversationFilters as Filters } from '@/types/inbox.types';

interface ConversationFiltersProps {
  onFiltersChange: (filters: Filters) => void;
}

export default function ConversationFilters({ onFiltersChange }: ConversationFiltersProps) {
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState<string>('');

  function applyFilters(overrides: Partial<Filters> = {}) {
    const filters: Filters = {};
    const s = overrides.search ?? search;
    const c = overrides.channel ?? channel;
    const st = overrides.status ?? status;
    const a = overrides.assignedTo ?? assignedTo;

    if (s) filters.search = s;
    if (c) filters.channel = c as Filters['channel'];
    if (st) filters.status = st as Filters['status'];
    if (a) filters.assignedTo = a;

    onFiltersChange(filters);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="بحث..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            applyFilters({ search: e.target.value });
          }}
          className="pr-10"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>القناة</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={channel}
            onValueChange={(val) => {
              setChannel(val);
              applyFilters({ channel: val as Filters['channel'] });
            }}
          >
            <DropdownMenuRadioItem value="">الكل</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="WHATSAPP">واتساب</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="INSTAGRAM">إنستغرام</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="TELEGRAM">تيليجرام</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="EMAIL">بريد إلكتروني</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>الحالة</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={status}
            onValueChange={(val) => {
              setStatus(val);
              applyFilters({ status: val as Filters['status'] });
            }}
          >
            <DropdownMenuRadioItem value="">الكل</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="OPEN">مفتوحة</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="CLOSED">مغلقة</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="WAITING">قيد الانتظار</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>التعيين</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={assignedTo}
            onValueChange={(val) => {
              setAssignedTo(val);
              applyFilters({ assignedTo: val as Filters['assignedTo'] });
            }}
          >
            <DropdownMenuRadioItem value="">الكل</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="">غير معينة</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="me">معينة لي</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
