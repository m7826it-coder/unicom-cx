'use client';

import SurveyList from '@/components/csat/survey-list';
export const dynamic = 'force-dynamic';
export default function CSATPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">استبيانات الرضا</h1>
        <p className="text-sm text-muted-foreground">متابعة تقييمات العملاء ورضاهم</p>
      </div>
      <SurveyList />
    </div>
  );
}
