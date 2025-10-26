import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const adminManagementService = {
  /**
   * Promote a student to admin
   */
  async promoteStudentToAdmin(studentId: string, promotedBy: string) {
    // Find student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    if (student.deleted_at) {
      throw new Error('Cannot promote deleted student');
    }

    // Check if already an admin
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: student.email || undefined }
    });

    if (existingAdmin) {
      throw new Error('Student is already an admin');
    }

    // Create admin account from student
    // Generate username from email or name
    const baseUsername = student.email 
      ? student.email.split('@')[0] 
      : student.full_name.toLowerCase().replace(/\s+/g, '.');
    
    let username = baseUsername;
    let counter = 1;
    
    // Ensure unique username
    while (await prisma.admin.findUnique({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Use existing user password or generate default
    const password = student.user?.password || await bcrypt.hash('admin123', 10);

    const admin = await prisma.admin.create({
      data: {
        username,
        email: student.email,
        password,
        full_name: student.full_name,
        phone: student.phone,
        role: 'ADMIN', // Regular admin, not super admin
        is_active: true
      }
    });

    // Create audit log (non-blocking)
    try {
      await prisma.auditLog.create({
        data: {
          entity_type: 'Admin',
          entity_id: admin.id,
          action: 'PROMOTED',
          user_id: promotedBy,
          changes: {
            student_id: studentId,
            student_name: student.full_name,
            promoted_to: 'ADMIN'
          }
        }
      });
    } catch (auditError) {
      // Log error but don't fail the operation
      console.warn('Failed to create audit log:', auditError);
    }

    return {
      admin,
      message: `Student ${student.full_name} promoted to Admin successfully`,
      credentials: {
        username: admin.username,
        password: student.user ? 'Uses existing student password' : 'admin123 (temporary)'
      }
    };
  },

  /**
   * Get all admins (super admin only)
   */
  async getAllAdmins() {
    return await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        is_active: true,
        last_login_at: true,
        created_at: true
      },
      orderBy: [
        { role: 'asc' }, // SUPER_ADMIN first
        { created_at: 'desc' }
      ]
    });
  },

  /**
   * Demote admin to student (super admin only)
   */
  async demoteAdmin(adminId: string, demotedBy: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    if (admin.role === 'SUPER_ADMIN') {
      throw new Error('Cannot demote super admin');
    }

    // Delete admin account
    await prisma.admin.delete({
      where: { id: adminId }
    });

    // Create audit log (non-blocking)
    try {
      await prisma.auditLog.create({
        data: {
          entity_type: 'Admin',
          entity_id: adminId,
          action: 'DEMOTED',
          user_id: demotedBy,
          changes: {
            admin_username: admin.username,
            admin_name: admin.full_name,
            demoted_from: 'ADMIN'
          }
        }
      });
    } catch (auditError) {
      console.warn('Failed to create audit log:', auditError);
    }

    return { message: `Admin ${admin.username} demoted successfully` };
  },

  /**
   * Update admin information
   */
  async updateAdmin(adminId: string, updateData: any, updatedBy: string) {
    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    // Validate update data
    const allowedFields = ['full_name', 'email', 'phone', 'role', 'is_active'];
    const filteredData: any = {};

    for (const key of allowedFields) {
      if (key in updateData) {
        filteredData[key] = updateData[key];
      }
    }

    // Special validations
    if (filteredData.role === 'SUPER_ADMIN' && admin.role !== 'SUPER_ADMIN') {
      // Promoting to super admin - allow
      console.log(`Promoting ${admin.username} to SUPER_ADMIN`);
    }

    if (filteredData.role === 'ADMIN' && admin.role === 'SUPER_ADMIN') {
      // Demoting from super admin - allow
      console.log(`Demoting ${admin.username} from SUPER_ADMIN`);
    }

    // Update admin
    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: {
        ...filteredData,
        updated_at: new Date()
      }
    });

    // Create audit log (non-blocking)
    try {
      await prisma.auditLog.create({
        data: {
          entity_type: 'Admin',
          entity_id: adminId,
          action: 'UPDATED',
          user_id: updatedBy,
          changes: filteredData
        }
      });
    } catch (auditError) {
      console.warn('Failed to create audit log:', auditError);
    }

    return {
      admin: updatedAdmin,
      message: `Admin ${admin.username} updated successfully`
    };
  }
};
