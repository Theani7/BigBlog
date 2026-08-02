import type { Database } from '../index';
import { newsletterSubscribers } from '../schema';
import type { InsertNewsletterSubscriber } from '../types';
import { DatabaseError, ConflictError, NotFoundError } from '../../lib/errors';
import { generateSessionId } from '../../lib/validation/index';

export class NewsletterRepository {
  constructor(_db: Database) {}

  async subscribe(email: string, sessionId?: string): Promise<{ token: string }> {
    const existing = await this.findByEmail(email);
    if (existing) {
      if (existing.status === 'unsubscribed') {
        const token = generateSessionId();
        await newsletterSubscribers.updateOne(
          { _id: existing._id },
          {
            $set: {
              status: 'pending',
              confirmationToken: token,
              unsubscribedAt: null,
              subscribedAt: new Date(),
            },
          }
        );
        return { token };
      }
      throw new ConflictError('Email already subscribed');
    }

    const token = generateSessionId();
    const data: InsertNewsletterSubscriber = {
      email,
      sessionId,
      confirmationToken: token,
      status: 'pending',
    };

    try {
      await newsletterSubscribers.create(data);
      return { token };
    } catch (_error) {
      throw new DatabaseError('Failed to subscribe');
    }
  }

  async confirm(token: string) {
    const subscriber = await newsletterSubscribers.findOne({ confirmationToken: token });
    if (!subscriber) {
      throw new NotFoundError('Invalid confirmation token');
    }

    await newsletterSubscribers.updateOne(
      { _id: subscriber._id },
      { $set: { status: 'confirmed', confirmedAt: new Date() } }
    );
    return { success: true };
  }

  async unsubscribe(email: string) {
    const subscriber = await this.findByEmail(email);
    if (!subscriber) {
      throw new NotFoundError('Subscriber');
    }

    await newsletterSubscribers.updateOne(
      { _id: subscriber._id },
      { $set: { status: 'unsubscribed', unsubscribedAt: new Date() } }
    );
    return { success: true };
  }

  async findByEmail(email: string) {
    return newsletterSubscribers.findOne({ email });
  }

  async getStats(): Promise<{ total: number; confirmed: number; pending: number }> {
    const total = await newsletterSubscribers.countDocuments();
    const confirmed = await newsletterSubscribers.countDocuments({ status: 'confirmed' });
    const pending = await newsletterSubscribers.countDocuments({ status: 'pending' });

    return { total, confirmed, pending };
  }
}
