import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { notificationService } from '../container';

/**
 * NotificationController — Thin Controller (SRP)
 * 
 * BEFORE: Used `(req as any).user` — LSP violation
 * AFTER: Uses properly typed AuthRequest
 */

export const getUserNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user!.id);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user!.id);
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await notificationService.deleteNotification(req.params.id, req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
