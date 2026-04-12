import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { authService, cookieFactory } from '../container';
import { registerSchema, loginSchema } from '../validators/schemas';
import { ValidationError, UnauthorizedError } from '../errors/AppError';

/**
 * AuthController — Thin Controller (SRP)
 * 
 * BEFORE: Controllers contained validation, DB queries, bcrypt, JWT, cookies, formatting.
 * AFTER: Controllers only do:
 *   1. Parse & validate input (Zod)
 *   2. Delegate to service
 *   3. Set cookies (CookieFactory)
 *   4. Format HTTP response
 *   5. Pass errors to next() for centralized handling
 */

export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors.map(e => e.message).join(', '));
    }

    const { name, email, password } = parsed.data;
    const result = await authService.register(name, email, password);

    cookieFactory.setAuthCookies(res, result.tokens);

    res.status(201).json({
      message: 'User registered successfully',
      token: result.tokens.accessToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors.map(e => e.message).join(', '));
    }

    const { email, password } = parsed.data;
    const result = await authService.login(email, password);

    cookieFactory.setAuthCookies(res, result.tokens);

    res.json({
      message: 'Login successful',
      token: result.tokens.accessToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    cookieFactory.clearAuthCookies(res);
    res.json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

export const refreshTokenEndpoint = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedError('No refresh token');
    }

    const tokens = await authService.refreshToken(refreshToken);
    cookieFactory.setAuthCookies(res, tokens);

    res.json({ message: 'Token refreshed', token: tokens.accessToken });
  } catch (error) {
    cookieFactory.clearAuthCookies(res);
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    const profile = await authService.getProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export const getWardens = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const wardens = await authService.getWardens();
    res.json(wardens);
  } catch (error) {
    next(error);
  }
};
