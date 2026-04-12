import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/types';
import { analyticsService } from '../../core/container';

/**
 * AnalyticsController — Thin Controller (SRP)
 */

export const getAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const analytics = await analyticsService.getAnalytics();
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};
