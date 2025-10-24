import { Request, Response, NextFunction } from 'express';
import { studentsService } from '../services/students.service';
import { imageService } from '../services/image.service';
import { emailService } from '../services/email.service';
import { smsService } from '../services/sms.service';

export const studentsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub;
      const created = await studentsService.create(
        req.body,
        userId,
        req.ip,
        req.get('user-agent')
      );

      // Send welcome email (async, don't wait)
      if (created.email) {
        emailService.sendWelcomeEmail(created.email, created.full_name)
          .catch(err => console.error('Failed to send welcome email:', err));
      }

      // Send welcome SMS (async, don't wait)
      if (created.phone) {
        smsService.sendWelcome(created.phone, created.full_name)
          .catch(err => console.error('Failed to send welcome SMS:', err));
      }

      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },
  async importCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) {
        return res.status(400).json({ error: { message: 'CSV file is required (field name: file)', code: 'VALIDATION_ERROR' } });
      }
      const result = await studentsService.importCsv(file.buffer);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
  async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await studentsService.exportCsv(req.query);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="students.csv"');
      res.send(csv);
    } catch (err) {
      next(err);
    }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await studentsService.getById(req.params.id);
      if (!item) return res.status(404).json({ error: { message: 'Not found', code: 'NOT_FOUND' } });
      res.json(item);
    } catch (err) {
      next(err);
    }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub;
      const updated = await studentsService.update(
        req.params.id,
        req.body,
        userId,
        req.ip,
        req.get('user-agent')
      );

      // Send status change notification if status changed
      if (req.body.status && updated.email) {
        emailService.sendStatusChangeEmail(updated.email, updated.full_name, req.body.status)
          .catch(err => console.error('Failed to send status change email:', err));
      }

      if (req.body.status && updated.phone) {
        smsService.sendStatusChange(updated.phone, updated.full_name, req.body.status)
          .catch(err => console.error('Failed to send status change SMS:', err));
      }

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub;
      await studentsService.delete(
        req.params.id,
        userId,
        req.ip,
        req.get('user-agent')
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await studentsService.list(req.query);
      res.json({ data: result.data, page: Number(req.query.page || 1), limit: Number(req.query.limit || 10), total: result.total });
    } catch (err) {
      next(err);
    }
  },

  async uploadProfilePicture(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const file = (req as any).file as Express.Multer.File | undefined;

      if (!file) {
        return res.status(400).json({ 
          error: { 
            message: 'Profile picture file is required (field name: picture)', 
            code: 'VALIDATION_ERROR' 
          } 
        });
      }

      // Get current student to check if old picture exists
      const student = await studentsService.getById(id);
      if (!student) {
        return res.status(404).json({ error: { message: 'Student not found', code: 'NOT_FOUND' } });
      }

      // Upload new picture
      const picturePath = await imageService.uploadProfilePicture(file);

      // Update student with new picture path
      const userId = (req as any).user?.sub;
      const updated = await studentsService.update(
        id,
        { profile_picture: picturePath },
        userId,
        req.ip,
        req.get('user-agent')
      );

      // Delete old picture if exists
      if (student.profile_picture) {
        await imageService.deleteProfilePicture(student.profile_picture)
          .catch(err => console.error('Failed to delete old profile picture:', err));
      }

      res.json({ 
        message: 'Profile picture uploaded successfully',
        profile_picture: picturePath,
        student: updated
      });
    } catch (err: any) {
      if (err.message && (err.message.includes('Invalid file type') || err.message.includes('File too large'))) {
        return res.status(400).json({ error: { message: err.message, code: 'VALIDATION_ERROR' } });
      }
      next(err);
    }
  },

  async deleteProfilePicture(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Get current student
      const student = await studentsService.getById(id);
      if (!student) {
        return res.status(404).json({ error: { message: 'Student not found', code: 'NOT_FOUND' } });
      }

      if (!student.profile_picture) {
        return res.status(400).json({ 
          error: { 
            message: 'Student has no profile picture', 
            code: 'VALIDATION_ERROR' 
          } 
        });
      }

      // Delete picture file
      await imageService.deleteProfilePicture(student.profile_picture);

      // Update student (remove picture path)
      const userId = (req as any).user?.sub;
      const updated = await studentsService.update(
        id,
        { profile_picture: null },
        userId,
        req.ip,
        req.get('user-agent')
      );

      res.json({ 
        message: 'Profile picture deleted successfully',
        student: updated
      });
    } catch (err) {
      next(err);
    }
  }
};
