/**
 * Zod Validation Middleware
 * Express middleware factory that validates req.body/req.query against a Zod schema.
 * On failure, returns a structured 400 error with per-field messages.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validate request body against a Zod schema.
 * On success, replaces req.body with the parsed + transformed value.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed; // Replace with coerced/defaulted values
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));

        res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: fieldErrors,
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Validate request query parameters against a Zod schema.
 * On success, replaces req.query with the parsed value.
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query);
      (req as any).validatedQuery = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));

        res.status(400).json({
          error: 'Invalid query parameters',
          code: 'VALIDATION_ERROR',
          details: fieldErrors,
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Validate request params (e.g., :id) against a Zod schema.
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Invalid URL parameters',
          code: 'VALIDATION_ERROR',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}
