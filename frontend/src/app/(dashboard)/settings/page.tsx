'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Plus, Trash2, RefreshCw, Sparkles, Building2, BookOpen, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { authService } from '@/services/auth.service';
import { fetchApi } from '@/services/api-client';
import type { AuthMeResponse } from '@/types/auth.types';

const CHANNEL_OPTIONS = [
  { value: 'WHATSAPP', label: '📱 واتساب' },
  { value: 'INSTAGRAM', label: '📷 إنستغرام' },
  { value: 'TELEGRAM', label: '✈️ تيليجرام' },
  { value: 'EMAIL', label: '📧 بريد إلكتروني' },
];

const botSettingsSchema = z.object({
  enabled: z.boolean(),
  channels: z.array(z.string()).min(1, 'اختر قناة واحدة على الأقل'),
  confidenceThreshold: z.coerce.number().min(0).max(1),
  welcomeMessage: z.string().min(1, 'رسالة الترحيب مطلوبة'),
  escalationMessage: z.string().min(1, 'رسالة التصعيد مطلوبة'),
});

type BotSettingsFormData = z.infer<typeof botSettingsSchema>;

const kbEntrySchema = z.object({
  question: z.string().min(1, 'السؤال مطلوب'),
  answer: z.string().min(1, 'الجواب مطلوب'),
});

type KBEntryFormData = z.infer<typeof kbEntrySchema>;

