import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * TokenFactory — Factory Pattern
 * 
 * Centralizes ALL token creation and verification logic.
 * Previously this was scattered across authController.ts and auth.ts middleware.
 * 
 * SOLID Principles:
 * - SRP: Single responsibility — token lifecycle management
 * - OCP: Can extend with new token types without modifying existing code
 * - DIP: Services depend on TokenFactory abstraction, not raw jwt calls
 */
export class TokenFactory {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: number;
  private readonly refreshExpiresIn: number;

  constructor() {
    this.accessSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.refreshSecret = process.env.REFRESH_SECRET || 'your-refresh-secret-change-in-production';
    this.accessExpiresIn = 15 * 60; // 15 minutes in seconds
    this.refreshExpiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
  }

  /**
   * Creates a pair of access + refresh tokens
   */
  createTokenPair(userId: string, email: string, role: string): TokenPair {
    const accessToken = this.createAccessToken({ userId, email, role });
    const refreshToken = this.createRefreshToken({ userId, email, role });
    return { accessToken, refreshToken };
  }

  /**
   * Creates a short-lived access token
   */
  createAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.accessSecret, { expiresIn: this.accessExpiresIn });
  }

  /**
   * Creates a long-lived refresh token
   */
  createRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshExpiresIn });
  }

  /**
   * Verifies and decodes an access token
   * @throws jwt.JsonWebTokenError if invalid
   */
  verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, this.accessSecret) as JWTPayload;
  }

  /**
   * Verifies and decodes a refresh token
   * @throws jwt.JsonWebTokenError if invalid
   */
  verifyRefreshToken(token: string): JWTPayload {
    return jwt.verify(token, this.refreshSecret) as JWTPayload;
  }
}
