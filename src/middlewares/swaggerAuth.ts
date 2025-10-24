import basicAuth from 'express-basic-auth';
import { env } from '../config/env';

// Basic auth for Swagger UI in production
export const swaggerAuth = basicAuth({
  users: {
    [env.SWAGGER_USERNAME]: env.SWAGGER_PASSWORD
  },
  challenge: true,
  realm: 'Swagger Documentation'
});

// Conditional middleware - only apply in production
export function conditionalSwaggerAuth(req: any, res: any, next: any) {
  if (env.NODE_ENV === 'production') {
    return swaggerAuth(req, res, next);
  }
  next();
}
