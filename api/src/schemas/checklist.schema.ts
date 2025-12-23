import { z } from 'zod';

/**
 * Validation schema for creating a new customer health checklist
 */
export const createChecklistSchema = z.object({
  customerId: z
    .string()
    .min(1, 'Customer ID is required')
    .max(100, 'Customer ID must be less than 100 characters'),
  score: z
    .number()
    .int('Score must be an integer')
    .min(0, 'Score must be at least 0')
    .max(100, 'Score must be at most 100'),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .nullable(),
});

/**
 * Validation schema for updating an existing customer health checklist
 * All fields are optional since this is a partial update
 */
export const updateChecklistSchema = z.object({
  customerId: z
    .string()
    .min(1, 'Customer ID must not be empty')
    .max(100, 'Customer ID must be less than 100 characters')
    .optional(),
  score: z
    .number()
    .int('Score must be an integer')
    .min(0, 'Score must be at least 0')
    .max(100, 'Score must be at most 100')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .nullable(),
});

/**
 * Validation schema for query parameters when listing checklists
 */
export const listChecklistsQuerySchema = z.object({
  customerId: z.string().optional(),
  minScore: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(0).max(100))
    .optional(),
  maxScore: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(0).max(100))
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100))
    .optional()
    .default('10'),
  offset: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(0))
    .optional()
    .default('0'),
  sortBy: z.enum(['createdAt', 'updatedAt', 'score']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Validation schema for checklist ID parameter
 */
export const checklistIdSchema = z.object({
  id: z.string().min(1, 'Checklist ID is required'),
});

// Type exports derived from schemas
export type CreateChecklistInput = z.infer<typeof createChecklistSchema>;
export type UpdateChecklistInput = z.infer<typeof updateChecklistSchema>;
export type ListChecklistsQuery = z.infer<typeof listChecklistsQuerySchema>;
export type ChecklistIdParam = z.infer<typeof checklistIdSchema>;
