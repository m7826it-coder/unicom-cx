'use client';

import { useState } from 'react';
import { ArrowRight, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConversationList from '@/components/inbox/conversation-list';

export default function InboxPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showConversation, setShowConversation] = useState(false);

  function handleSelectConversation(id: string) {
    setSelectedConversationId(id);
    setShowConversation(true);
  }

  function handleBackToList() {
    setShowConversation(false);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6">
      <div className={`${showConversation ? 'hidden' : 'block'} md:block md:w-[320px] lg:w-[380px] shrink-0 border-l`}>
        <ConversationList
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversationId ?? undefined}
        />
      </div>

      <div className={`${!showConversation ? 'hidden' : 'flex'} md:flex flex-1 flex-col items-center justify-center bg-muted/30`}>
        {!selectedConversationId ? (
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Inbox className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">اختر محادثة</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              اختر محادثة من القائمة لبدء المراسلة مع العملاء
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <p className="text-sm text-muted-foreground">نافذة المحادثة قيد التطوير...</p>
            <Button variant="outline" size="sm" onClick={handleBackToList} className="md:hidden">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة للقائمة
            </Button>
          </div>
        )}

        {showConversation && (
          <div className="md:hidden absolute top-4 right-4">
            <Button variant="ghost" size="icon" onClick={handleBackToList}>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}