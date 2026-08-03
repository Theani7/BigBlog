import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'ADMIN' | 'AUTHOR';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name?: string;
  bio?: string;
  avatar?: string;
  pronouns?: string;
  website?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  role: UserRole;
  suspended: boolean;
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
  pronouns: {
    type: String,
    trim: true,
    default: '',
  },
  website: {
    type: String,
    trim: true,
    default: '',
  },
  twitter: {
    type: String,
    trim: true,
    default: '',
  },
  github: {
    type: String,
    trim: true,
    default: '',
  },
  linkedin: {
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
  suspended: {
    type: Boolean,
    default: false,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.index({ name: 1 });

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema);
