import type { Post, ValidationError } from '../types/content';

interface SeoValidationOptions {
  minDescriptionLength?: number;
  maxDescriptionLength?: number;
  maxTitleLength?: number;
}

const DEFAULT_OPTIONS: SeoValidationOptions = {
  minDescriptionLength: 50,
  maxDescriptionLength: 320,
  maxTitleLength: 60,
};

/**
 * Validate all posts for common issues.
 */
export function validateContent(posts: Post[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenSlugs = new Map<string, string>();
  const seriesNames = new Set(posts.map((p) => p.data.series).filter(Boolean) as string[]);

  for (const post of posts) {
    const file = `src/content/blog/${post.id}.md`;

    if (seenSlugs.has(post.slug)) {
      errors.push({
        file,
        field: 'slug',
        message: `Duplicate slug "${post.slug}" (also in ${seenSlugs.get(post.slug)})`,
      });
    } else {
      seenSlugs.set(post.slug, file);
    }

    if (!post.data.description || post.data.description.trim().length === 0) {
      errors.push({
        file,
        field: 'description',
        message: 'Missing or empty description',
      });
    }

    if (!post.data.author || post.data.author.trim().length === 0) {
      errors.push({
        file,
        field: 'author',
        message: 'Missing author',
      });
    }

    const invalidTags = post.data.tags.filter((tag) => tag.trim().length === 0);
    if (invalidTags.length > 0) {
      errors.push({
        file,
        field: 'tags',
        message: `Contains empty tags: ${invalidTags.join(', ')}`,
      });
    }

    if (post.data.publishedAt > new Date()) {
      errors.push({
        file,
        field: 'publishedAt',
        message: `Publication date is in the future: ${post.data.publishedAt.toISOString()}`,
      });
    }

    if (post.data.series && !seriesNames.has(post.data.series)) {
      errors.push({
        file,
        field: 'series',
        message: `Series "${post.data.series}" does not exist`,
      });
    }
  }

  return errors;
}

/**
 * Validate SEO-specific fields for all posts.
 */
export function validateSeoFields(
  posts: Post[],
  options: SeoValidationOptions = DEFAULT_OPTIONS
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { minDescriptionLength, maxDescriptionLength, maxTitleLength } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  for (const post of posts) {
    const file = `src/content/blog/${post.id}.md`;

    if (post.data.cover && (!post.data.coverAlt || post.data.coverAlt.trim().length === 0)) {
      errors.push({
        file,
        field: 'coverAlt',
        message: 'Missing coverAlt text when cover image is set',
      });
    }

    if (post.data.description) {
      const descLen = post.data.description.trim().length;
      if (descLen < minDescriptionLength!) {
        errors.push({
          file,
          field: 'description',
          message: `Description too short (${descLen} chars, minimum ${minDescriptionLength})`,
        });
      }
      if (descLen > maxDescriptionLength!) {
        errors.push({
          file,
          field: 'description',
          message: `Description too long (${descLen} chars, maximum ${maxDescriptionLength})`,
        });
      }
    }

    if (post.data.title.length > maxTitleLength!) {
      errors.push({
        file,
        field: 'title',
        message: `Title too long (${post.data.title.length} chars, maximum ${maxTitleLength}) — may be truncated in search results`,
      });
    }

    if (!post.data.keywords || post.data.keywords.length === 0) {
      errors.push({
        file,
        field: 'keywords',
        message: 'Missing keywords field',
      });
    }
  }

  return errors;
}

/**
 * Validate for duplicate titles across posts.
 */
export function validateDuplicateTitles(posts: Post[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenTitles = new Map<string, string>();

  for (const post of posts) {
    const file = `src/content/blog/${post.id}.md`;
    const normalized = post.data.title.toLowerCase().trim();

    if (seenTitles.has(normalized)) {
      errors.push({
        file,
        field: 'title',
        message: `Duplicate title "${post.data.title}" (also in ${seenTitles.get(normalized)})`,
      });
    } else {
      seenTitles.set(normalized, file);
    }
  }

  return errors;
}

/**
 * Validate for duplicate descriptions across posts.
 */
export function validateDuplicateDescriptions(posts: Post[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenDescriptions = new Map<string, string>();

  for (const post of posts) {
    const file = `src/content/blog/${post.id}.md`;
    const normalized = post.data.description?.toLowerCase().trim();

    if (!normalized) continue;

    if (seenDescriptions.has(normalized)) {
      errors.push({
        file,
        field: 'description',
        message: `Duplicate description (also in ${seenDescriptions.get(normalized)})`,
      });
    } else {
      seenDescriptions.set(normalized, file);
    }
  }

  return errors;
}

/**
 * Validate for thin content (very short body).
 */
export function validateThinContent(posts: Post[], minWords = 100): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const post of posts) {
    const file = `src/content/blog/${post.id}.md`;
    const wordCount = post.body?.split(/\s+/).length ?? 0;

    if (wordCount < minWords) {
      errors.push({
        file,
        field: 'body',
        message: `Thin content — only ${wordCount} words (minimum ${minWords})`,
      });
    }
  }

  return errors;
}

/**
 * Validate that all posts with cover images have proper alt text.
 */
export function validateImageAlt(posts: Post[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const post of posts) {
    const file = `src/content/blog/${post.id}.md`;

    if (post.data.cover && (!post.data.coverAlt || post.data.coverAlt.trim().length === 0)) {
      errors.push({
        file,
        field: 'coverAlt',
        message: `Cover image missing alt text: ${post.data.cover}`,
      });
    }
  }

  return errors;
}

/**
 * Run all validation checks and return a combined report.
 */
export function validateAllSeo(posts: Post[]): ValidationError[] {
  return [
    ...validateContent(posts),
    ...validateSeoFields(posts),
    ...validateDuplicateTitles(posts),
    ...validateDuplicateDescriptions(posts),
    ...validateThinContent(posts),
    ...validateImageAlt(posts),
  ];
}

/**
 * Validate content and throw if errors are found.
 */
export function validateContentOrThrow(posts: Post[]): void {
  const errors = validateContent(posts);

  if (errors.length > 0) {
    const message = errors.map((e) => `  ✗ ${e.file}: ${e.field} — ${e.message}`).join('\n');
    throw new Error(`Content validation failed with ${errors.length} error(s):\n${message}`);
  }
}
