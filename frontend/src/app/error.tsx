'use client';

import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">حدث خطأ غير متوقع</h2>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button onClick={reset}>إعادة المحاولة</Button>
      </div>
    </div>
  );
}