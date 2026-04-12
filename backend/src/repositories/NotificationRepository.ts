import Notification, { INotification } from '../models/Notification';
import { INotificationRepository } from '../interfaces/repositories/INotificationRepository';

/**
 * NotificationRepository — Concrete Mongoose implementation.
 * 
 * Design Patterns: Repository Pattern, DIP, SRP
 */
export class NotificationRepository implements INotificationRepository {
  async findByUser(userId: string, limit: number = 50): Promise<INotification[]> {
    return Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async markAsRead(id: string, userId: string): Promise<INotification | null> {
    return Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );
  }

  async delete(id: string, userId: string): Promise<INotification | null> {
    return Notification.findOneAndDelete({ _id: id, userId });
  }

  async create(data: Record<string, any>): Promise<INotification> {
    const notification = new Notification(data);
    await notification.save();
    return notification;
  }
}
