#!/bin/bash

# Redis Backup Script for Production
set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups/redis"
BACKUP_FILE="redis_backup_${TIMESTAMP}.rdb"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
echo "[$(date)] Starting Redis backup..."
redis-cli --rdb "$BACKUP_DIR/$BACKUP_FILE" -u "$REDIS_URL"

if [ $? -eq 0 ]; then
    echo "[$(date)] Redis backup completed: $BACKUP_FILE"
    
    # Upload to S3 if configured
    if [ ! -z "$BACKUP_S3_BUCKET" ]; then
        aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" "s3://$BACKUP_S3_BUCKET/redis/" --region "$AWS_REGION"
        echo "[$(date)] Backup uploaded to S3"
    fi
    
    # Clean old backups
    find $BACKUP_DIR -name "redis_backup_*.rdb" -mtime +$BACKUP_RETENTION_DAYS -delete
    echo "[$(date)] Old backups cleaned"
else
    echo "[$(date)] Redis backup failed"
    exit 1
fi