import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'rejection' | 'info' | 'success' | 'warning';
    title: string;
    message: string;
    relatedId?: string;
    relatedType?: 'booking-request' | 'room' | 'booking';
    read: boolean;
    createdAt: Date;
    expiresAt?: Date;
}

const notificationSchema = new Schema<INotification>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['rejection', 'info', 'success', 'warning'],
        required: true,
        default: 'info'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    relatedId: {
        type: String,
        required: false
    },
    relatedType: {
        type: String,
        enum: ['booking-request', 'room', 'booking'],
        required: false
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    expiresAt: {
        type: Date,
        required: false
    }
});

// Create TTL index for auto-deletion of expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for efficient querying
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
