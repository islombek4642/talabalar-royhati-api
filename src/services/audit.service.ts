import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auditService = {
  async log(params: {
    entityType: string;
    entityId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';
    userId?: string;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await prisma.auditLog.create({
        data: {
          entity_type: params.entityType,
          entity_id: params.entityId,
          action: params.action,
          user_id: params.userId,
          changes: params.changes || null,
          ip_address: params.ipAddress,
          user_agent: params.userAgent
        }
      });
    } catch (error) {
      // Don't throw - audit logs should not break the main flow
      console.error('Audit log error:', error);
    }
  },

  async getEntityLogs(entityType: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: {
        entity_type: entityType,
        entity_id: entityId
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  },

  async getUserLogs(userId: string, limit = 100) {
    return prisma.auditLog.findMany({
      where: {
        user_id: userId
      },
      orderBy: {
        created_at: 'desc'
      },
      take: limit
    });
  },

  async getRecentLogs(limit = 100) {
    return prisma.auditLog.findMany({
      orderBy: {
        created_at: 'desc'
      },
      take: limit
    });
  }
};
