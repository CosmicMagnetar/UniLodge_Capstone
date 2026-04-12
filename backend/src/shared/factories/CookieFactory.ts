import { Response } from 'express';
import { TokenPair } from './TokenFactory';

/**
 * CookieFactory — Factory Pattern
 * 
 * Centralizes cookie configuration that was previously copy-pasted 6+ times
 * across authController.ts and auth.ts middleware.
 * 
 * SOLID Principles:
 * - SRP: Single responsibility — HTTP cookie management
 * - DRY: Eliminates duplicated cookie configuration
 */
export class CookieFactory {
  private readonly isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Sets both access and refresh token cookies on the response
   */
  setAuthCookies(res: Response, tokens: TokenPair): void {
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  /**
   * Sets only the access token cookie (used during token refresh)
   */
  setAccessTokenCookie(res: Response, accessToken: string): void {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
  }

  /**
   * Clears all authentication cookies
   */
  clearAuthCookies(res: Response): void {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }
}
