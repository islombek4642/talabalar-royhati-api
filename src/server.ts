import { createServer } from 'http';
import app from './app.js';
import { env } from './config/env';
import { logger } from './utils/logger';
import { startCleanupScheduler } from './services/cleanup.service';

const port = env.PORT;
const server = createServer(app);

server.listen(port, () => {
  logger.info({ port }, 'Server started');
  
  // Start automatic cleanup of expired soft-deleted students
  startCleanupScheduler();
});
