#!/usr/bin/env node

/**
 * Database Backup Script
 * 
 * Bu script PostgreSQL database'ni backup qiladi.
 * 
 * Ishlatish:
 *   npm run backup:db
 *   yoki
 *   node scripts/backup-db.js
 * 
 * Environment variables:
 *   DATABASE_URL - PostgreSQL connection string
 *   BACKUP_DIR - Backup papka (default: ./backups)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable yo\'q!');
  process.exit(1);
}

// Parse DATABASE_URL
const dbUrl = new URL(DATABASE_URL);
const dbName = dbUrl.pathname.slice(1).split('?')[0];
const dbUser = dbUrl.username;
const dbPassword = dbUrl.password;
const dbHost = dbUrl.hostname;
const dbPort = dbUrl.port || '5432';

// Backup papkani yaratish
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`📁 Backup papka yaratildi: ${BACKUP_DIR}`);
}

// Backup fayl nomi (timestamp bilan)
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(BACKUP_DIR, `backup-${dbName}-${timestamp}.sql`);

console.log('🔄 Database backup boshlanmoqda...');
console.log(`📦 Database: ${dbName}`);
console.log(`💾 Backup fayl: ${backupFile}`);

try {
  // pg_dump command
  const command = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F p -f "${backupFile}"`;
  
  execSync(command, { stdio: 'inherit' });
  
  // Fayl hajmini tekshirish
  const stats = fs.statSync(backupFile);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log('✅ Backup muvaffaqiyatli yaratildi!');
  console.log(`📊 Fayl hajmi: ${fileSizeMB} MB`);
  console.log(`📂 Fayl manzili: ${backupFile}`);
  
  // Eski backuplarni tozalash (30 kundan eskisini o'chirish)
  cleanOldBackups();
  
} catch (error) {
  console.error('❌ Backup xatolik:', error.message);
  process.exit(1);
}

function cleanOldBackups() {
  const files = fs.readdirSync(BACKUP_DIR);
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  let deletedCount = 0;
  
  files.forEach(file => {
    if (file.startsWith('backup-') && file.endsWith('.sql')) {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtimeMs < thirtyDaysAgo) {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`🗑️  Eski backup o'chirildi: ${file}`);
      }
    }
  });
  
  if (deletedCount > 0) {
    console.log(`✨ ${deletedCount} ta eski backup tozalandi`);
  }
}
