# UniCom CX Frontend Architecture

## نظرة عامة
تطبيق UniCom CX Frontend هو واجهة PWA مبنية بـ Next.js 14 (App Router) و React 18 و TypeScript و Tailwind CSS و shadcn/ui.

## التقنيات الرئيسية
- **الإطار:** Next.js 14 (App Router)
- **اللغة:** TypeScript strict
- **التنسيق:** Tailwind CSS 3 + shadcn/ui (Radix UI)
- **إدارة الحالة:** React Query (لبيانات الخادم)، Zustand (للحالة المحلية)
- **النماذج:** React Hook Form + Zod
- **التواصل الحي:** Socket.io Client
- **الرسوم البيانية:** Recharts
- **التنسيق الزمني:** date-fns
- **الاختبارات:** Jest + React Testing Library

## هيكل المجلدات