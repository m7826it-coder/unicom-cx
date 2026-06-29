'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X, MessageSquare, Calendar, Hash } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { fetchApi } from '@/services/api-client';
import { cn } from '@/lib/utils';

interface CustomerProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsappPhone: string | null;
  instagramId: string | null;
  telegramId: string | null;
  avatar: string | null;
  totalConversations: number;
  firstSeen: string;
  lastSeen: string;
  satisfactionScore: number | null;
  tags: { id: string; tag: string }[];
  notes: { id: string; content: string; author: { id: string; name: string }; createdAt: string }[];
  recentConversations: { id: string; channel: string; status: string; lastMessageAt: string | null }[];
}

interface CustomerSidebarProps {
  conversationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CustomerSidebar({ conversationId, open, onOpenChange }: CustomerSidebarProps) {
  const queryClient = useQueryClient();
  const [newTag, setNewTag] = useState('');
  const [newNote, setNewNote] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);

  const { data: customer, isLoading, isError } = useQuery<CustomerProfile>({
    queryKey: ['customer', conversationId],
    queryFn: async () => {
      const conversation = await fetchApi<any>(`/inbox/conversations/${conversationId}`);
      const customerId = conversation?.customerId;
      if (!customerId) throw new Error('Customer not found');
      return fetchApi<CustomerProfile>(`/customers/${customerId}`);
    },
    enabled: !!conversationId && open,
  });

  async function handleAddTag() {
    if (!newTag.trim() || !customer) return;
    setIsAddingTag(true);
    try {
      await fetchApi(`/customers/${customer.id}/tags`, { method: 'POST', body: JSON.stringify({ tag: newTag.trim() }) });
      queryClient.invalidateQueries({ queryKey: ['customer', conversationId] });
      setNewTag('');
    } catch (err) {
      console.error('Failed to add tag', err);
    } finally {
      setIsAddingTag(false);
    }
  }

  async function handleRemoveTag(tag: string) {
    if (!customer) return;
    try {
      await fetchApi(`/customers/${customer.id}/tags/${encodeURIComponent(tag)}`, { method: 'DELETE' });
      queryClient.invalidateQueries({ queryKey: ['customer', conversationId] });
    } catch (err) {
      console.error('Failed to remove tag', err);
    }
  }

  async function handleAddNote() {
    if (!newNote.trim() || !customer) return;
    setIsAddingNote(true);
    try {
      await fetchApi(`/customers/${customer.id}/notes`, { method: 'POST', body: JSON.stringify({ content: newNote.trim() }) });
      queryClient.invalidateQueries({ queryKey: ['customer', conversationId] });
      setNewNote('');
    } catch (err) {
      console.error('Failed to add note', err);
    } finally {
      setIsAddingNote(false);
    }
  }

  const initials = customer?.name
    ? customer.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : '؟';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm overflow-y-auto">
        <SheetHeader className="text-right mb-4">
          <SheetTitle>ملف العميل</SheetTitle>
        </SheetHeader>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-3 w-24 mx-auto" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {isError && <div className="text-center text-sm text-destructive py-8">فشل تحميل بيانات العميل</div>}

        {customer && (
          <div className="space-y-6">
            <div className="text-center">
              <Avatar className="h-16 w-16 mx-auto mb-2">
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold">{customer.name}</h3>
              {customer.email && <p className="text-sm text-muted-foreground">{customer.email}</p>}
              {customer.phone && <p className="text-sm text-muted-foreground">{customer.phone}</p>}
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">القنوات المرتبطة</h4>
              <div className="flex gap-2 flex-wrap">
                {customer.whatsappPhone && <Badge variant="secondary">📱 واتساب</Badge>}
                {customer.instagramId && <Badge variant="secondary">📷 إنستغرام</Badge>}
                {customer.telegramId && <Badge variant="secondary">✈️ تيليجرام</Badge>}
                {customer.email && <Badge variant="secondary">📧 بريد إلكتروني</Badge>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-muted rounded-lg p-3">
                <MessageSquare className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold tabular-nums">{customer.totalConversations}</p>
                <p className="text-xs text-muted-foreground">محادثة</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <Calendar className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-medium">{new Date(customer.firstSeen).toLocaleDateString('ar-SA')}</p>
                <p className="text-xs text-muted-foreground">أول ظهور</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <Hash className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold tabular-nums">{customer.satisfactionScore?.toFixed(1) ?? '—'}</p>
                <p className="text-xs text-muted-foreground">التقييم</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">الوسوم</h4>
              <div className="flex flex-wrap gap-1 mb-2">
                {customer.tags?.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="gap-1">
                    {tag.tag}
                    <button onClick={() => handleRemoveTag(tag.tag)} className="hover:text-destructive ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {(!customer.tags || customer.tags.length === 0) && <p className="text-xs text-muted-foreground">لا توجد وسوم</p>}
              </div>
              <div className="flex gap-2">
                <Input placeholder="وسم جديد..." value={newTag} onChange={(e) => setNewTag(e.target.value)} className="h-8 text-sm" onKeyDown={(e) => e.key === 'Enter' && handleAddTag()} />
                <Button size="sm" variant="ghost" onClick={handleAddTag} disabled={isAddingTag || !newTag.trim()}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">الملاحظات الداخلية</h4>
              <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
                {customer.notes?.map((note) => (
                  <div key={note.id} className="bg-muted rounded-lg p-2 text-sm">
                    <p>{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">{note.author.name} · {new Date(note.createdAt).toLocaleDateString('ar-SA')}</p>
                  </div>
                ))}
                {(!customer.notes || customer.notes.length === 0) && <p className="text-xs text-muted-foreground">لا توجد ملاحظات</p>}
              </div>
              <div className="flex gap-2">
                <Input placeholder="أضف ملاحظة..." value={newNote} onChange={(e) => setNewNote(e.target.value)} className="h-8 text-sm" onKeyDown={(e) => e.key === 'Enter' && handleAddNote()} />
                <Button size="sm" variant="ghost" onClick={handleAddNote} disabled={isAddingNote || !newNote.trim()}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">آخر المحادثات</h4>
              <div className="space-y-1">
                {customer.recentConversations?.map((conv) => (
                  <a
                    key={conv.id}
                    href={`/dashboard/inbox/${conv.id}`}
                    className={cn(
                      'flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors',
                      conv.id === conversationId && 'bg-accent'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span>{conv.channel === 'WHATSAPP' ? '📱' : conv.channel === 'INSTAGRAM' ? '📷' : conv.channel === 'TELEGRAM' ? '✈️' : '📧'}</span>
                      <span className="text-muted-foreground text-xs font-mono">{conv.id.slice(0, 8)}...</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString('ar-SA') : ''}</span>
                  </a>
                ))}
                {(!customer.recentConversations || customer.recentConversations.length === 0) && <p className="text-xs text-muted-foreground">لا توجد محادثات سابقة</p>}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}