import mongoose, { Schema, Model } from 'mongoose';

// =============================================================================
// RATE LIMIT HITS
// One document per request hit. The limit check counts hits in the window,
// so limits survive cold starts and are shared across serverless instances.
// `createdAt` drives a TTL index for garbage collection; `ts` is what the
// query filters on.
// =============================================================================

export interface IRateLimitHit {
  key: string;
  ts: number;
  createdAt: Date;
}

const rateLimitSchema = new Schema<IRateLimitHit>({
  key: { type: String, required: true },
  ts: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

rateLimitSchema.index({ key: 1, ts: 1 });
rateLimitSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

export const RateLimitHit: Model<IRateLimitHit> =
  (mongoose.models.RateLimitHit as Model<IRateLimitHit>) ||
  mongoose.model<IRateLimitHit>('RateLimitHit', rateLimitSchema);
