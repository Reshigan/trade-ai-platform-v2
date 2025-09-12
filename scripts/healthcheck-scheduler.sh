#!/bin/bash

# Health Check Scheduler Script
set -e

echo "[$(date)] Starting health check scheduler..."

# Create crontab entry (every minute)
echo "* * * * * /usr/local/bin/healthcheck.sh >> /var/log/healthcheck.log 2>&1" > /tmp/crontab

# Install crontab
crontab /tmp/crontab

# Create log file
touch /var/log/healthcheck.log

# Start cron daemon
crond -f -l 2