import { Response, NextFunction } from 'express';
import { AuthRequest, Role } from '../types';
import { ForbiddenError } from '../errors/AppError';

/**
 * Role Authorizer — Strategy Pattern
 * 
 * Replaces the separate adminOnly, wardenOnly, guestOnly, adminOrWardenOnly functions.
 * 
 * SOLID Principles:
 * - OCP: Adding a new role (e.g. SUPER_ADMIN) requires ZERO changes to this function.
 *         Just call authorize(Role.SUPER_ADMIN) at the route level.
 * - SRP: Single responsibility — checks if authenticated user has an allowed role
 * - LSP: Works with any role that extends the Role enum
 * 
 * Usage:
 *   router.get('/admin-route', authMiddleware, authorize(Role.ADMIN), handler);
 *   router.get('/staff-route', authMiddleware, authorize(Role.ADMIN, Role.WARDEN), handler);
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole as Role)) {
      throw new ForbiddenError(
        `Access denied. Required role: ${allowedRoles.join(' or ')}`
      );
    }

    next();
  };
}
