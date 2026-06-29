#!/bin/sh
set -e

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/unicom_db_${TIMESTAMP}.sql.gz"

# إنشاء مجلد النسخ الاحتياطي إذا لم يوجد
mkdir -p "$BACKUP_DIR"

# تنفيذ pg_dump وضغطه
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"

echo "Backup created: ${BACKUP_FILE}"

# الاحتفاظ بآخر 7 نسخ فقط
ls -1tr "${BACKUP_DIR}"/unicom_db_*.sql.gz | head -n -7 | xargs rm -f 2>/dev/null || true

echo "Cleanup completed. Kept last 7 backups."