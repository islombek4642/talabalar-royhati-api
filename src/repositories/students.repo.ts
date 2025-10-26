import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const studentsRepo = {
  create(data: any) {
    return prisma.student.create({ data });
  },
  bulkCreate(rows: any[]) {
    return prisma.student.createMany({ data: rows, skipDuplicates: false });
  },
  findById(id: string, includeDeleted = false) {
    return prisma.student.findFirst({ 
      where: { 
        id,
        ...(includeDeleted ? {} : { deleted_at: null })
      } 
    });
  },
  findByEmails(emails: string[], includeDeleted = false) {
    return prisma.student.findMany({
      where: {
        email: { in: emails },
        ...(includeDeleted ? {} : { deleted_at: null })
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        deleted_at: true
      }
    });
  },
  findAll(options?: { deleted?: boolean | undefined }) {
    let where: any = {};
    if (options?.deleted === false) {
      where = { deleted_at: null }; // Only active students
    } else if (options?.deleted === true) {
      where = { deleted_at: { not: null } }; // Only deleted students
    }
    // else: options?.deleted === undefined → {} (all students)
    
    return prisma.student.findMany({
      where,
      select: {
        id: true,
        full_name: true,
        email: true
      }
    });
  },
  update(id: string, data: any) {
    return prisma.student.update({ where: { id }, data });
  },
  // Soft delete
  softDelete(id: string, deletedBy?: string) {
    return prisma.student.update({ 
      where: { id }, 
      data: { 
        deleted_at: new Date(),
        updated_by: deletedBy
      } 
    });
  },
  // Hard delete (admin only)
  hardDelete(id: string) {
    return prisma.student.delete({ where: { id } });
  },
  // Restore soft deleted
  restore(id: string, restoredBy?: string) {
    return prisma.student.update({ 
      where: { id }, 
      data: { 
        deleted_at: null,
        updated_by: restoredBy
      } 
    });
  },
  // Legacy delete method (now soft delete)
  delete(id: string) {
    return this.softDelete(id);
  },
  async listForExport(params: {
    sort?: string;
    faculty?: string;
    group?: string;
    status?: 'active' | 'graduated' | 'expelled' | 'academic_leave';
    search?: string;
  }) {
    const orderBy: any[] = [];
    if (params.sort) {
      const parts = params.sort.split(',');
      for (const p of parts) {
        const desc = p.startsWith('-');
        const field = desc ? p.slice(1) : p;
        orderBy.push({ [field]: desc ? 'desc' : 'asc' });
      }
    }
    const where: any = { deleted_at: null }; // Exclude deleted
    if (params.faculty) where.faculty = params.faculty;
    if (params.group) where.group = params.group;
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { full_name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } }
      ];
    }

    return prisma.student.findMany({ where, orderBy: orderBy.length ? orderBy : undefined });
  },
  async list(params: {
    skip: number;
    take: number;
    sort?: string;
    faculty?: string;
    group?: string;
    status?: 'active' | 'graduated' | 'expelled' | 'academic_leave';
    search?: string;
  }) {
    const orderBy: any[] = [];
    if (params.sort) {
      const parts = params.sort.split(',');
      for (const p of parts) {
        const desc = p.startsWith('-');
        const field = desc ? p.slice(1) : p;
        orderBy.push({ [field]: desc ? 'desc' : 'asc' });
      }
    }
    const where: any = { deleted_at: null }; // Exclude deleted
    if (params.faculty) where.faculty = params.faculty;
    if (params.group) where.group = params.group;
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { full_name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } }
      ];
    }

    const [total, data] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({ where, orderBy: orderBy.length ? orderBy : undefined, skip: params.skip, take: params.take })
    ]);

    return { total, data };
  },
  
  // Get deleted students (admin only)
  async getDeleted(limit = 10000) {
    return prisma.student.findMany({
      where: { deleted_at: { not: null } },
      orderBy: { deleted_at: 'desc' },
      take: limit,
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        faculty: true,
        group: true,
        enrollment_year: true,
        deleted_at: true
      }
    });
  }
};
