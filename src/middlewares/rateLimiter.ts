import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 10000 : 100, // 10000 in dev (effectively unlimited), 100 in production
  message: {
    error: {
      message: 'Too many requests from this IP, please try again after 15 minutes',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => process.env.NODE_ENV === 'development', // Skip rate limiting in development
});

// Stricter limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 5, // 1000 in dev (effectively disabled), 5 in production
  message: {
    error: {
      message: 'Too many login attempts, please try again after 15 minutes',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    }
  },
  skipSuccessfulRequests: true, // Don't count successful logins
  skipFailedRequests: false, // Count failed attempts for security
  skip: (req) => process.env.NODE_ENV === 'development', // Skip rate limiting in development
});

// More lenient limiter for public read endpoints
export const publicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 10000 : 30, // 10000 in dev, 30 in production
  message: {
    error: {
      message: 'Too many requests, please slow down',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  skip: (req) => process.env.NODE_ENV === 'development', // Skip in development
});

// Strict limiter for write operations
export const writeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 10000 : 10, // 10000 in dev (unlimited), 10 in production
  message: {
    error: {
      message: 'Too many write operations, please slow down',
      code: 'WRITE_RATE_LIMIT_EXCEEDED'
    }
  },
  skip: (req) => process.env.NODE_ENV === 'development', // Skip in development
});
