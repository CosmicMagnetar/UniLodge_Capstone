import { INotificationRepository } from '../interfaces/repositories/INotificationRepository';
import { NotificationFactory, NotificationData } from '../factories/NotificationFactory';
import { NotFoundError, UnauthorizedError } from '../errors/AppError';
import mongoose from 'mongoose';

/**
 * NotificationService — Service Layer (SRP)
 * 
 * Single Responsibility: ALL notification business logic.
 * DIP: Depends on INotificationRepository interface.
 */
export class NotificationService {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly notificationFactory: NotificationFactory
  ) {}

  /**
   * Get user's notifications
   */
  async getUserNotifications(userId: string) {
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }
    return this.notificationRepository.findByUser(userId);
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string, userId: string) {
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const notification = await this.notificationRepository.markAsRead(id, userId);
    if (!notification) {
      throw new NotFoundError('Notification');
    }
    return notification;
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string, userId: string) {
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const notification = await this.notificationRepository.delete(id, userId);
    if (!notification) {
      throw new NotFoundError('Notification');
    }
    return { message: 'Notification deleted successfully' };
  }

  /**
   * Create a notification (used by other services)
   */
  async createNotification(
    userId: mongoose.Types.ObjectId | string,
    type: 'rejection' | 'info' | 'success' | 'warning',
    title: string,
    message: string,
    relatedId?: string,
    relatedType?: 'booking-request' | 'room' | 'booking',
    expiresInDays?: number
  ) {
    let data: NotificationData;

    switch (type) {
      case 'rejection':
        data = this.notificationFactory.createRejection(userId, title, message, relatedId, relatedType, expiresInDays);
        break;
      case 'success':
        data = this.notificationFactory.createSuccess(userId, title, message, relatedId, relatedType);
        break;
      case 'warning':
        data = this.notificationFactory.createWarning(userId, title, message, relatedId, relatedType);
        break;
      case 'info':
      default:
        data = this.notificationFactory.createInfo(userId, title, message, relatedId, relatedType);
        break;
    }

    return this.notificationRepository.create(data);
  }
}
