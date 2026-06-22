# backup-db.sh
#!/bin/bash
BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="restapi"

mkdir -p $BACKUP_DIR

pg_dump -h localhost -U postgres $DB_NAME > "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "✅ Database backup complete: ${DB_NAME}_${TIMESTAMP}.sql"