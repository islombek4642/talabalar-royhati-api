import { Request, Response, NextFunction } from 'express';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

export function issueToken(
  payload: Record<string, unknown>,
  secret: Secret,
  expiresIn: SignOptions['expiresIn'] = '1h'
) {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, secret, options);
}

export function verifyToken(token: string, secret: Secret) {
  return jwt.verify(token, secret);
}

export function requireAuth(secret: Secret) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } });
    }
    const token = auth.slice('Bearer '.length);
    try {
      const payload = verifyToken(token, secret);
      (req as any).user = payload;
      next();
    } catch (e) {
      return res.status(401).json({ error: { message: 'Invalid token', code: 'UNAUTHORIZED' } });
    }
  };
}
