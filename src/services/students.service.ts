import { studentsRepo } from '../repositories/students.repo';
import { auditService } from './audit.service';
import { calcSkipTake } from '../utils/pagination';
import { parse } from 'csv-parse/sync';
import { createStudentSchema } from '../schemas/student.schema';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to check if email belongs to an admin
async function isAdminEmail(email: string): Promise<boolean> {
  const admin = await prisma.admin.findUnique({
    where: { email }
  });
  return admin !== null && admin.is_active;
}

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
    const student = await studentsRepo.findById(id, true); // Include deleted to check status
    if (!student) {
      throw new Error('Student not found');
    }
    
    // 🔒 PROTECTION: Cannot delete admins!
    if (student.email) {
      const isAdmin = await isAdminEmail(student.email);
      if (isAdmin) {
        console.log(`[Delete] BLOCKED: Cannot delete admin account: ${student.email}`);
        throw new Error(`Cannot delete student with admin account (${student.email}). Remove admin role first.`);
      }
    }
    
    // Check if already soft-deleted
    if ((student as any).deleted_at) {
      console.log(`[Delete] Student ${id} already soft-deleted, skipping`);
      return student; // Already deleted, return as-is
    }
    
    await auditService.log({
      entityType: 'Student',
      entityId: id,
      action: 'DELETE',
      userId,
      ipAddress,
      userAgent
    });
    
    return studentsRepo.update(id, { deleted_at: new Date() });
  },
  async restore(id: string, userId?: string) {
    return studentsRepo.restore(id, userId);
  },
  async bulkRestore(ids: string[], userId?: string) {
    let restored = 0;
    for (const id of ids) {
      try {
        await studentsRepo.restore(id, userId);
        restored++;
      } catch (error) {
        console.error(`Failed to restore student ${id}:`, error);
      }
    }
    return restored;
  },
  async restoreAll(userId?: string) {
    const deletedStudents = await studentsRepo.getDeleted();
    const ids = deletedStudents.map((s: any) => s.id);
    return this.bulkRestore(ids, userId);
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
    console.log('[Import] CSV text length:', text.length);
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as any[];
    console.log('[Import] Parsed records count:', records.length);
    console.log('[Import] First record:', records[0]);
    
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
        console.log(`[Import] Row ${idx + 1} validation failed:`, parsed.error.errors);
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
    
    console.log('[Import] Valid records:', valid.length);
    console.log('[Import] Invalid records:', errors.length);
    console.log('[Import] Emails to check:', emailsToCheck.length);
    
    // Check for existing students by email
    const duplicates: any[] = [];
    if (emailsToCheck.length > 0) {
      // First check active students
      const activeStudents = await studentsRepo.findByEmails(emailsToCheck, false);
      const activeEmails = new Set(activeStudents.map((s: any) => s.email).filter(Boolean));
      
      // Then check soft-deleted students (we'll restore these)
      const deletedStudents = await studentsRepo.findByEmails(emailsToCheck, true);
      const deletedByEmail = new Map(
        deletedStudents
          .filter((s: any) => s.deleted_at !== null)
          .map((s: any) => [s.email, s])
      );
      
      console.log('[Import] Active students found:', activeStudents.length);
      console.log('[Import] Soft-deleted students found:', deletedByEmail.size);
      
      // Track which emails we've already seen to insert only first occurrence
      const emailsSeen = new Map<string, boolean>(); // email -> inserted?
      
      const toInsert: any[] = [];
      const duplicateStudents: any[] = [];
      
      const toRestore: any[] = []; // Soft-deleted students to restore
      
      valid.forEach(s => {
        if (!s.email) {
          // No email - always insert
          toInsert.push(s);
        } else if (activeEmails.has(s.email)) {
          // Email in active students - duplicate
          duplicateStudents.push(s);
        } else if (emailsSeen.has(s.email)) {
          // Email already seen in this CSV - duplicate
          duplicateStudents.push(s);
        } else if (deletedByEmail.has(s.email)) {
          // Email in soft-deleted student - restore and update
          const deleted = deletedByEmail.get(s.email) as any;
          if (deleted) {
            toRestore.push({
              id: deleted.id,
              data: {
                ...s,
                deleted_at: null, // Restore
                updated_at: new Date()
              }
            });
            emailsSeen.set(s.email, true);
          }
        } else {
          // First time seeing this email - insert it
          emailsSeen.set(s.email, true);
          toInsert.push(s);
        }
      });
      
      duplicateStudents.forEach(s => {
        duplicates.push({
          email: s.email,
          full_name: s.full_name
        });
      });
      
      // Restore soft-deleted students
      let restored = 0;
      if (toRestore.length) {
        console.log(`[Import] Restoring ${toRestore.length} soft-deleted students`);
        for (const item of toRestore) {
          try {
            await studentsRepo.update(item.id, item.data);
            restored++;
          } catch (error) {
            console.error(`[Import] Failed to restore student ${item.id}:`, error);
          }
        }
        console.log(`[Import] Restored ${restored} students`);
      }
      
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
        console.log('[Import] No new students to insert');
      }
      
      return { 
        inserted: inserted + restored, // Total new records (insert + restore)
        restored, // Number of soft-deleted students restored
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
    return { inserted, restored: 0, invalid: errors.length, duplicates: 0, duplicateList: [], errors };
  },

  async bulkDelete(ids: string[], userId?: string, ipAddress?: string, userAgent?: string) {
    let deleted = 0;
    
    for (const id of ids) {
      try {
        await this.delete(id, userId, ipAddress, userAgent);
        deleted++;
      } catch (error) {
        console.error(`Failed to delete student ${id}:`, error);
        // Continue with other deletions
      }
    }
    
    return deleted;
  },

  async deleteAll(userId?: string, ipAddress?: string, userAgent?: string) {
    // Get ONLY ACTIVE students (not already soft-deleted)
    const allStudents = await studentsRepo.findAll({ deleted: false });
    console.log('[Delete All] Active students found:', allStudents.length);
    
    if (allStudents.length === 0) {
      console.log('[Delete All] No active students to delete');
      return 0;
    }
    
    // 🔒 PROTECTION: Filter out admin accounts
    const safeToDeleteIds: string[] = [];
    let protectedCount = 0;
    
    for (const student of allStudents) {
      if (student.email) {
        const isAdmin = await isAdminEmail(student.email);
        if (isAdmin) {
          console.log(`[Delete All] PROTECTED: Skipping admin ${student.email}`);
          protectedCount++;
          continue;
        }
      }
      safeToDeleteIds.push(student.id);
    }
    
    console.log(`[Delete All] Protected admins: ${protectedCount}, Safe to delete: ${safeToDeleteIds.length}`);
    
    if (safeToDeleteIds.length === 0) {
      console.log('[Delete All] No non-admin students to delete');
      return 0;
    }
    
    return this.bulkDelete(safeToDeleteIds, userId, ipAddress, userAgent);
  },

  async permanentDeleteAll(userId?: string, ipAddress?: string, userAgent?: string) {
    // ⚠️ HARD DELETE - Bazadan butunlay o'chiradi!
    const allStudents = await studentsRepo.findAll({ deleted: undefined }); // ALL students
    console.log('[Permanent Delete] Total students to delete:', allStudents.length);
    
    if (allStudents.length === 0) {
      console.log('[Permanent Delete] No students found');
      return 0;
    }

    // 🔒 PROTECTION: Filter out admin accounts
    const safeToDeleteStudents = [];
    let protectedCount = 0;
    
    for (const student of allStudents) {
      if (student.email) {
        const isAdmin = await isAdminEmail(student.email);
        if (isAdmin) {
          console.log(`[Permanent Delete] PROTECTED: Skipping admin ${student.email}`);
          protectedCount++;
          continue;
        }
      }
      safeToDeleteStudents.push(student);
    }
    
    console.log(`[Permanent Delete] Protected admins: ${protectedCount}, Safe to delete: ${safeToDeleteStudents.length}`);
    
    if (safeToDeleteStudents.length === 0) {
      console.log('[Permanent Delete] No non-admin students to delete');
      return 0;
    }

    // Audit log BEFORE deleting
    await auditService.log({
      entityType: 'Student',
      entityId: 'ALL',
      action: 'DELETE',
      userId,
      changes: { count: safeToDeleteStudents.length, permanent: true, protectedAdmins: protectedCount },
      ipAddress,
      userAgent
    });

    // HARD DELETE from database
    let deleted = 0;
    for (const student of safeToDeleteStudents) {
      try {
        await studentsRepo.hardDelete(student.id);
        deleted++;
      } catch (error) {
        console.error(`[Permanent Delete] Failed to delete ${student.id}:`, error);
      }
    }

    console.log(`[Permanent Delete] Deleted ${deleted} students from database (${protectedCount} admins protected)`);
    return deleted;
  }
};
