import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { ENV } from './server/config/env';
import userRoute from './server/routes/userRoute';
import postRoute from './server/routes/postRoute';
import commentRoute from './server/routes/commentRoute';
import adminRoute from './server/routes/adminRoute';
import notificationRoute from './server/routes/notificationRoute';
import testRoute from './server/routes/testRoute';
import { errorHandler } from './server/middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './server/config/swagger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Basic security and parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Swagger OpenAPI Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/api-docs-json', (_req, res) => res.json(swaggerDocument));
  app.get('/api/v1/docs/json', (_req, res) => res.json(swaggerDocument));

  // API Versioning and Routing
  const apiRouter = express.Router();
  apiRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  apiRouter.use('/auth', userRoute);
  apiRouter.use('/user', userRoute);
  apiRouter.use('/posts', postRoute);
  apiRouter.use('/comments', commentRoute);
  apiRouter.use('/admin', adminRoute);
  apiRouter.use('/notifications', notificationRoute);
  apiRouter.use('/tests', testRoute);

  // Health check
  apiRouter.get('/health', (_req, res) => {
    res.json({
      success: true,
      service: 'Meridian MERN Blog API',
      version: '1.0.0',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API router
  app.use('/api/v1', apiRouter);

  // Centralized Error Handler for API routes
  app.use('/api', errorHandler);

  // Vite Development / Production static file handling
  if (ENV.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Global fallback error handler
  app.use(errorHandler);

  const PORT = ENV.PORT;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Meridian MERN Server] Running on http://0.0.0.0:${PORT} in ${ENV.NODE_ENV} mode`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
