import mongoose, { Schema, Document, Model } from 'mongoose';

// =============================================================================
// WEB SESSIONS
// Server-issued session registry. Anonymous interaction (views, likes,
// follows, bookmarks, reposts, analytics) is deduplicated against sessions
// that actually exist here, so a client cannot forge a fresh bb_session
// cookie to bypass the unique indexes.
// =============================================================================
export interface IWebSession extends Document {
  userId: mongoose.Types.ObjectId;
  userAgent: string;
  ipHash: string;
  createdAt: Date;
  lastSeenAt: Date;
}

const sessionsSchema = new Schema({
  _id: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  userAgent: { type: String },
  ipHash: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date, default: Date.now },
});

sessionsSchema.index({ lastSeenAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });
sessionsSchema.index({ userId: 1 });

export const sessions =
  (mongoose.models.WebSession as Model<IWebSession>) ||
  mongoose.model<IWebSession>('WebSession', sessionsSchema);
