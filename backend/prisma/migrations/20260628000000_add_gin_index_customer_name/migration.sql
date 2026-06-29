-- تفعيل إضافة pg_trgm
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- إنشاء فهرس GIN للبحث النصي على اسم العميل
CREATE INDEX IF NOT EXISTS idx_customer_name_trgm ON "Customer" USING gin (name gin_trgm_ops);