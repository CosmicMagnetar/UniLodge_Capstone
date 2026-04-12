/**
 * Custom Error Types
 * Classification of errors for better error handling
 */

/**
 * BASE: AppError
 * All application errors should extend this
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    message: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * VALIDATION: ValidationError
 * User provided invalid input
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', 400, message, details);
    this.name = 'ValidationError';
  }
}

/**
 * AUTHENTICATION: AuthenticationError
 * User not authenticated
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super('AUTHENTICATION_ERROR', 401, message);
    this.name = 'AuthenticationError';
  }
}

/**
 * AUTHORIZATION: AuthorizationError
 * User authenticated but not authorized
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super('AUTHORIZATION_ERROR', 403, message);
    this.name = 'AuthorizationError';
  }
}

/**
 * NOT FOUND: NotFoundError
 * Resource does not exist
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(
      'NOT_FOUND',
      404,
      `${resource} with ID ${id} not found`
    );
    this.name = 'NotFoundError';
  }
}

/**
 * CONFLICT: ConflictError
 * Resource already exists or state conflict
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', 409, message);
    this.name = 'ConflictError';
  }
}

/**
 * BUSINESS LOGIC: BusinessLogicError
 * Violates business rules
 */
export class BusinessLogicError extends AppError {
  constructor(message: string) {
    super('BUSINESS_LOGIC_ERROR', 422, message);
    this.name = 'BusinessLogicError';
  }
}

/**
 * DATABASE: DatabaseError
 * Database operation failed
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super('DATABASE_ERROR', 500, message, details);
    this.name = 'DatabaseError';
  }
}

/**
 * EXTERNAL SERVICE: ExternalServiceError
 * Third-party service failed
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super('EXTERNAL_SERVICE_ERROR', 502, `${service} service failed: ${message}`);
    this.name = 'ExternalServiceError';
  }
}

/**
 * INTERNAL: InternalError
 * Unexpected internal error
 */
export class InternalError extends AppError {
  constructor(message: string = 'Internal server error') {
    super('INTERNAL_ERROR', 500, message);
    this.name = 'InternalError';
  }
}

/**
 * ERROR HANDLER: Global error handler
 * Used in express error middleware
 */
export class ErrorHandler {
  /**
   * Handle error and return appropriate response
   */
  static handle(error: any) {
    if (error instanceof AppError) {
      return {
        code: error.code,
        statusCode: error.statusCode,
        message: error.message,
        details: error.details,
      };
    }

    // Unknown error
    console.error('Unhandled error:', error);

    return {
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      message: 'An unexpected error occurred',
    };
  }

  /**
   * Log error
   */
  static log(error: any) {
    if (error instanceof AppError) {
      console.error(`[${error.code}]`, error.message);
      if (error.details) {
        console.error('Details:', error.details);
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
}
