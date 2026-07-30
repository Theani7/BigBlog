import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'READER' | 'AUTHOR' | 'EDITOR' | 'ADMIN';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['READER', 'AUTHOR', 'EDITOR', 'ADMIN'],
    default: 'READER',
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.index({ email: 1 });

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
