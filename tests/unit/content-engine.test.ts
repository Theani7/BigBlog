import { describe, it, expect } from 'vitest';
import type { Post } from '../../src/types/content';
import {
  filterDrafts,
  sortPosts,
  getFeaturedPosts,
  getLatestPosts,
  getPostsByTag,
  getPostsByCategory,
  getPostsByAuthor,
  getSeries,
  getRelatedPosts,
  getAdjacentPosts,
  groupByYear,
  getPopularTags,
  getFeaturedCategories,
  getTrendingPosts,
} from '../../src/lib/content';

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'test-post',
    slug: 'test-post',
    body: 'Test content',
    collection: 'blog',
    data: {
      title: 'Test Post',
      description: 'A test post',
      publishedAt: new Date('2026-07-15'),
      draft: false,
      featured: false,
      author: 'Test Author',
      category: 'engineering',
      tags: ['typescript', 'testing'],
      toc: true,
      language: 'en',
      ...overrides,
    },
    ...overrides,
  } as Post;
}

describe('filterDrafts', () => {
  it('filters out drafts', () => {
    const posts = [
      makePost({ id: '1', data: { ...makePost().data, draft: false } as Post['data'] }),
      makePost({ id: '2', data: { ...makePost().data, draft: true } as Post['data'] }),
    ];
    expect(filterDrafts(posts)).toHaveLength(1);
    expect(filterDrafts(posts)[0]!.id).toBe('1');
  });
});

describe('sortPosts', () => {
  it('sorts by date descending', () => {
    const posts = [
      makePost({
        id: '1',
        data: { ...makePost().data, publishedAt: new Date('2026-01-01') } as Post['data'],
      }),
      makePost({
        id: '2',
        data: { ...makePost().data, publishedAt: new Date('2026-07-15') } as Post['data'],
      }),
    ];
    const sorted = sortPosts(posts);
    expect(sorted[0]!.id).toBe('2');
    expect(sorted[1]!.id).toBe('1');
  });
});

describe('getFeaturedPosts', () => {
  it('returns only featured posts', () => {
    const posts = [
      makePost({ id: '1', data: { ...makePost().data, featured: true } as Post['data'] }),
      makePost({ id: '2', data: { ...makePost().data, featured: false } as Post['data'] }),
    ];
    expect(getFeaturedPosts(posts)).toHaveLength(1);
  });
});

describe('getLatestPosts', () => {
  it('returns limited posts', () => {
    const posts = Array.from({ length: 10 }, (_, i) =>
      makePost({
        id: `${i}`,
        data: {
          ...makePost().data,
          publishedAt: new Date(`2026-07-${String(i + 1).padStart(2, '0')}`),
        } as Post['data'],
      })
    );
    expect(getLatestPosts(posts, 3)).toHaveLength(3);
  });
});

describe('getPostsByTag', () => {
  it('filters by tag', () => {
    const posts = [
      makePost({ id: '1', data: { ...makePost().data, tags: ['typescript'] } as Post['data'] }),
      makePost({ id: '2', data: { ...makePost().data, tags: ['rust'] } as Post['data'] }),
    ];
    expect(getPostsByTag(posts, 'typescript')).toHaveLength(1);
  });
});

describe('getPostsByCategory', () => {
  it('filters by category', () => {
    const posts = [
      makePost({ id: '1', data: { ...makePost().data, category: 'engineering' } as Post['data'] }),
      makePost({ id: '2', data: { ...makePost().data, category: 'design' } as Post['data'] }),
    ];
    expect(getPostsByCategory(posts, 'engineering')).toHaveLength(1);
  });
});

describe('getPostsByAuthor', () => {
  it('filters by author', () => {
    const posts = [
      makePost({ id: '1', data: { ...makePost().data, author: 'Alice' } as Post['data'] }),
      makePost({ id: '2', data: { ...makePost().data, author: 'Bob' } as Post['data'] }),
    ];
    expect(getPostsByAuthor(posts, 'Alice')).toHaveLength(1);
  });
});

