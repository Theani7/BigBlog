import mongoose, { Schema, Document } from 'mongoose';

export type StoryStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'UNLISTED';

export interface IStory extends Document {
  title: string;
  content: string;
  slug: string;
  authorId: mongoose.Types.ObjectId;
  status: StoryStatus;
  views: number;
  reads: number;
  readRatio: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const storySchema = new Schema<IStory>({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  slug: { type: String, required: true, unique: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'SCHEDULED', 'UNLISTED'],
    default: 'DRAFT',
  },
  views: { type: Number, default: 0 },
  reads: { type: Number, default: 0 },
  readRatio: { type: Number, default: 0 },
  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

storySchema.index({ authorId: 1, status: 1 });
storySchema.index({ slug: 1 });

export const Story = mongoose.models.Story || mongoose.model<IStory>('Story', storySchema);
