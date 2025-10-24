import { Router } from 'express';
import { issueToken } from '../middlewares/auth';
import { authLimiter } from '../middlewares/rateLimiter';
import { env } from '../config/env';

const router = Router();

router.post('/login', authLimiter, (req, res) => {
  const { username, password } = req.body || {};
  const u = process.env.ADMIN_USERNAME || 'admin';
  const p = process.env.ADMIN_PASSWORD || 'admin123';
  if (username !== u || password !== p) {
    return res.status(401).json({ error: { message: 'Invalid credentials', code: 'UNAUTHORIZED' } });
  }
  const token = issueToken({ sub: username, role: 'admin' }, process.env.JWT_SECRET || 'dev_secret', '2h');
  res.json({ access_token: token, token_type: 'Bearer' });
});

export default router;
