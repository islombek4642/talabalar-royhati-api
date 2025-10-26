import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Soft deleted students will be permanently deleted after 30 days
const SOFT_DELETE_RETENTION_DAYS = 30;

export const cleanupService = {
  async permanentlyDeleteExpiredStudents() {
    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() - SOFT_DELETE_RETENTION_DAYS);

      const result = await prisma.student.deleteMany({
        where: {
          deleted_at: {
            not: null,
            lte: expirationDate
          }
        }
      });

      logger.info(
        { count: result.count, expirationDate },
        'Permanently deleted expired soft-deleted students'
      );

      return result.count;
    } catch (error) {
      logger.error({ error }, 'Failed to permanently delete expired students');
      throw error;
    }
  },

  async getRetentionDays() {
    return SOFT_DELETE_RETENTION_DAYS;
  },

  async getExpiringStudentsCount() {
    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() - SOFT_DELETE_RETENTION_DAYS);

      const count = await prisma.student.count({
        where: {
          deleted_at: {
            not: null,
            lte: expirationDate
          }
        }
      });

      return count;
    } catch (error) {
      logger.error({ error }, 'Failed to count expiring students');
      return 0;
    }
  }
};

// Run cleanup daily at midnight
export function startCleanupScheduler() {
  const runCleanup = async () => {
    logger.info('Running scheduled cleanup...');
    await cleanupService.permanentlyDeleteExpiredStudents();
  };

  // Run immediately on startup
  runCleanup();

  // Then run every 24 hours (86400000 ms)
  setInterval(runCleanup, 24 * 60 * 60 * 1000);
  
  logger.info('Cleanup scheduler started (runs every 24 hours)');
}
