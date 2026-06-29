'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatWindow from '@/components/inbox/chat-window';

export default function InboxConversationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const conversationId = params?.id;

  if (!conversationId) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-medium">المحادثة غير موجودة</p>
          <p className="text-sm text-muted-foreground">معرف المحادثة غير صالح</p>
          <Button variant="outline" onClick={() => router.push('/dashboard/inbox')}>
            <ArrowRight className="ml-2 h-4 w-4" />العودة إلى القائمة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-6">
      <div className="md:hidden border-b px-4 py-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/inbox')}>
          <ArrowRight className="ml-2 h-4 w-4" />العودة إلى القائمة
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatWindow conversationId={conversationId} />
      </div>
    </div>
  );
}