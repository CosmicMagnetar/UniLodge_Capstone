import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
    name: string;
    email: string;
    subject: string;
    message: string;
    userId?: mongoose.Types.ObjectId;
    status: 'new' | 'replied' | 'resolved';
    createdAt: Date;
}

const ContactSchema = new Schema<IContact>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['new', 'replied', 'resolved'],
        default: 'new',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient querying
ContactSchema.index({ status: 1, createdAt: -1 });

const Contact = mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);

export default Contact;
