import { z } from 'zod';

export const StatusEnum = z.enum(['active', 'graduated', 'expelled', 'academic_leave']);

export const createStudentSchema = z.object({
  full_name: z.string().min(2).max(100),
  faculty: z.string().min(1),
  group: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+998\d{9}$/).optional(),
  birth_date: z.string().refine(v => !Number.isNaN(Date.parse(v)), { message: 'Invalid date' }),
  enrollment_year: z.number().int().min(2000).max(new Date().getFullYear()),
  status: StatusEnum.default('active')
});

export const updateStudentSchema = createStudentSchema.partial();

export const getStudentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(10),
  sort: z.string().optional(),
  faculty: z.string().optional(),
  group: z.string().optional(),
  status: StatusEnum.optional(),
  search: z.string().optional()
});
