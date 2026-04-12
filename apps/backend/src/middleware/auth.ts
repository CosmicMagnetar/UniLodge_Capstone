import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

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
      const decoded = jwt.verify(accessToken, JWT_SECRET) as JWTPayload;
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role as any,
        password: undefined,
        createdAt: user.createdAt.toString(),
      };

      next();
    } catch (error) {
      // Access token expired, try refresh token
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as JWTPayload;
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }

        // Generate new access token
        const newAccessToken = jwt.sign(
          { userId: user._id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: '15m' }
        );

        // Set new access token in cookie
        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 15 * 60 * 1000 // 15 minutes
        });

        req.user = {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as any,
          password: undefined,
          createdAt: user.createdAt.toString(),
        };

        next();
      } catch (refreshError) {
        console.error('Refresh token error:', refreshError);
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

export function wardenOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'WARDEN') {
    return res.status(403).json({ error: 'Warden access required' });
  }
  next();
}

export function guestOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'GUEST') {
    return res.status(403).json({ error: 'Guest access required' });
  }
  next();
}

export function adminOrWardenOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'WARDEN') {
    return res.status(403).json({ error: 'Admin or Warden access required' });
  }
  next();
}

export function generateTokens(userId: string, email: string, role: string) {
  const accessToken = jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, email, role },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}
