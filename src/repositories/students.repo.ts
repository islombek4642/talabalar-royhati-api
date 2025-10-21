import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const studentsRepo = {
  create(data: any) {
    return prisma.student.create({ data });
  },
  bulkCreate(rows: any[]) {
    return prisma.student.createMany({ data: rows, skipDuplicates: true });
  },
  findById(id: string) {
    return prisma.student.findUnique({ where: { id } });
  },
  update(id: string, data: any) {
    return prisma.student.update({ where: { id }, data });
  },
  delete(id: string) {
    return prisma.student.delete({ where: { id } });
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
    const where: any = {};
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
    const where: any = {};
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
  }
};
