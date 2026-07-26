import type { Post, RelatedArticle, SeriesNavigation } from '../types/content';

/**
 * Filter out draft posts.
 *
 * @param posts - Array of posts
 * @returns Only published posts
 */
export function filterDrafts(posts: Post[]): Post[] {
  return posts.filter((post) => !post.data.draft);
}

/**
 * Sort posts by publication date (newest first).
 *
 * @param posts - Array of posts
 * @returns Sorted posts
 */
export function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}

/**
 * Get featured posts, sorted by featuredOrder then date.
 *
 * @param posts - Array of posts
 * @returns Featured posts
 */
export function getFeaturedPosts(posts: Post[]): Post[] {
  return posts
    .filter((post) => post.data.featured && !post.data.draft)
    .sort((a, b) => {
      const orderA = a.data.featuredOrder ?? 0;
      const orderB = b.data.featuredOrder ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf();
    });
}

/**
 * Get the latest published posts.
 *
 * @param posts - Array of posts
 * @param limit - Maximum number of posts
 * @returns Latest posts
 */
export function getLatestPosts(posts: Post[], limit = 5): Post[] {
  return filterDrafts(posts)
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf())
    .slice(0, limit);
}

/**
 * Get recent posts (alias for getLatestPosts).
 *
 * @param posts - Array of posts
 * @param limit - Maximum number of posts
 * @returns Recent posts
 */
export function getRecentPosts(posts: Post[], limit = 5): Post[] {
  return getLatestPosts(posts, limit);
}

/**
 * Get posts filtered by tag.
 *
 * @param posts - Array of posts
 * @param tag - Tag to filter by
 * @returns Posts with the given tag
 */
