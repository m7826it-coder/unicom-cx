# 🚀 UniCom CX – Omnichannel Customer Experience Automation

منصة SaaS لتجربة العملاء متعددة القنوات. توحد المنصة تواصل الشركات مع عملائها عبر واتساب، إنستغرام، تيليجرام، والبريد الإلكتروني في صندوق وارد واحد، مع أتمتة ذكية مدعومة بـ Google Gemini Flash-Lite.

---

## 📋 المتطلبات

- **Node.js** 20+
- **Docker** و Docker Compose (للتطوير المحلي)
- **PostgreSQL** 16 (أو Supabase للإنتاج)
- **Redis** 7 (أو Upstash Redis للإنتاج)

---

## 🛠️ التشغيل المحلي

### 1. استنساخ المستودع

```bash
git clone https://github.com/your-username/unicom-cx.git
cd unicom-cx




unicom-cx/
│
├── .github/
│   └── workflows/
│       └── ci.yml                                # GitHub Actions CI/CD Pipeline
│
├── docs/
│   ├── architecture.md                           # التصميم المعماري (C4, Hybrid, Modules)
│   ├── events.md                                 # كتالوج الأحداث والطوابير
│   ├── api-style-guide.md                        # دليل أسلوب REST API (RFC 7807)
│   ├── coding-standard.md                        # معايير الكود (ESLint, Naming, ...)
│   ├── security.md                               # السياسات الأمنية (JWT, AES, GDPR)
│   ├── database.md                               # تصميم قاعدة البيانات (ERD, Indexes)
│   ├── openapi.yaml                              # توثيق OpenAPI 3.0 كامل
│   ├── production-readiness-v2.md                # تقرير الجاهزية للإنتاج (V2)
│   ├── frontend-architecture.md                  # توثيق معماري للواجهة الأمامية
│   └── contracts/
│       ├── auth.types.ts                         # عقود أنواع المصادقة
│       ├── inbox.types.ts                        # عقود أنواع صندوق الوارد
│       ├── ai.types.ts                           # عقود أنواع الذكاء الاصطناعي
│       ├── ticket.types.ts                       # عقود أنواع التذاكر
│       └── csat.types.ts                         # عقود أنواع استبيانات الرضا
│
├── prisma/
│   ├── schema.prisma                             # مخطط قاعدة البيانات (12 نموذج)
│   └── migrations/
│       └── 20260628000000_add_gin_index_customer_name/
│           └── migration.sql                     # إضافة فهرس GIN للبحث النصي
│
├── scripts/
│   └── backup.sh                                 # سكريبت نسخ احتياطي (pg_dump)
│
├── src/
│   ├── server.ts                                 # نقطة الدخول: HTTP + WebSocket
│   ├── app.ts                                    # تجميع Express: Middleware + Routes
│   │
│   ├── config/
│   │   ├── env.ts                                # تحميل dotenv + Secret Manager
│   │   ├── database.ts                           # Prisma Client (Singleton)
│   │   ├── redis.ts                              # ioredis Client (Singleton)
│   │   ├── gemini.ts                             # إعدادات Google Gemini API
│   │   ├── bullmq.ts                             # إعدادات BullMQ + createQueue()
│   │   ├── secrets.ts                            # تحميل الأسرار (GCP Secret Manager)
│   │   └── prisma.middleware.ts                  # حقن orgId تلقائيًا (Tenant Isolation)
│   │
│   ├── common/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts                 # مصادقة JWT + إبطال (Blacklist)
│   │   │   ├── role.middleware.ts                 # صلاحيات (requireRole)
│   │   │   ├── errorHandler.middleware.ts         # معالج أخطاء RFC 7807
│   │   │   ├── idempotency.middleware.ts          # منع تكرار العمليات
│   │   │   └── rateLimiter.middleware.ts          # حماية من هجمات التخمين
│   │   ├── queues/
│   │   │   ├── index.ts                           # تجميع جميع الطوابير
│   │   │   ├── inbound.queue.ts                   # طابور الرسائل الواردة
│   │   │   ├── outbound.queue.ts                  # طابور الرسائل الصادرة
│   │   │   ├── ai-analysis.queue.ts              # طابور تحليل AI
│   │   │   ├── notification.queue.ts             # طابور إشعارات WebSocket
│   │   │   ├── csat.queue.ts                      # طابور استبيانات الرضا
│   │   │   └── ticket.queue.ts                    # طابور التذاكر
│   │   ├── events/
│   │   │   └── events.ts                          # ثوابت أسماء الأحداث
│   │   └── utils/
│   │       ├── ApiError.ts                        # صنف أخطاء RFC 7807
│   │       ├── logger.ts                          # Pino Structured Logger
│   │       ├── responseHelper.ts                  # دوال تنسيق الاستجابات
│   │       └── health.ts                          # فحوص صحة (DB, Redis)
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.service.ts                    # منطق المصادقة
│   │   │   ├── auth.controller.ts                 # طبقة HTTP
│   │   │   ├── auth.routes.ts                     # مسارات /auth
│   │   │   └── auth.validators.ts                 # express-validator
│   │   ├── team/
│   │   │   ├── team.service.ts                    # إدارة الفريق والدعوات
│   │   │   └── team.routes.ts                     # مسارات /team
│   │   ├── inbox/
│   │   │   ├── inbox.controller.ts                # صندوق الوارد
│   │   │   ├── inbox.routes.ts                    # مسارات /inbox
│   │   │   ├── inbox.gateway.ts                   # Socket.io Gateway
│   │   │   ├── customer.controller.ts             # نقاط نهاية العملاء
│   │   │   ├── customer.routes.ts                 # مسارات /customers
│   │   │   └── services/
│   │   │       ├── customer.service.ts            # ملف العميل الموحد
│   │   │       ├── conversation.service.ts        # إدارة المحادثات
│   │   │       └── message.service.ts             # إدارة الرسائل
│   │   ├── ai/
│   │   │   ├── ai.service.ts                      # استدعاءات Gemini API
│   │   │   ├── ai-admin.service.ts                # إدارة إعدادات الروبوت
│   │   │   ├── ai.controller.ts                   # طبقة HTTP
│   │   │   └── ai.routes.ts                       # مسارات /ai
│   │   ├── tickets/
│   │   │   ├── ticket.service.ts                  # إدارة التذاكر
│   │   │   ├── ticket.controller.ts               # طبقة HTTP
│   │   │   └── ticket.routes.ts                   # مسارات /tickets
│   │   ├── csat/
│   │   │   ├── csat.service.ts                    # استبيانات الرضا
│   │   │   ├── csat.controller.ts                 # طبقة HTTP
│   │   │   └── csat.routes.ts                     # مسارات /csat
│   │   ├── channels/
│   │   │   ├── channels.service.ts                # تشفير بيانات القنوات
│   │   │   ├── channels.controller.ts             # طبقة HTTP
│   │   │   └── channels.routes.ts                 # مسارات /channels
│   │   └── analytics/
│   │       ├── analytics.service.ts               # حسابات لوحة التحكم
│   │       ├── analytics.controller.ts            # طبقة HTTP
│   │       └── analytics.routes.ts                # مسارات /analytics
│   │
│   └── workers/
│       └── notification.worker.ts                 # عامل معالجة إشعارات WebSocket
│
├── functions/
│   └── whatsapp/
│       └── index.ts                               # موصل واتساب السحابي (Webhook)
│
├── terraform/
│   ├── main.tf                                    # موارد GCP (Cloud Run, SQL, Redis)
│   ├── variables.tf                               # متغيرات Terraform
│   └── outputs.tf                                 # مخرجات Terraform
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   │   ├── auth.service.test.ts
│   │   │   ├── customer.service.test.ts
│   │   │   ├── conversation.service.test.ts
│   │   │   ├── message.service.test.ts
│   │   │   ├── ai.service.test.ts
│   │   │   ├── ticket.service.test.ts
│   │   │   ├── csat.service.test.ts
│   │   │   └── team.service.test.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.test.ts
│   │   │   └── errorHandler.middleware.test.ts
│   │   ├── functions/
│   │   │   └── whatsapp.test.ts
│   │   └── utils/
│   │       └── ApiError.test.ts
│   ├── integration/
│   │   └── message-flow.test.ts                  # تكامل تدفق الرسالة
│   └── e2e/
│       └── full-cx-flow.test.ts                  # تدفق CX كامل
│
├── frontend/
│   ├── package.json                               # تبعيات Next.js & React
│   ├── tsconfig.json                              # إعدادات TypeScript strict
│   ├── next.config.ts                             # إعدادات Next.js (standalone)
│   ├── tailwind.config.ts                         # إعدادات Tailwind + Dark Mode
│   ├── postcss.config.js                          # PostCSS
│   ├── components.json                            # إعدادات shadcn/ui
│   ├── jest.config.ts                             # إعدادات Jest
│   │
│   ├── public/
│   │   ├── manifest.json                          # PWA Manifest
│   │   ├── sw.js                                  # Service Worker
│   │   └── icons/
│   │       ├── icon-192x192.png
│   │       └── icon-512x512.png
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                         # Root Layout (PWA + Fonts)
│   │   │   ├── page.tsx                           # توجيه / → /login
│   │   │   ├── globals.css                        # Tailwind + متغيرات CSS
│   │   │   ├── error.tsx                          # صفحة خطأ عامة
│   │   │   ├── not-found.tsx                      # صفحة 404
│   │   │   ├── (auth)/
│   │   │   │   ├── layout.tsx                     # تخطيط المصادقة
│   │   │   │   ├── login/page.tsx                 # صفحة تسجيل الدخول
│   │   │   │   ├── register/page.tsx              # صفحة التسجيل
│   │   │   │   ├── forgot-password/page.tsx       # نسيت كلمة المرور
│   │   │   │   ├── reset-password/page.tsx        # إعادة تعيين كلمة المرور
│   │   │   │   └── accept-invitation/page.tsx     # قبول الدعوة
│   │   │   └── (dashboard)/
│   │   │       ├── layout.tsx                     # تخطيط لوحة التحكم
│   │   │       ├── page.tsx                       # لوحة التحكم الرئيسية
│   │   │       ├── inbox/
│   │   │       │   ├── page.tsx                   # صفحة صندوق الوارد
│   │   │       │   └── [id]/page.tsx              # تفاصيل محادثة
│   │   │       ├── tickets/
│   │   │       │   ├── page.tsx                   # قائمة التذاكر
│   │   │       │   └── [id]/page.tsx              # تفاصيل تذكرة
│   │   │       ├── team/page.tsx                  # إدارة الفريق
│   │   │       ├── channels/page.tsx              # إدارة القنوات
│   │   │       ├── csat/page.tsx                  # استبيانات الرضا
│   │   │       └── settings/page.tsx              # الإعدادات
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                                # مكونات shadcn/ui (13 مكون)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── sheet.tsx
│   │   │   │   ├── switch.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   └── textarea.tsx
│   │   │   ├── layout/
│   │   │   │   ├── sidebar.tsx                    # شريط جانبي
│   │   │   │   └── topbar.tsx                     # شريط علوي
│   │   │   ├── dashboard/
│   │   │   │   ├── stats-card.tsx                 # بطاقة إحصائية
│   │   │   │   ├── channel-pie-chart.tsx          # رسم دائري للقنوات
│   │   │   │   ├── volume-line-chart.tsx          # رسم خطي للحجم
│   │   │   │   └── agent-performance-table.tsx    # جدول أداء الوكلاء
│   │   │   ├── inbox/
│   │   │   │   ├── conversation-list.tsx          # قائمة المحادثات
│   │   │   │   ├── conversation-item.tsx          # عنصر محادثة
│   │   │   │   ├── conversation-filters.tsx       # فلاتر المحادثات
│   │   │   │   ├── inbox-skeleton.tsx             # هيكل تحميل
│   │   │   │   ├── chat-window.tsx                # نافذة المحادثة
│   │   │   │   ├── message-bubble.tsx             # فقاعة رسالة
│   │   │   │   ├── message-input.tsx              # مربع إرسال
│   │   │   │   ├── quick-replies.tsx              # ردود سريعة
│   │   │   │   ├── ai-suggestions.tsx             # اقتراحات AI
│   │   │   │   └── customer-sidebar.tsx           # شريط العميل
│   │   │   ├── team/
│   │   │   │   ├── member-list.tsx                # قائمة الأعضاء
│   │   │   │   └── invite-member-dialog.tsx       # نافذة دعوة
│   │   │   ├── channels/
│   │   │   │   ├── channel-list.tsx               # قائمة القنوات
│   │   │   │   └── connect-channel-dialog.tsx     # نافذة ربط قناة
│   │   │   ├── tickets/
│   │   │   │   ├── ticket-list.tsx                # قائمة التذاكر
│   │   │   │   └── create-ticket-dialog.tsx       # نافذة إنشاء تذكرة
│   │   │   └── csat/
│   │   │       └── survey-list.tsx                # قائمة الاستبيانات
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-conversations.ts               # جلب قائمة المحادثات
│   │   │   ├── use-conversation.ts                # جلب تفاصيل محادثة
│   │   │   ├── use-messages.ts                    # جلب رسائل محادثة
│   │   │   ├── use-send-message.ts                # إرسال رسالة
│   │   │   └── use-websocket.ts                   # اتصال WebSocket
│   │   │
│   │   ├── services/
│   │   │   ├── api-client.ts                      # عميل HTTP موحد (fetch)
│   │   │   ├── auth.service.ts                    # خدمة المصادقة
│   │   │   ├── inbox.service.ts                   # خدمة صندوق الوارد
│   │   │   ├── ticket.service.ts                  # خدمة التذاكر
│   │   │   ├── team.service.ts                    # خدمة الفريق
│   │   │   ├── channel.service.ts                 # خدمة القنوات
│   │   │   ├── csat.service.ts                    # خدمة استبيانات الرضا
│   │   │   └── socket.service.ts                  # خدمة Socket.io
│   │   │
│   │   ├── stores/
│   │   │   └── sidebar.store.ts                   # Zustand لحالة الشريط
│   │   │
│   │   ├── types/
│   │   │   ├── api.types.ts                       # ApiError, Pagination
│   │   │   ├── auth.types.ts                      # أنواع المصادقة
│   │   │   ├── inbox.types.ts                     # أنواع صندوق الوارد
│   │   │   ├── ticket.types.ts                    # أنواع التذاكر
│   │   │   ├── team.types.ts                      # أنواع الفريق
│   │   │   ├── channel.types.ts                   # أنواع القنوات
│   │   │   ├── csat.types.ts                      # أنواع استبيانات الرضا
│   │   │   └── dashboard.types.ts                 # أنواع لوحة التحكم
│   │   │
│   │   ├── lib/
│   │   │   ├── utils.ts                           # دالة cn (Tailwind)
│   │   │   ├── validators.ts                      # Zod Schemas
│   │   │   └── test-utils.tsx                     # أدوات اختبار React Query
│   │   │
│   │   └── middleware.ts                          # Next.js Middleware (حماية)
│   │
│   └── tests/
│       └── unit/
│           ├── services/
│           │   ├── api-client.test.ts
│           │   └── auth.service.test.ts
│           └── components/
│               ├── login-form.test.tsx
│               └── conversation-item.test.tsx
│
├── docker-compose.yml                             # بيئة تطوير (4 خدمات)
├── docker-compose.staging.yml                     # بيئة Staging (4 خدمات، منافذ مختلفة)
├── Dockerfile                                     # Multi-stage Build
├── .dockerignore                                  # استثناءات Docker
├── .env.example                                   # متغيرات بيئة للتطوير
└── .env.staging.example                           # متغيرات بيئة لـ Staging