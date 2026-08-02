import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRepost extends Document {
  userId: mongoose.Types.ObjectId;
  storyId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const repostSchema = new Schema<IRepost>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  storyId: {
    type: Schema.Types.ObjectId,
    ref: 'Story',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

repostSchema.index({ userId: 1, storyId: 1 }, { unique: true });

export const Repost: Model<IRepost> =
  (mongoose.models.Repost as Model<IRepost>) || mongoose.model<IRepost>('Repost', repostSchema);
