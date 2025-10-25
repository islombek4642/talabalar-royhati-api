import { studentsRepo } from '../repositories/students.repo';
import { auditService } from './audit.service';
import { calcSkipTake } from '../utils/pagination';
import { parse } from 'csv-parse/sync';
import { createStudentSchema } from '../schemas/student.schema';

export const studentsService = {
  async create(payload: any, userId?: string, ipAddress?: string, userAgent?: string) {
    const student = await studentsRepo.create({
      ...payload,
      birth_date: new Date(payload.birth_date),
      created_by: userId
    });
    
    // Audit log
    await auditService.log({
      entityType: 'Student',
      entityId: student.id,
      action: 'CREATE',
      userId,
      changes: payload,
      ipAddress,
      userAgent
    });
    
    return student;
  },
  getById(id: string) {
    return studentsRepo.findById(id);
  },
  async update(id: string, payload: any, userId?: string, ipAddress?: string, userAgent?: string) {
    const data: any = { ...payload };
    if (data.birth_date) data.birth_date = new Date(data.birth_date);
    if (userId) data.updated_by = userId;
    
    const updated = await studentsRepo.update(id, data);
    
    // Audit log
    await auditService.log({
      entityType: 'Student',
      entityId: id,
      action: 'UPDATE',
      userId,
      changes: payload,
      ipAddress,
      userAgent
    });
    
    return updated;
  },
  async delete(id: string, userId?: string, ipAddress?: string, userAgent?: string) {
    const deleted = await studentsRepo.delete(id);
    
    // Audit log
    await auditService.log({
      entityType: 'Student',
      entityId: id,
      action: 'DELETE',
      userId,
      ipAddress,
      userAgent
    });
    
    return deleted;
  },
  async restore(id: string, userId?: string) {
    return studentsRepo.restore(id, userId);
  },
  async getDeleted() {
    return studentsRepo.getDeleted();
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
    const emailsToCheck: string[] = [];
    
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
        if (data.email) {
          emailsToCheck.push(data.email);
        }
      }
    });
    
    // Check for existing students by email
    const duplicates: any[] = [];
    if (emailsToCheck.length > 0) {
      const existing = await studentsRepo.findByEmails(emailsToCheck);
      const existingEmails = new Set(existing.map((s: any) => s.email).filter(Boolean));
      
      // Separate duplicates and new students
      // Only check duplicates for students with email
      const toInsert = valid.filter(s => !s.email || !existingEmails.has(s.email));
      const duplicateStudents = valid.filter(s => s.email && existingEmails.has(s.email));
      
      duplicateStudents.forEach(s => {
        duplicates.push({
          email: s.email,
          full_name: s.full_name
        });
      });
      
      // Insert only new students
      let inserted = 0;
      if (toInsert.length) {
        console.log(`[Import] Attempting to insert ${toInsert.length} new students`);
        console.log('[Import] Sample data:', toInsert[0]);
        try {
          const result = await studentsRepo.bulkCreate(toInsert);
          console.log(`[Import] Raw insert result:`, JSON.stringify(result));
          inserted = result?.count ?? toInsert.length;
          console.log(`[Import] Calculated inserted count: ${inserted}`);
        } catch (error) {
          console.error('[Import] Insert error:', error);
          console.error('[Import] Error details:', JSON.stringify(error));
        }
      } else {
        console.log('[Import] No new students to insert (all duplicates)');
      }
      
      return { 
        inserted, 
        invalid: errors.length, 
        duplicates: duplicates.length,
        duplicateList: duplicates,
        errors 
      };
    }
    
    // Fallback if no emails to check
    let inserted = 0;
    if (valid.length) {
      console.log(`[Import] No email check, inserting ${valid.length} students`);
      const result = await studentsRepo.bulkCreate(valid);
      inserted = (result as any).count ?? 0;
      console.log(`[Import] Inserted count: ${inserted}`);
    }
    return { inserted, invalid: errors.length, duplicates: 0, duplicateList: [], errors };
  }
};
