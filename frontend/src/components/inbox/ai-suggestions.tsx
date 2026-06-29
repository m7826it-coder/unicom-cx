'use client';

import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AISuggestionsProps {
  onSelect: (content: string) => void;
}

export default function AISuggestions({ onSelect }: AISuggestionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const suggestions = [
    { label: 'مختصرة', text: 'شكرًا لتواصلك. تم استلام طلبك.' },
    { label: 'احترافية', text: 'نشكر تواصلكم معنا. تم استلام طلبكم وسيتم معالجته خلال 24 ساعة.' },
    { label: 'دافئة', text: 'أهلاً بك! 🌟 شكرًا على تواصلك، تم استلام طلبك وسنبدأ العمل عليه فورًا.' },
  ];

  return (
    <div className="border-b">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          اقتراحات الذكاء الاصطناعي
        </span>
        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {isExpanded && (
        <div className="flex gap-2 overflow-x-auto px-3 pb-2">
          {suggestions.map((s) => (
            <Button
              key={s.label}
              variant="ghost"
              size="sm"
              className="whitespace-nowrap text-xs border hover:bg-primary/5 hover:border-primary/30"
              onClick={() => onSelect(s.text)}
            >
              <Sparkles className="ml-1 h-3 w-3" />
              {s.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}