describe('getSeries', () => {
  it('returns series posts sorted by order', () => {
    const posts = [
      makePost({
        id: '2',
        data: {
          ...makePost().data,
          series: 'My Series',
          seriesOrder: 2,
        } as Post['data'],
      }),
      makePost({
        id: '1',
        data: {
          ...makePost().data,
          series: 'My Series',
          seriesOrder: 1,
        } as Post['data'],
      }),
    ];
    const result = getSeries(posts, 'My Series');
    expect(result).toHaveLength(2);
    expect(result[0]!.id).toBe('1');
  });
});

describe('getRelatedPosts', () => {
  it('returns related posts', () => {
    const current = makePost({
      id: 'current',
      data: { ...makePost().data, tags: ['typescript'] } as Post['data'],
    });
    const related = makePost({
      id: 'related',
      data: { ...makePost().data, tags: ['typescript'] } as Post['data'],
    });
    const unrelated = makePost({
      id: 'unrelated',
      data: { ...makePost().data, tags: ['rust'], category: 'design' } as Post['data'],
    });
    const result = getRelatedPosts([current, related, unrelated], current, 3);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0]!.post.id).toBe('related');
  });
});

describe('getAdjacentPosts', () => {
  it('returns previous and next', () => {
    const posts = [
      makePost({
        id: '1',
        data: { ...makePost().data, publishedAt: new Date('2026-01-01') } as Post['data'],
      }),
      makePost({
        id: '2',
        data: { ...makePost().data, publishedAt: new Date('2026-07-15') } as Post['data'],
      }),
      makePost({
        id: '3',
        data: { ...makePost().data, publishedAt: new Date('2026-12-31') } as Post['data'],
      }),
    ];
    const result = getAdjacentPosts(posts, posts[1]!);
    expect(result.previous?.id).toBe('1');
    expect(result.next?.id).toBe('3');
  });
});

describe('groupByYear', () => {
  it('groups posts by year', () => {
    const posts = [
      makePost({
        id: '1',
        data: { ...makePost().data, publishedAt: new Date('2025-06-01') } as Post['data'],
      }),
      makePost({
        id: '2',
        data: { ...makePost().data, publishedAt: new Date('2026-07-15') } as Post['data'],
      }),
    ];
    const grouped = groupByYear(posts);
    expect(Object.keys(grouped)).toContain('2025');
    expect(Object.keys(grouped)).toContain('2026');
  });
});

describe('getPopularTags', () => {
  it('returns tags sorted by count', () => {
    const posts = [
      makePost({
        id: '1',
        data: { ...makePost().data, tags: ['typescript', 'testing'] } as Post['data'],
      }),
      makePost({ id: '2', data: { ...makePost().data, tags: ['typescript'] } as Post['data'] }),
    ];
    const tags = getPopularTags(posts);
    expect(tags[0]!.name).toBe('typescript');
    expect(tags[0]!.count).toBe(2);
  });
});

describe('getFeaturedCategories', () => {
  it('returns categories sorted by count', () => {
    const posts = [
      makePost({ id: '1', data: { ...makePost().data, category: 'engineering' } as Post['data'] }),
      makePost({ id: '2', data: { ...makePost().data, category: 'engineering' } as Post['data'] }),
      makePost({ id: '3', data: { ...makePost().data, category: 'design' } as Post['data'] }),
    ];
    const cats = getFeaturedCategories(posts);
    expect(cats[0]!.name).toBe('engineering');
    expect(cats[0]!.count).toBe(2);
  });
});

describe('getTrendingPosts', () => {
  it('returns trending posts', () => {
    const posts = [
      makePost({
        id: '1',
        data: {
          ...makePost().data,
          publishedAt: new Date(),
          featured: true,
        } as Post['data'],
      }),
      makePost({
        id: '2',
        data: {
          ...makePost().data,
          publishedAt: new Date('2020-01-01'),
        } as Post['data'],
      }),
    ];
    const trending = getTrendingPosts(posts, 2);
    expect(trending).toHaveLength(2);
    expect(trending[0]!.id).toBe('1');
  });
});
