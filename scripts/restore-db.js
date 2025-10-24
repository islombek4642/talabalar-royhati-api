#!/usr/bin/env node

/**
 * Database Restore Script
 * 
 * Bu script backup'dan database'ni restore qiladi.
 * 
 * Ishlatish:
 *   npm run restore:db
 *   yoki
 *   node scripts/restore-db.js <backup-file>
 * 
 * Misol:
 *   node scripts/restore-db.js backups/backup-talabalar-2025-01-15.sql
 * 
 * Environment variables:
 *   DATABASE_URL - PostgreSQL connection string
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

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

// Backup faylni olish
let backupFile = process.argv[2];

if (!backupFile) {
  // Eng oxirgi backup faylni topish
  const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
  if (!fs.existsSync(BACKUP_DIR)) {
    console.error(`❌ Backup papka topilmadi: ${BACKUP_DIR}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('backup-') && f.endsWith('.sql'))
    .map(f => ({
      name: f,
      path: path.join(BACKUP_DIR, f),
      mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs
    }))
    .sort((a, b) => b.mtime - a.mtime);
  
  if (files.length === 0) {
    console.error('❌ Backup fayllar topilmadi!');
    process.exit(1);
  }
  
  backupFile = files[0].path;
  console.log(`📦 Eng oxirgi backup tanland: ${files[0].name}`);
}

// Fayl mavjudligini tekshirish
if (!fs.existsSync(backupFile)) {
  console.error(`❌ Backup fayl topilmadi: ${backupFile}`);
  process.exit(1);
}

const stats = fs.statSync(backupFile);
const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log('⚠️  DIQQAT: Database restore qilish barcha mavjud ma\'lumotlarni o\'chiradi!');
console.log(`📦 Database: ${dbName}`);
console.log(`📁 Backup fayl: ${backupFile}`);
console.log(`📊 Fayl hajmi: ${fileSizeMB} MB`);
console.log('');

// Tasdiqlash
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Davom etishni xohlaysizmi? (yes/no): ', (answer) => {
  rl.close();
  
  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ Restore bekor qilindi.');
    process.exit(0);
  }
  
  console.log('🔄 Database restore boshlanmoqda...');
  
  try {
    // Database'ni drop va qayta yaratish (ixtiyoriy)
    console.log('🔄 Database tozalanmoqda...');
    const dropCommand = `PGPASSWORD="${dbPassword}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d postgres -c "DROP DATABASE IF EXISTS ${dbName};"`;
    const createCommand = `PGPASSWORD="${dbPassword}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d postgres -c "CREATE DATABASE ${dbName};"`;
    
    execSync(dropCommand, { stdio: 'inherit' });
    execSync(createCommand, { stdio: 'inherit' });
    
    // Restore
    console.log('🔄 Ma\'lumotlar yuklanmoqda...');
    const restoreCommand = `PGPASSWORD="${dbPassword}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f "${backupFile}"`;
    
    execSync(restoreCommand, { stdio: 'inherit' });
    
    console.log('✅ Database muvaffaqiyatli restore qilindi!');
    console.log(`📦 Database: ${dbName}`);
    
  } catch (error) {
    console.error('❌ Restore xatolik:', error.message);
    process.exit(1);
  }
});
