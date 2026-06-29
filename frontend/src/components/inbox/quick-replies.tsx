'use client';

import { Button } from '@/components/ui/button';

interface QuickRepliesProps {
  onSelect: (content: string) => void;
}

const DEFAULT_QUICK_REPLIES = [
  'مرحبًا، كيف يمكنني مساعدتك؟',
  'شكرًا لتواصلك معنا',
  'جارٍ التحقق من طلبك',
  'تم استلام طلبك بنجاح',
];

export default function QuickReplies({ onSelect }: QuickRepliesProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-3 py-2">
      {DEFAULT_QUICK_REPLIES.map((reply) => (
        <Button
          key={reply}
          variant="outline"
          size="sm"
          className="whitespace-nowrap text-xs"
          onClick={() => onSelect(reply)}
        >
          {reply}
        </Button>
      ))}
    </div>
  );
}