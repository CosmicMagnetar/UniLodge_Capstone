import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

/**
 * Centralized Error Handler Middleware
 * 
 * SOLID Principles:
 * - SRP: This middleware has ONE job — formatting error responses
 * - OCP: Adding new AppError subclasses does NOT require modifying this handler
 * 
 * Replaces the inline try/catch + res.status() in every controller.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle operational errors (thrown intentionally via AppError)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // Handle Mongoose duplicate key errors
  if ((err as any).code === 11000) {
    res.status(409).json({
      error: 'Duplicate resource already exists',
    });
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: err.message,
    });
    return;
  }

  // Unexpected errors — log and return generic message
  console.error('Unexpected error:', err);
  res.status(500).json({
    error: 'Internal server error',
  });
}
