import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 3000),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/talabalar?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  SWAGGER_USERNAME: process.env.SWAGGER_USERNAME || 'swagger',
  SWAGGER_PASSWORD: process.env.SWAGGER_PASSWORD || 'swagger123',
  BACKUP_DIR: process.env.BACKUP_DIR || './backups',
  ENABLE_METRICS: process.env.ENABLE_METRICS === 'true' || process.env.NODE_ENV === 'production'
};
