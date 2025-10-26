import { Router } from 'express';
import { env } from '../config/env';
import { requireAuth } from '../middlewares/auth';
import { adminManagementService } from '../services/admin-management.service';

const router = Router();

/**
 * Middleware to check if user is super admin
 */
const requireSuperAdmin = async (req: any, res: any, next: any) => {
  try {
    const adminId = req.user?.sub;
    
    if (!adminId) {
      return res.status(401).json({ 
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } 
      });
    }

    // Check if admin has SUPER_ADMIN role
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { role: true }
    });

    await prisma.$disconnect();

    if (!admin || admin.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        error: { message: 'Forbidden: Super admin access required', code: 'FORBIDDEN' } 
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/promote-student/:studentId
 * Promote a student to admin (Super admin only)
 */
router.post(
  '/promote-student/:studentId',
  requireAuth(env.JWT_SECRET),
  requireSuperAdmin,
  async (req, res, next) => {
    try {
      const { studentId } = req.params;
      const adminId = (req as any).user?.sub;

      const result = await adminManagementService.promoteStudentToAdmin(studentId, adminId);

      res.status(201).json(result);
    } catch (err: any) {
      if (err.message === 'Student not found') {
        return res.status(404).json({ 
          error: { message: err.message, code: 'NOT_FOUND' } 
        });
      }
      if (err.message.includes('already an admin') || err.message.includes('deleted student')) {
        return res.status(400).json({ 
          error: { message: err.message, code: 'BAD_REQUEST' } 
        });
      }
      next(err);
    }
  }
);

/**
 * GET /api/v1/admin/list
 * Get all admins (Super admin only)
 */
router.get(
  '/list',
  requireAuth(env.JWT_SECRET),
  requireSuperAdmin,
  async (req, res, next) => {
    try {
      const admins = await adminManagementService.getAllAdmins();
      res.json({ admins, count: admins.length });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/v1/admin/demote/:adminId
 * Demote admin (Super admin only)
 */
router.delete(
  '/demote/:adminId',
  requireAuth(env.JWT_SECRET),
  requireSuperAdmin,
  async (req, res, next) => {
    try {
      const { adminId } = req.params;
      const superAdminId = (req as any).user?.sub;

      const result = await adminManagementService.demoteAdmin(adminId, superAdminId);
      res.json(result);
    } catch (err: any) {
      if (err.message === 'Admin not found') {
        return res.status(404).json({ 
          error: { message: err.message, code: 'NOT_FOUND' } 
        });
      }
      if (err.message.includes('Cannot demote')) {
        return res.status(403).json({ 
          error: { message: err.message, code: 'FORBIDDEN' } 
        });
      }
      next(err);
    }
  }
);

/**
 * PATCH /api/v1/admin/:adminId
 * Update admin info (Super admin only)
 */
router.patch(
  '/:adminId',
  requireAuth(env.JWT_SECRET),
  requireSuperAdmin,
  async (req, res, next) => {
    try {
      const { adminId } = req.params;
      const updateData = req.body;
      const superAdminId = (req as any).user?.sub;

      const result = await adminManagementService.updateAdmin(adminId, updateData, superAdminId);
      res.json(result);
    } catch (err: any) {
      if (err.message === 'Admin not found') {
        return res.status(404).json({ 
          error: { message: err.message, code: 'NOT_FOUND' } 
        });
      }
      if (err.message.includes('Cannot') || err.message.includes('not allowed')) {
        return res.status(403).json({ 
          error: { message: err.message, code: 'FORBIDDEN' } 
        });
      }
      next(err);
    }
  }
);

export default router;
