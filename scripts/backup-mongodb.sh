#!/bin/bash

# MongoDB Backup Script for Production
set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups/mongodb"
BACKUP_FILE="mongodb_backup_${TIMESTAMP}.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
echo "[$(date)] Starting MongoDB backup..."
mongodump --uri="$MONGODB_URI" --gzip --archive="$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "[$(date)] MongoDB backup completed: $BACKUP_FILE"
    
    # Upload to S3 if configured
    if [ ! -z "$BACKUP_S3_BUCKET" ]; then
        aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" "s3://$BACKUP_S3_BUCKET/mongodb/" --region "$AWS_REGION"
        echo "[$(date)] Backup uploaded to S3"
    fi
    
    # Clean old backups
    find $BACKUP_DIR -name "mongodb_backup_*.gz" -mtime +$BACKUP_RETENTION_DAYS -delete
    echo "[$(date)] Old backups cleaned"
else
    echo "[$(date)] MongoDB backup failed"
    exit 1
fi