export function getPostsByTag(posts: Post[], tag: string): Post[] {
  return filterDrafts(posts).filter((post) =>
    post.data.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

/**
 * Get posts filtered by category.
 *
 * @param posts - Array of posts
 * @param category - Category to filter by
 * @returns Posts in the given category
 */
export function getPostsByCategory(posts: Post[], category: string): Post[] {
  return filterDrafts(posts).filter(
    (post) => post.data.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get posts filtered by author.
 *
 * @param posts - Array of posts
 * @param author - Author name to filter by
 * @returns Posts by the given author
 */
export function getPostsByAuthor(posts: Post[], author: string): Post[] {
  return filterDrafts(posts).filter(
    (post) => post.data.author.toLowerCase() === author.toLowerCase()
  );
}

/**
 * Get all posts in a series.
 *
 * @param posts - Array of posts
 * @param seriesName - Series name
 * @returns Posts in the series, sorted by seriesOrder then date
 */
export function getSeries(posts: Post[], seriesName: string): Post[] {
  return filterDrafts(posts)
    .filter((post) => post.data.series?.toLowerCase() === seriesName.toLowerCase())
    .sort((a, b) => {
      const orderA = a.data.seriesOrder ?? 0;
      const orderB = b.data.seriesOrder ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return a.data.publishedAt.valueOf() - b.data.publishedAt.valueOf();
    });
}

/**
 * Get series navigation for a post (previous and next articles in the series).
 *
 * @param posts - All posts
 * @param currentPost - The current post
 * @returns Series navigation with previous, next, and progress
 */
export function getSeriesNavigation(posts: Post[], currentPost: Post): SeriesNavigation | null {
  if (!currentPost.data.series) return null;

  const seriesPosts = getSeries(posts, currentPost.data.series);
  const currentIndex = seriesPosts.findIndex((p) => p.id === currentPost.id);

  if (currentIndex === -1) return null;

  return {
    previous: currentIndex > 0 ? seriesPosts[currentIndex - 1] : undefined,
    next: currentIndex < seriesPosts.length - 1 ? seriesPosts[currentIndex + 1] : undefined,
    series: {
      title: currentPost.data.series,
      slug: '',
      author: currentPost.data.author,
      category: currentPost.data.category,
      publishedAt: currentPost.data.publishedAt,
    },
    progress: {
      current: currentIndex + 1,
      total: seriesPosts.length,
      percentage: Math.round(((currentIndex + 1) / seriesPosts.length) * 100),
    },
  };
}

/**
 * Calculate a relevance score for a related article.
 *
 * @param post - The candidate post
 * @param currentPost - The current post
 * @returns A score (higher = more related)
 */
function calculateRelatedScore(post: Post, currentPost: Post): number {
  let score = 0;

  // Shared tags (highest weight)
  const sharedTags = post.data.tags.filter((tag) => currentPost.data.tags.includes(tag));
  score += sharedTags.length * 3;

  // Same category
  if (post.data.category.toLowerCase() === currentPost.data.category.toLowerCase()) {
    score += 2;
  }

  // Same series
  if (
    post.data.series &&
    currentPost.data.series &&
    post.data.series.toLowerCase() === currentPost.data.series.toLowerCase()
  ) {
    score += 2;
  }

  // Recency bonus (posts within 90 days)
  const daysDiff = Math.abs(
    (post.data.publishedAt.valueOf() - currentPost.data.publishedAt.valueOf()) /
      (1000 * 60 * 60 * 24)
  );
  if (daysDiff < 90) {
    score += 1;
  }

  return score;
}

/**
 * Get related articles for a post, ranked by relevance.
 *
 * Relevance is calculated using shared tags, category, series, and publication date.
 * No AI is used — purely deterministic scoring.
 *
 * @param posts - All posts
 * @param currentPost - The current post
 * @param limit - Maximum number of related posts
 * @returns Related articles sorted by relevance score
 *
 * @example
 * getRelatedPosts(allPosts, currentPost, 3)
 * // → [{ post, score: 5, reason: 'tag' }, ...]
 */
export function getRelatedPosts(posts: Post[], currentPost: Post, limit = 3): RelatedArticle[] {
  const candidates = filterDrafts(posts).filter((p) => p.id !== currentPost.id);

  const scored = candidates.map((post) => {
    const score = calculateRelatedScore(post, currentPost);
    let reason: RelatedArticle['reason'] = 'tag';

    if (post.data.tags.some((tag) => currentPost.data.tags.includes(tag))) {
      reason = 'tag';
    } else if (post.data.category.toLowerCase() === currentPost.data.category.toLowerCase()) {
      reason = 'category';
    } else if (
      post.data.series &&
      currentPost.data.series &&
      post.data.series.toLowerCase() === currentPost.data.series.toLowerCase()
    ) {
      reason = 'series';
    } else {
      reason = 'date';
    }

    return { post, score, reason };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get adjacent posts (previous and next by publication date).
 *
 * @param posts - All posts
 * @param currentPost - The current post
 * @returns Previous and next posts
 */
export function getAdjacentPosts(
  posts: Post[],
  currentPost: Post
): { previous: Post | undefined; next: Post | undefined } {
  const sorted = sortPosts(filterDrafts(posts));
  const currentIndex = sorted.findIndex((p) => p.id === currentPost.id);

  if (currentIndex === -1) return { previous: undefined, next: undefined };

  return {
    previous: currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : undefined,
    next: currentIndex > 0 ? sorted[currentIndex - 1] : undefined,
  };
}

/**
 * Group posts by publication year.
 *
 * @param posts - Array of posts
 * @returns Object keyed by year with post arrays
 *
 * @example
 * groupByYear(posts)
 * // → { '2026': [...], '2025': [...] }
 */
export function groupByYear(posts: Post[]): Record<string, Post[]> {
  return filterDrafts(posts).reduce<Record<string, Post[]>>((acc, post) => {
    const year = post.data.publishedAt.getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {});
}

/**
 * Generate an archive of posts grouped by year and month.
 *
 * @param posts - Array of posts
 * @returns Nested archive structure
 *
 * @example
 * archive(posts)
 * // → { '2026': { 'July': [...], 'June': [...] } }
 */
export function archive(posts: Post[]): Record<string, Record<string, Post[]>> {
  return filterDrafts(posts).reduce<Record<string, Record<string, Post[]>>>((acc, post) => {
    const year = post.data.publishedAt.getFullYear().toString();
    const month = post.data.publishedAt.toLocaleDateString('en-US', { month: 'long' });
    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
    acc[year][month].push(post);
    return acc;
  }, {});
}
