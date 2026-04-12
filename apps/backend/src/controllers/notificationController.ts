import { Request, Response } from 'express';
import Notification from '../models/Notification';
import mongoose from 'mongoose';

// Get all notifications for the logged-in user
export const getUserNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 notifications

        res.json(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId }, // Ensure user owns this notification
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const notification = await Notification.findOneAndDelete({
            _id: id,
            userId // Ensure user owns this notification
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Helper function to create a notification (used internally by other controllers)
export const createNotification = async (
    userId: mongoose.Types.ObjectId | string,
    type: 'rejection' | 'info' | 'success' | 'warning',
    title: string,
    message: string,
    relatedId?: string,
    relatedType?: 'booking-request' | 'room' | 'booking',
    expiresInDays?: number
) => {
    try {
        const notification = new Notification({
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
                : undefined
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
        throw error;
    }
};
