import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import studentsRouter from './routes/students.route';
import healthRouter from './routes/health.route';
import authRouter from './routes/auth.route';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import fs from 'fs';
import path from 'path';

const app = express();

app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ name: "Talabalar Ro'yhati API", version: '1.0.0', status: 'ok' });
});

const openapiPath = path.resolve(process.cwd(), 'openapi.yaml');
if (fs.existsSync(openapiPath)) {
  const file = fs.readFileSync(openapiPath, 'utf-8');
  const openapi = YAML.parse(file);
  // Serve the raw spec for Swagger UI fetches if needed
  app.get('/openapi.yaml', (_req, res) => {
    res.type('text/yaml').send(file);
  });
  // Ensure no strict security headers interfere with Swagger assets
  app.use('/api-docs', (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('X-Content-Security-Policy');
    res.removeHeader('X-WebKit-CSP');
    res.removeHeader('Cross-Origin-Opener-Policy');
    res.removeHeader('Cross-Origin-Resource-Policy');
    res.removeHeader('Cross-Origin-Embedder-Policy');
    next();
  }, swaggerUi.serve, swaggerUi.setup(openapi));
}

app.use('/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/students', studentsRouter);

app.use(errorHandler);

export default app;
