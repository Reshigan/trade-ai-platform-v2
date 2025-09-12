#!/bin/bash

# Backup Scheduler Script
set -e

echo "[$(date)] Starting backup scheduler..."

# Create crontab entry
echo "$BACKUP_SCHEDULE /usr/local/bin/backup-mongodb.sh >> /var/log/backup.log 2>&1" > /tmp/crontab
echo "$BACKUP_SCHEDULE /usr/local/bin/backup-redis.sh >> /var/log/backup.log 2>&1" >> /tmp/crontab

# Install crontab
crontab /tmp/crontab

# Create log file
touch /var/log/backup.log

# Start cron daemon
crond -f -l 2