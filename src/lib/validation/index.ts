import type { ValidationResult, CommentInput, NewsletterInput, ReportInput } from '../../db/types';

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeContent(content: string): string {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\n/g, '\n');
}

/**
 * Validate comment input
 */
export function validateComment(input: CommentInput): ValidationResult {
  const errors: string[] = [];

  if (!input.articleSlug || input.articleSlug.trim().length === 0) {
    errors.push('Article slug is required');
  }

  if (!input.content || input.content.trim().length === 0) {
    errors.push('Comment content is required');
  } else if (input.content.length > 5000) {
    errors.push('Comment content must be less than 5000 characters');
  }

  if (!input.authorName || input.authorName.trim().length === 0) {
    errors.push('Author name is required');
  } else if (input.authorName.length > 100) {
    errors.push('Author name must be less than 100 characters');
  }

  if (input.authorEmail && !isValidEmail(input.authorEmail)) {
    errors.push('Invalid email format');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate newsletter subscription input
 */
export function validateNewsletter(input: NewsletterInput): ValidationResult {
  const errors: string[] = [];

  if (!input.email || input.email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!isValidEmail(input.email)) {
    errors.push('Invalid email format');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate report input
 */
export function validateReport(input: ReportInput): ValidationResult {
  const errors: string[] = [];

  if (!input.commentId) {
    errors.push('Valid comment ID is required');
  }

  const validReasons = ['spam', 'abuse', 'off-topic', 'other'];
  if (!input.reason || !validReasons.includes(input.reason)) {
    errors.push('Valid reason is required');
  }

  if (input.details && input.details.length > 1000) {
    errors.push('Details must be less than 1000 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash IP address for privacy
 */
export async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(
    ip + (globalThis as Record<string, unknown>)['IP_HASH_SECRET'] || 'bigblog-default-secret'
  );
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Detect spam patterns in content
 */
export function detectSpam(content: string): { isSpam: boolean; confidence: number } {
  let spamScore = 0;

  // Check for excessive links
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (linkCount > 3) spamScore += 30;

  // Check for repeated characters
  const repeatedChars = /(.)\1{5,}/g;
  if (repeatedChars.test(content)) spamScore += 20;

  // Check for ALL CAPS
  const words = content.split(/\s+/);
  const capsWords = words.filter((w) => w === w.toUpperCase() && w.length > 2);
  if (capsWords.length > words.length * 0.5) spamScore += 25;

  // Check for common spam keywords
  const spamKeywords = ['buy now', 'click here', 'free money', 'act now', 'limited time'];
  const lowerContent = content.toLowerCase();
  const hasSpamKeywords = spamKeywords.some((kw) => lowerContent.includes(kw));
  if (hasSpamKeywords) spamScore += 40;

  return {
    isSpam: spamScore >= 50,
    confidence: Math.min(spamScore / 100, 1),
  };
}