interface KnowledgeBaseEntry {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  source: string;
  createdAt: string;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: me, isLoading: meLoading } = useQuery<AuthMeResponse>({
    queryKey: ['auth-me'],
    queryFn: () => authService.getMe(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: botSettings, isLoading: botLoading, isError: botError, refetch: refetchBot } = useQuery<BotSettingsFormData>({
    queryKey: ['bot-settings'],
    queryFn: () => fetchData<BotSettingsFormData>('/ai/settings'),
  });

  const {
    register: registerBot,
    handleSubmit: handleSubmitBot,
    setValue: setBotValue,
    watch: watchBot,
    formState: { errors: botErrors, isDirty: botDirty },
  } = useForm<BotSettingsFormData>({
    resolver: zodResolver(botSettingsSchema),
    values: botSettings ?? { enabled: false, channels: [], confidenceThreshold: 0.8, welcomeMessage: '', escalationMessage: 'سيتم تحويلك إلى وكيل للمساعدة.' },
  });

  const botEnabled = watchBot('enabled');
  const botChannels = watchBot('channels');

  const saveBotMutation = useMutation({
    mutationFn: (data: BotSettingsFormData) => fetchApi('/ai/settings', { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bot-settings'] }); },
  });

  function toggleChannel(channel: string) {
    const current = botChannels ?? [];
    if (current.includes(channel)) setBotValue('channels', current.filter((c) => c !== channel), { shouldDirty: true });
    else setBotValue('channels', [...current, channel], { shouldDirty: true });
  }

  async function onBotSubmit(data: BotSettingsFormData) {
    await saveBotMutation.mutateAsync(data);
  }

  const { data: kbEntries, isLoading: kbLoading, isError: kbError, refetch: refetchKB } = useQuery<KnowledgeBaseEntry[]>({
    queryKey: ['kb-entries'],
    queryFn: () => fetchApi<KnowledgeBaseEntry[]>('/ai/knowledge-base'),
  });

  const [showKBForm, setShowKBForm] = useState(false);
  const {
    register: registerKB,
    handleSubmit: handleSubmitKB,
    reset: resetKB,
    formState: { errors: kbErrors },
  } = useForm<KBEntryFormData>({ resolver: zodResolver(kbEntrySchema) });

  const addKBMutation = useMutation({
    mutationFn: (data: KBEntryFormData) => fetchApi('/ai/knowledge-base', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['kb-entries'] }); setShowKBForm(false); resetKB(); },
  });

  const deleteKBMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/ai/knowledge-base/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kb-entries'] }),
  });

  const toggleKBMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => fetchApi(`/ai/knowledge-base/${id}/toggle`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kb-entries'] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الإعدادات</h1>
        <p className="text-sm text-muted-foreground">إدارة إعدادات المنصة والذكاء الاصطناعي</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Building2 className="h-5 w-5" />إعدادات المنظمة</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {meLoading ? (
            <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
          ) : (
            <>
              <div className="space-y-2"><label className="text-sm font-medium">اسم المنظمة</label><Input value={me?.organization?.name ?? ''} disabled /></div>
              <div className="space-y-2"><label className="text-sm font-medium">البريد الإلكتروني للمدير</label><Input value={me?.user?.email ?? ''} disabled /></div>
              <div className="space-y-2"><label className="text-sm font-medium">خطة الاشتراك</label><Input value={me?.organization?.plan ?? ''} disabled className="capitalize" /></div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Bot className="h-5 w-5" />إعدادات الروبوت (Gemini Agent)</CardTitle></CardHeader>
        <CardContent>
          {botLoading ? (
            <div className="space-y-4"><Skeleton className="h-6 w-32" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
          ) : botError ? (
            <div className="flex flex-col items-center gap-3 py-4"><p className="text-sm text-destructive">فشل تحميل إعدادات الروبوت</p><Button variant="outline" size="sm" onClick={() => refetchBot()}><RefreshCw className="ml-2 h-4 w-4" />إعادة المحاولة</Button></div>
          ) : (
            <form onSubmit={handleSubmitBot(onBotSubmit)} className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">تفعيل الروبوت الذكي</label>
                <Switch checked={botEnabled} onCheckedChange={(val) => setBotValue('enabled', val, { shouldDirty: true })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">القنوات المفعّل عليها</label>
                <div className="flex flex-wrap gap-2">
                  {CHANNEL_OPTIONS.map((ch) => (
                    <Badge key={ch.value} variant={(botChannels ?? []).includes(ch.value) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleChannel(ch.value)}>{ch.label}</Badge>
                  ))}
                </div>
                {botErrors.channels && <p className="text-xs text-destructive">{botErrors.channels.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">حد الثقة (0.0 - 1.0)</label>
                <Input type="number" step="0.05" min="0" max="1" {...registerBot('confidenceThreshold')} />
                {botErrors.confidenceThreshold && <p className="text-xs text-destructive">{botErrors.confidenceThreshold.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">رسالة الترحيب</label>
                <Input placeholder="مرحبًا! كيف يمكنني مساعدتك؟" {...registerBot('welcomeMessage')} />
                {botErrors.welcomeMessage && <p className="text-xs text-destructive">{botErrors.welcomeMessage.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">رسالة التصعيد</label>
                <Input placeholder="سيتم تحويلك إلى وكيل للمساعدة." {...registerBot('escalationMessage')} />
                {botErrors.escalationMessage && <p className="text-xs text-destructive">{botErrors.escalationMessage.message}</p>}
              </div>
              <Button type="submit" disabled={!botDirty || saveBotMutation.isPending}><Save className="ml-2 h-4 w-4" />{saveBotMutation.isPending ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg"><BookOpen className="h-5 w-5" />قاعدة المعرفة</CardTitle>
          <Button size="sm" onClick={() => setShowKBForm(!showKBForm)}><Plus className="ml-2 h-4 w-4" />إضافة سؤال</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showKBForm && (
            <form onSubmit={handleSubmitKB((data) => addKBMutation.mutateAsync(data))} className="space-y-3 border rounded-lg p-4">
              <div className="space-y-2"><label className="text-sm font-medium">السؤال</label><Input placeholder="ما سياسة الاسترجاع؟" {...registerKB('question')} />{kbErrors.question && <p className="text-xs text-destructive">{kbErrors.question.message}</p>}</div>
              <div className="space-y-2"><label className="text-sm font-medium">الجواب</label><Input placeholder="يمكنك استرجاع المنتج خلال 14 يوم..." {...registerKB('answer')} />{kbErrors.answer && <p className="text-xs text-destructive">{kbErrors.answer.message}</p>}</div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={addKBMutation.isPending}>{addKBMutation.isPending ? 'جاري الإضافة...' : 'إضافة'}</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowKBForm(false)}>إلغاء</Button>
              </div>
            </form>
          )}
          {kbLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="flex items-center gap-4 p-4 border rounded-lg"><div className="flex-1 space-y-2"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-64" /></div><Skeleton className="h-6 w-12 rounded-full" /></div>))}</div>
          ) : kbError ? (
            <div className="flex flex-col items-center gap-3 py-4"><p className="text-sm text-destructive">فشل تحميل قاعدة المعرفة</p><Button variant="outline" size="sm" onClick={() => refetchKB()}><RefreshCw className="ml-2 h-4 w-4" />إعادة المحاولة</Button></div>
          ) : !kbEntries || kbEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center"><BookOpen className="h-8 w-8 text-muted-foreground mb-2" /><p className="text-sm font-medium text-muted-foreground">لا توجد أسئلة في قاعدة المعرفة بعد</p><p className="text-xs text-muted-foreground mt-1">أضف أسئلة وأجوبة لتدريب الروبوت الذكي</p></div>
          ) : (
            <div className="space-y-3">
              {kbEntries.map((entry) => (
                <div key={entry.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1"><Sparkles className="h-3.5 w-3.5 text-primary shrink-0" /><p className="text-sm font-medium truncate">{entry.question}</p></div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{entry.answer}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{entry.source === 'MANUAL' ? 'يدوي' : entry.source === 'PDF' ? 'PDF' : 'مقترح'}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={entry.isActive} onCheckedChange={() => toggleKBMutation.mutateAsync({ id: entry.id })} />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) deleteKBMutation.mutateAsync(entry.id); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
