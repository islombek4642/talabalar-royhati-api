import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import responseTime from 'response-time';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { metricsMiddleware, metricsHandler } from './middlewares/metrics';
import { requestTracingMiddleware } from './middlewares/requestTracing';
import { apiLimiter } from './middlewares/rateLimiter';
import { conditionalSwaggerAuth } from './middlewares/swaggerAuth';
import studentsRouter from './routes/students.route';
import healthRouter from './routes/health.route';
import authRouter from './routes/auth.route';
import studentAuthRouter from './routes/student-auth.route';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import fs from 'fs';
import path from 'path';

const app = express();

// Monitoring & Performance
if (env.ENABLE_METRICS) {
  app.use(metricsMiddleware);
}
app.use(responseTime());
app.use(requestTracingMiddleware);

// Security
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);
app.use(apiLimiter); // Rate limiting
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (_req, res) => {
  res.json({ name: "Talabalar Ro'yhati API", version: '1.0.0', status: 'ok' });
});

const openapiPath = path.resolve(process.cwd(), 'openapi.yaml');
if (fs.existsSync(openapiPath)) {
  const file = fs.readFileSync(openapiPath, 'utf-8');
  const openapi = YAML.parse(file);
  // Force same-origin so Swagger calls current host/protocol instead of localhost
  (openapi as any).servers = [{ url: '/' }];
  // Serve the raw spec for Swagger UI fetches if needed
  app.get('/openapi.yaml', (_req, res) => {
    res.type('text/yaml').send(file);
  });
  // Ensure no strict security headers interfere with Swagger assets
  app.use('/api-docs', conditionalSwaggerAuth, (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('X-Content-Security-Policy');
    res.removeHeader('X-WebKit-CSP');
    res.removeHeader('Cross-Origin-Opener-Policy');
    res.removeHeader('Cross-Origin-Resource-Policy');
    res.removeHeader('Cross-Origin-Embedder-Policy');
    next();
  }, swaggerUi.serve, swaggerUi.setup(openapi));
}

// Metrics endpoint (if enabled)
if (env.ENABLE_METRICS) {
  app.get('/metrics', metricsHandler);
}

app.use('/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/student', studentAuthRouter);
app.use('/api/v1/students', studentsRouter);

app.use(errorHandler);

export default app;
