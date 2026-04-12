import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomNumber: string;
  type: 'Single' | 'Double' | 'Suite' | 'Studio';
  price: number;
  amenities: string[];
  rating: number;
  imageUrl: string;
  isAvailable: boolean;
  description?: string;
  capacity: number;
  university: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  wardenId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RoomSchema = new Schema<IRoom>({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['Single', 'Double', 'Suite', 'Studio'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  amenities: {
    type: [String],
    default: [],
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    default: '',
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  university: {
    type: String,
    required: true,
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  wardenId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export model - check if it already exists to avoid recompiling
const Room = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);

export default Room;
