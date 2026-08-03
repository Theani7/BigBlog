import mongoose, { Schema, Document, Model } from 'mongoose';

export type StoryStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'UNLISTED';
export type StoryCategory = 'Technology' | 'Design' | 'Business' | 'Culture' | 'Life' | 'Other';

export interface IStory extends Document {
  title: string;
  subtitle?: string;
  excerpt?: string;
  coverImage?: string;
  content: string;
  slug: string;
  authorId: mongoose.Types.ObjectId;
  status: StoryStatus;
  views: number;
  reads: number;
  readRatio: number;
  category?: StoryCategory;
  tags: string[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const storySchema = new Schema<IStory>({
  title: { type: String, required: true },
  subtitle: { type: String },
  excerpt: { type: String },
  coverImage: { type: String },
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
  category: {
    type: String,
    enum: ['Technology', 'Design', 'Business', 'Culture', 'Life', 'Other'],
  },
  tags: [{ type: String }],
  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

storySchema.index({ authorId: 1, status: 1 });
storySchema.index({ status: 1, publishedAt: -1 });
storySchema.index({ authorId: 1, status: 1, publishedAt: -1 });
storySchema.index({ authorId: 1, status: 1, updatedAt: -1 });
storySchema.index({ category: 1, status: 1, publishedAt: -1 });

export const Story: Model<IStory> =
  (mongoose.models.Story as Model<IStory>) || mongoose.model<IStory>('Story', storySchema);
