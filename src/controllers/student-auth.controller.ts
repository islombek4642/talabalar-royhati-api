import { Request, Response, NextFunction } from 'express';
import { studentAuthService } from '../services/student-auth.service';

export const studentAuthController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await studentAuthService.register(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      if (err.message === 'Email already registered') {
        return res.status(400).json({
          error: {
            message: err.message,
            code: 'EMAIL_ALREADY_EXISTS'
          }
        });
      }
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await studentAuthService.login(req.body);
      res.json(result);
    } catch (err: any) {
      if (err.message === 'Invalid email or password') {
        return res.status(401).json({
          error: {
            message: err.message,
            code: 'INVALID_CREDENTIALS'
          }
        });
      }
      next(err);
    }
  },

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub;
      const profile = await studentAuthService.getProfile(userId);
      res.json(profile);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub;
      const updated = await studentAuthService.updateProfile(userId, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub;
      const { current_password, new_password } = req.body;
      const result = await studentAuthService.changePassword(userId, current_password, new_password);
      res.json(result);
    } catch (err: any) {
      if (err.message === 'Current password is incorrect') {
        return res.status(400).json({
          error: {
            message: err.message,
            code: 'INVALID_PASSWORD'
          }
        });
      }
      next(err);
    }
  },

  async logout(req: Request, res: Response) {
    // Client-side will remove JWT token
    res.json({ message: 'Logged out successfully' });
  }
};
