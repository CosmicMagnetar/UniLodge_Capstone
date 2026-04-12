import mongoose from 'mongoose';

/**
 * Factory for creating notification data objects.
 * 
 * Factory Pattern — Encapsulates the construction logic for different
 * notification types. Each factory method ensures consistent structure.
 * 
 * SOLID: SRP — only responsible for constructing notification data
 */
export interface NotificationData {
  userId: mongoose.Types.ObjectId | string;
  type: 'rejection' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: 'booking-request' | 'room' | 'booking';
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export class NotificationFactory {
  /**
   * Creates a rejection notification (used when rooms or booking requests are rejected)
   */
  createRejection(
    userId: mongoose.Types.ObjectId | string,
    title: string,
    message: string,
    relatedId?: string,
    relatedType?: 'booking-request' | 'room' | 'booking',
    expiresInDays: number = 7
  ): NotificationData {
    return this.buildNotification('rejection', userId, title, message, relatedId, relatedType, expiresInDays);
  }

  /**
   * Creates an informational notification
   */
  createInfo(
    userId: mongoose.Types.ObjectId | string,
    title: string,
    message: string,
    relatedId?: string,
    relatedType?: 'booking-request' | 'room' | 'booking'
  ): NotificationData {
    return this.buildNotification('info', userId, title, message, relatedId, relatedType);
  }

  /**
   * Creates a success notification
   */
  createSuccess(
    userId: mongoose.Types.ObjectId | string,
    title: string,
    message: string,
    relatedId?: string,
    relatedType?: 'booking-request' | 'room' | 'booking'
  ): NotificationData {
    return this.buildNotification('success', userId, title, message, relatedId, relatedType);
  }

  /**
   * Creates a warning notification
   */
  createWarning(
    userId: mongoose.Types.ObjectId | string,
    title: string,
    message: string,
    relatedId?: string,
    relatedType?: 'booking-request' | 'room' | 'booking'
  ): NotificationData {
    return this.buildNotification('warning', userId, title, message, relatedId, relatedType);
  }

  /**
   * Internal builder — ensures consistent structure for all notification types
   */
  private buildNotification(
    type: NotificationData['type'],
    userId: mongoose.Types.ObjectId | string,
    title: string,
    message: string,
    relatedId?: string,
    relatedType?: NotificationData['relatedType'],
    expiresInDays?: number
  ): NotificationData {
    return {
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      read: false,
      createdAt: new Date(),
      expiresAt: expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : undefined,
    };
  }
}
