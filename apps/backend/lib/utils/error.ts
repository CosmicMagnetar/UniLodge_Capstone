/**
 * Error Handling Utility Functions
 * Helper functions for consistent error handling and validation
 */

/**
 * Custom error classes for different error scenarios
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    super(message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = "Unauthorized access") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

/**
 * Format error response for API responses
 */
export function formatErrorResponse(error: any) {
  return {
    error: {
      name: error.name || "Error",
      message: error.message || "An unexpected error occurred",
      code: getErrorCode(error),
    },
  };
}

/**
 * Get HTTP status code based on error type
 */
export function getErrorCode(error: any): number {
  if (error instanceof ValidationError) return 400;
  if (error instanceof BadRequestError) return 400;
  if (error instanceof UnauthorizedError) return 401;
  if (error instanceof NotFoundError) return 404;
  if (error instanceof ConflictError) return 409;
  return 500;
}

/**
 * Safe error extraction
 */
export function getSafeErrorMessage(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error?.message) {
    return error.message;
  }
  return "An unexpected error occurred";
}

/**
 * Log error with context
 */
export function logError(
  error: any,
  context: string,
  additionalData?: Record<string, any>
): void {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    name: error?.name || "Unknown",
    message: getSafeErrorMessage(error),
    stack: error?.stack,
    ...additionalData,
  };

  console.error("ERROR:", JSON.stringify(errorInfo, null, 2));
}

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, any>,
  requiredFields: string[]
): void {
  const missing = requiredFields.filter((field) => !data[field]);

  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(", ")}`
    );
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate date range
 */
export function validateDateRange(startDate: Date, endDate: Date): void {
  if (startDate >= endDate) {
    throw new ValidationError("Start date must be before end date");
  }
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(
  value: number,
  fieldName: string
): void {
  if (value <= 0) {
    throw new ValidationError(`${fieldName} must be a positive number`);
  }
}

/**
 * Validate string length
 */
export function validateStringLength(
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string
): void {
  if (value.length < minLength || value.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be between ${minLength} and ${maxLength} characters`
    );
  }
}

/**
 * Safely parse JSON
 */
export function safeParseJSON(jsonString: string, fallback: any = null): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return fallback;
  }
}

/**
 * Handle async errors and convert to formatted response
 */
export async function handleAsyncError<T>(
  fn: () => Promise<T>,
  context: string
): Promise<{ data?: T; error?: any }> {
  try {
    const data = await fn();
    return { data };
  } catch (error) {
    logError(error, context);
    return { error: formatErrorResponse(error) };
  }
}
