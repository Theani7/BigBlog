import { eq, count } from 'drizzle-orm';
import type { Database } from '../index';
import { newsletterSubscribers } from '../schema';
import type { InsertNewsletterSubscriber } from '../types';
import { DatabaseError, ConflictError, NotFoundError } from '../../lib/errors';
import { generateSessionId } from '../../lib/validation/index';

export class NewsletterRepository {
  constructor(private db: Database) {}

  async subscribe(email: string, sessionId?: string): Promise<{ token: string }> {
    // Check if already subscribed
    const existing = await this.findByEmail(email);
    if (existing) {
      if (existing.status === 'unsubscribed') {
        // Re-subscribe
        const token = generateSessionId();
        await this.db
          .update(newsletterSubscribers)
          .set({
            status: 'pending',
            confirmationToken: token,
            unsubscribedAt: null,
            subscribedAt: new Date(),
          })
          .where(eq(newsletterSubscribers.id, existing.id));
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
      await this.db.insert(newsletterSubscribers).values(data);
      return { token };
    } catch (_error) {
      throw new DatabaseError('Failed to subscribe');
    }
  }

  async confirm(token: string) {
    const subscriber = await this.db.query.newsletterSubscribers.findFirst({
      where: eq(newsletterSubscribers.confirmationToken, token),
    });

    if (!subscriber) {
      throw new NotFoundError('Invalid confirmation token');
    }

    await this.db
      .update(newsletterSubscribers)
      .set({ status: 'confirmed', confirmedAt: new Date() })
      .where(eq(newsletterSubscribers.id, subscriber.id));

    return { success: true };
  }

  async unsubscribe(email: string) {
    const subscriber = await this.findByEmail(email);
    if (!subscriber) {
      throw new NotFoundError('Subscriber');
    }

    await this.db
      .update(newsletterSubscribers)
      .set({ status: 'unsubscribed', unsubscribedAt: new Date() })
      .where(eq(newsletterSubscribers.id, subscriber.id));

    return { success: true };
  }

  async findByEmail(email: string) {
    return this.db.query.newsletterSubscribers.findFirst({
      where: eq(newsletterSubscribers.email, email),
    });
  }

  async getStats(): Promise<{ total: number; confirmed: number; pending: number }> {
    const [total] = await this.db.select({ count: count() }).from(newsletterSubscribers);
    const [confirmed] = await this.db
      .select({ count: count() })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.status, 'confirmed'));
    const [pending] = await this.db
      .select({ count: count() })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.status, 'pending'));

    return {
      total: total?.count ?? 0,
      confirmed: confirmed?.count ?? 0,
      pending: pending?.count ?? 0,
    };
  }
}
