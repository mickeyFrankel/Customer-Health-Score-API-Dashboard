import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';

import { checklistService } from '../services/checklist-service';
import { validateRequest } from '../middleware/validate';
import {
  createChecklistSchema,
  updateChecklistSchema,
  listChecklistsQuerySchema,
  checklistIdSchema,
} from '../schemas/checklist.schema';
import { AppError } from '../errors/app-errors';
import type {
  CreateChecklistInput,
  UpdateChecklistInput,
  ListChecklistsQuery,
} from '../schemas/checklist.schema';

export const checklistRouter = Router();

/**
 * POST /api/checklists
 * Create a new customer health checklist
 */
checklistRouter.post(
  '/',
  validateRequest({ body: createChecklistSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as CreateChecklistInput;
      const checklist = await checklistService.createChecklist(data);

      res.status(201).json({
        data: checklist,
        message: 'Checklist created successfully',
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/checklists
 * List all checklists with optional filtering, sorting, and pagination
 * Query params: customerId, minScore, maxScore, limit, offset, sortBy, sortOrder
 */
checklistRouter.get(
  '/',
  validateRequest({ query: listChecklistsQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = req.query as unknown as ListChecklistsQuery;
      const result = await checklistService.listChecklists(params);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/checklists/:id
 * Get a single checklist by ID
 */
checklistRouter.get(
  '/:id',
  validateRequest({ params: checklistIdSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const checklist = await checklistService.getChecklistById(id);

      res.status(200).json({
        data: checklist,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * PUT /api/checklists/:id
 * Update an existing checklist
 * Supports partial updates - only provided fields will be updated
 */
checklistRouter.put(
  '/:id',
  validateRequest({
    params: checklistIdSchema,
    body: updateChecklistSchema,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body as UpdateChecklistInput;
      const checklist = await checklistService.updateChecklist(id, data);

      res.status(200).json({
        data: checklist,
        message: 'Checklist updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * DELETE /api/checklists/:id
 * Delete a checklist by ID
 */
checklistRouter.delete(
  '/:id',
  validateRequest({ params: checklistIdSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const checklist = await checklistService.deleteChecklist(id);

      res.status(200).json({
        data: checklist,
        message: 'Checklist deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/checklists/customer/:customerId/stats
 * Get aggregated statistics for a specific customer
 */
checklistRouter.get(
  '/customer/:customerId/stats',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { customerId } = req.params;
      const stats = await checklistService.getCustomerStats(customerId);

      res.status(200).json({
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
);
