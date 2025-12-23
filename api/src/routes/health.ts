import { Router } from 'express';

import { getHealthSummary } from '../services/health-service';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res, next) => {
  try {
    const summary = await getHealthSummary();
    res.json({
      ...summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});
