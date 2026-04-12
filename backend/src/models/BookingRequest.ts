import mongoose, { Schema, Document } from 'mongoose';

export interface IBookingRequest extends Document {
    roomId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    checkInDate: Date;
    checkOutDate: Date;
    status: 'pending' | 'approved' | 'rejected';
    message: string;
    totalPrice: number;
    createdAt: Date;
    respondedAt?: Date;
    respondedBy?: mongoose.Types.ObjectId;
}

const BookingRequestSchema = new Schema<IBookingRequest>({
    roomId: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    checkInDate: {
        type: Date,
        required: true,
    },
    checkOutDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    message: {
        type: String,
        default: '',
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    respondedAt: {
        type: Date,
    },
    respondedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
});

// Indexes for efficient querying
BookingRequestSchema.index({ userId: 1, status: 1 });
BookingRequestSchema.index({ status: 1, createdAt: -1 });

const BookingRequest = mongoose.models.BookingRequest || mongoose.model<IBookingRequest>('BookingRequest', BookingRequestSchema);

export default BookingRequest;
