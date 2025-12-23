import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';

import { healthRouter } from './routes/health';
import { checklistRouter } from './routes/checklist';
import { AppError } from './errors/app-errors';

export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(express.json());

  // Routes
  app.use('/health', healthRouter);
  app.use('/api/checklists', checklistRouter);

  app.get('/', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // 404 handler - must be after all routes
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested resource does not exist',
    });
  });

  // Global error handler - must be last
  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    // Handle custom application errors
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.code || 'ERROR',
        message: error.message,
      });
    }

    // Handle unexpected errors
    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    });
  });

  return app;
}
