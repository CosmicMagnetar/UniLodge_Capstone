/**
 * Logger Service - Singleton Pattern
 * Ensures only one logger instance is used throughout the application
 * Can easily be swapped with Winston, Bunyan, or any other logger
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ILogger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, error?: any, meta?: any): void;
}

/**
 * Simple Logger Implementation
 */
class SimpleLogger implements ILogger {
  private static instance: SimpleLogger;

  private constructor() {}

  static getInstance(): SimpleLogger {
    if (!SimpleLogger.instance) {
      SimpleLogger.instance = new SimpleLogger();
    }
    return SimpleLogger.instance;
  }

  debug(message: string, meta?: any): void {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(`[DEBUG] ${message}`, meta);
    }
  }

  info(message: string, meta?: any): void {
    console.log(`[INFO] ${message}`, meta);
  }

  warn(message: string, meta?: any): void {
    console.warn(`[WARN] ${message}`, meta);
  }

  error(message: string, error?: any, meta?: any): void {
    console.error(`[ERROR] ${message}`, error, meta);
  }
}

export const Logger = SimpleLogger.getInstance();
