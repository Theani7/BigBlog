import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'ADMIN' | 'AUTHOR';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name?: string;
  bio?: string;
  avatar?: string;
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
  bio: {
    type: String,
    trim: true,
    default: '',
  },
  avatar: {
    type: String,
    trim: true,
    default: '',
  },
  role: {
    type: String,
    enum: ['ADMIN', 'AUTHOR'],
    default: 'AUTHOR',
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.index({ email: 1 });

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
