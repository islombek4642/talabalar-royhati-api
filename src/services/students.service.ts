import { studentsRepo } from '../repositories/students.repo';
import { calcSkipTake } from '../utils/pagination';
import { parse } from 'csv-parse/sync';
import { createStudentSchema } from '../schemas/student.schema';

export const studentsService = {
  create(payload: any) {
    return studentsRepo.create({
      ...payload,
      birth_date: new Date(payload.birth_date)
    });
  },
  getById(id: string) {
    return studentsRepo.findById(id);
  },
  update(id: string, payload: any) {
    const data: any = { ...payload };
    if (data.birth_date) data.birth_date = new Date(data.birth_date);
    return studentsRepo.update(id, data);
  },
  delete(id: string) {
    return studentsRepo.delete(id);
  },
  async list(query: any) {
    const { skip, take } = calcSkipTake(query.page, query.limit);
    return studentsRepo.list({
      skip,
      take,
      sort: query.sort,
      faculty: query.faculty,
      group: query.group,
      status: query.status,
      search: query.search
    });
  },
  async exportCsv(query: any) {
    const rows = await studentsRepo.listForExport({
      sort: query.sort,
      faculty: query.faculty,
      group: query.group,
      status: query.status,
      search: query.search
    });
    const header = [
      'id','full_name','faculty','group','email','phone','birth_date','enrollment_year','status','created_at','updated_at'
    ];
    const escape = (v: any) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const lines = [header.join(',')];
    for (const r of rows) {
      lines.push([
        r.id,
        r.full_name,
        r.faculty,
        r.group,
        r.email ?? '',
        r.phone ?? '',
        r.birth_date.toISOString().slice(0,10),
        r.enrollment_year,
        r.status,
        r.created_at.toISOString(),
        r.updated_at.toISOString()
      ].map(escape).join(','));
    }
    return lines.join('\n');
  },
  async importCsv(buf: Buffer) {
    const text = buf.toString('utf-8');
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as any[];
    const valid: any[] = [];
    const errors: Array<{ row: number; message: string }> = [];
    records.forEach((row, idx) => {
      // Normalize keys if needed
      const input = {
        full_name: row.full_name ?? row.name ?? row.fullName,
        faculty: row.faculty,
        group: row.group,
        email: row.email || undefined,
        phone: row.phone || undefined,
        birth_date: row.birth_date ?? row.birthDate,
        enrollment_year: row.enrollment_year ? Number(row.enrollment_year) : Number(row.enrollmentYear),
        status: row.status || 'active'
      };
      const parsed = createStudentSchema.safeParse({
        ...input,
        enrollment_year: Number(input.enrollment_year)
      });
      if (!parsed.success) {
        errors.push({ row: idx + 1, message: parsed.error.errors.map(e => e.message).join('; ') });
      } else {
        const data = parsed.data as any;
        valid.push({
          ...data,
          birth_date: new Date(data.birth_date)
        });
      }
    });
    let inserted = 0;
    if (valid.length) {
      const result = await studentsRepo.bulkCreate(valid);
      inserted = (result as any).count ?? 0;
    }
    return { inserted, invalid: errors.length, errors };
  }
};
