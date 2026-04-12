/**
 * AppError — Custom error hierarchy for centralized error handling.
 * 
 * SOLID Principles:
 * - LSP: All subclasses can substitute for AppError
 * - OCP: New error types can be added by extending, not modifying
 * - SRP: Each error class represents one specific error condition
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Maintains proper stack trace for where error was thrown
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 — Resource not found
 */
export class NotFoundError extends AppError {
  constructor(entity: string) {
    super(`${entity} not found`, 404);
  }
}

/**
 * 400 — Validation / bad request
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * 401 — Authentication failed
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

/**
 * 403 — Insufficient permissions
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

/**
 * 409 — Conflict (duplicate resource)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}
