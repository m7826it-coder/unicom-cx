import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">الصفحة غير موجودة</h2>
        <p className="text-sm text-muted-foreground">عذرًا، الصفحة التي تبحث عنها غير موجودة.</p>
        <Button asChild>
          <Link href="/dashboard">العودة للرئيسية</Link>
        </Button>
      </div>
    </div>
  );
}