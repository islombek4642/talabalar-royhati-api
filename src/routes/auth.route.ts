import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { authLimiter } from '../middlewares/rateLimiter';
import { env } from '../config/env';
import { adminAuthService } from '../services/admin-auth.service';

const router = Router();

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    
    if (!username || !password) {
      return res.status(400).json({ 
        error: { message: 'Username and password are required', code: 'VALIDATION_ERROR' } 
      });
    }

    const result = await adminAuthService.login(username, password);
    res.json(result);
  } catch (err: any) {
    if (err.message === 'Invalid credentials' || err.message === 'Admin account is disabled') {
      return res.status(401).json({ 
        error: { message: err.message, code: 'UNAUTHORIZED' } 
      });
    }
    next(err);
  }
});

router.post('/change-password', requireAuth(env.JWT_SECRET), authLimiter, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const adminId = (req as any).user?.sub;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: { message: 'Current password and new password are required', code: 'VALIDATION_ERROR' } 
      });
    }

    if (!adminId) {
      return res.status(401).json({ 
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } 
      });
    }

    const result = await adminAuthService.changePassword(adminId, currentPassword, newPassword);
    res.json(result);
  } catch (err: any) {
    if (err.message === 'Current password is incorrect') {
      return res.status(401).json({ 
        error: { message: err.message, code: 'INVALID_PASSWORD' } 
      });
    }
    if (err.message === 'New password must be at least 6 characters') {
      return res.status(400).json({ 
        error: { message: err.message, code: 'VALIDATION_ERROR' } 
      });
    }
    next(err);
  }
});

router.get('/profile', requireAuth(env.JWT_SECRET), async (req, res, next) => {
  try {
    const adminId = (req as any).user?.sub;
    
    if (!adminId) {
      return res.status(401).json({ 
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } 
      });
    }

    const profile = await adminAuthService.getProfile(adminId);
    res.json(profile);
  } catch (err: any) {
    if (err.message === 'Admin not found') {
      return res.status(404).json({ 
        error: { message: err.message, code: 'NOT_FOUND' } 
      });
    }
    next(err);
  }
});

router.patch('/profile', requireAuth(env.JWT_SECRET), authLimiter, async (req, res, next) => {
  try {
    const adminId = (req as any).user?.sub;
    const { full_name, email, phone } = req.body || {};
    
    if (!adminId) {
      return res.status(401).json({ 
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } 
      });
    }

    const updatedProfile = await adminAuthService.updateProfile(adminId, {
      full_name,
      email,
      phone
    });
    
    res.json({
      message: 'Profile updated successfully',
      admin: updatedProfile
    });
  } catch (err: any) {
    if (err.message === 'Admin not found') {
      return res.status(404).json({ 
        error: { message: err.message, code: 'NOT_FOUND' } 
      });
    }
    if (err.message === 'Email already in use') {
      return res.status(400).json({ 
        error: { message: err.message, code: 'DUPLICATE_EMAIL' } 
      });
    }
    next(err);
  }
});

export default router;
