import mongoose, { Schema, Document } from 'mongoose';

export interface IUniversity extends Document {
  name: string;
  domain: string;
  isRegistered: boolean;
  createdAt: Date;
}

const UniversitySchema = new Schema<IUniversity>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  domain: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  isRegistered: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const University = mongoose.models.University || mongoose.model<IUniversity>('University', UniversitySchema);

export default University;
