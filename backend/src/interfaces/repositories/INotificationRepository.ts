import { INotification } from '../../models/Notification';

/**
 * INotificationRepository — Interface Segregation Principle (ISP)
 */
export interface INotificationRepository {
  findByUser(userId: string, limit?: number): Promise<INotification[]>;
  markAsRead(id: string, userId: string): Promise<INotification | null>;
  delete(id: string, userId: string): Promise<INotification | null>;
  create(data: Record<string, any>): Promise<INotification>;
}
