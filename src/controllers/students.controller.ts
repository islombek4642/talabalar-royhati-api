import { Request, Response, NextFunction } from 'express';
import { studentsService } from '../services/students.service';

export const studentsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await studentsService.create(req.body);
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
      const updated = await studentsService.update(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await studentsService.delete(req.params.id);
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
  }
};
