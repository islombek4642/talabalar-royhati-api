import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema<any>, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      return next({
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: parsed.error.errors.map(e => ({ field: e.path.join('.'), issue: e.message }))
      });
    }
    if (source === 'body') req.body = parsed.data;
    if (source === 'query') req.query = parsed.data as any;
    if (source === 'params') req.params = parsed.data as any;
    next();
  };
}
