import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodError } from 'zod';

/**
 * Express middleware for validating request data using Zod schemas
 */
export function validateRequest(schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body if schema provided
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      // Validate query parameters if schema provided
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }

      // Validate route parameters if schema provided
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }

      next();
    } catch (error) {
      // Format Zod validation errors into a user-friendly response
      if (isZodError(error)) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      // Pass unexpected errors to Express error handler
      next(error);
    }
  };
}

/**
 * Type guard to check if an error is a Zod validation error
 */
function isZodError(error: unknown): error is ZodError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'issues' in error &&
    Array.isArray((error as { issues: unknown[] }).issues)
  );
}
