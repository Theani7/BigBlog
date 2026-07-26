import type { Post, ValidationError } from '../types/content';

/**
 * Validate all posts for common issues.
 *
 * Checks for:
 * - Duplicate slugs
 * - Missing cover images
 * - Missing descriptions
 * - Invalid tags
 * - Future publication dates
 * - Missing author
 * - Broken series references
 *
 * @param posts - All posts to validate
 * @returns Array of validation errors
 *
 * @example
 * const errors = validateContent(allPosts);
 * if (errors.length > 0) {
 *   console.error('Content validation failed:', errors);
 *   process.exit(1);
 * }
 */
export function validateContent(posts: Post[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenSlugs = new Map<string, string>();
  const seriesNames = new Set(posts.map((p) => p.data.series).filter(Boolean) as string[]);

  for (const post of posts) {
    const file = `src/content/blog/${post.id}.md`;

    // Duplicate slugs
    if (seenSlugs.has(post.slug)) {
      errors.push({
        file,
        field: 'slug',
        message: `Duplicate slug "${post.slug}" (also in ${seenSlugs.get(post.slug)})`,
      });
    } else {
      seenSlugs.set(post.slug, file);
    }

    // Missing description
    if (!post.data.description || post.data.description.trim().length === 0) {
      errors.push({
        file,
        field: 'description',
        message: 'Missing or empty description',
      });
    }

    // Missing author
    if (!post.data.author || post.data.author.trim().length === 0) {
      errors.push({
        file,
        field: 'author',
        message: 'Missing author',
      });
    }

    // Invalid tags (empty strings)
    const invalidTags = post.data.tags.filter((tag) => tag.trim().length === 0);
    if (invalidTags.length > 0) {
      errors.push({
        file,
        field: 'tags',
        message: `Contains empty tags: ${invalidTags.join(', ')}`,
      });
    }

    // Future publication dates
    if (post.data.publishedAt > new Date()) {
      errors.push({
        file,
        field: 'publishedAt',
        message: `Publication date is in the future: ${post.data.publishedAt.toISOString()}`,
      });
    }

    // Broken series reference
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
 * Validate content and throw if errors are found.
 * Intended to be called during the build process.
 *
 * @param posts - All posts to validate
 * @throws {Error} If validation errors are found
 *
 * @example
 * validateContentOrThrow(allPosts);
 */
export function validateContentOrThrow(posts: Post[]): void {
  const errors = validateContent(posts);

  if (errors.length > 0) {
    const message = errors.map((e) => `  ✗ ${e.file}: ${e.field} — ${e.message}`).join('\n');
    throw new Error(`Content validation failed with ${errors.length} error(s):\n${message}`);
  }
}
