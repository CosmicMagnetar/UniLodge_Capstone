import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { tokenFactory, cookieFactory, userRepository } from '../container';

/**
 * Auth Middleware — Refactored
 * 
 * Changes from original:
 * - Uses TokenFactory (DIP) instead of raw jwt calls
 * - Uses CookieFactory (DIP) instead of inline res.cookie()
 * - Uses UserRepository (DIP) instead of User.findById()
 * - Removed adminOnly/wardenOnly/guestOnly (moved to roleAuthorizer.ts — OCP)
 * - Removed generateTokens (moved to TokenFactory.ts — SRP)
 */

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let accessToken = req.cookies?.accessToken;

    // Fallback to Authorization header
    if (!accessToken && req.headers.authorization?.startsWith('Bearer ')) {
      accessToken = req.headers.authorization.split(' ')[1];
    }

    if (!accessToken) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      // Verify access token using TokenFactory (DIP)
      const decoded = tokenFactory.verifyAccessToken(accessToken);
      const user = await userRepository.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = {
        id: (user as any)._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role as any,
        password: undefined,
        createdAt: (user as any).createdAt.toString(),
      };

      next();
    } catch (error) {
      // Access token expired — try refresh token
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      try {
        const decoded = tokenFactory.verifyRefreshToken(refreshToken);
        const user = await userRepository.findById(decoded.userId);

        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }

        // Generate new access token using TokenFactory
        const newAccessToken = tokenFactory.createAccessToken({
          userId: (user as any)._id.toString(),
          email: user.email,
          role: user.role,
        });

        // Set cookie using CookieFactory (DRY — no more inline cookie config)
        cookieFactory.setAccessTokenCookie(res, newAccessToken);

        req.user = {
          id: (user as any)._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as any,
          password: undefined,
          createdAt: (user as any).createdAt.toString(),
        };

        next();
      } catch (refreshError) {
        console.error('Refresh token error:', refreshError);
        cookieFactory.clearAuthCookies(res);
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}
