#!/bin/bash

# Database Backup Cron Script
# Bu script har kuni backup yaratadi
#
# Crontab'ga qo'shish:
# 0 2 * * * /path/to/project/scripts/backup-cron.sh
# (Har kuni soat 2:00 da backup yaratadi)

# Project directory
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Run backup
echo "$(date): Starting database backup..."
node scripts/backup-db.js >> logs/backup.log 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "$(date): Backup successful"
else
  echo "$(date): Backup failed with exit code $EXIT_CODE"
fi

exit $EXIT_CODE
