/**
 * Client-side API utility for making requests to the backend
 */

const API_BASE = '/api';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Make an API request with error handling
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers = {} } = options;

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : null,
    });

    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// =============================================================================
// VIEWS API
// =============================================================================

export const viewsApi = {
  track: (articleSlug: string, referrer?: string) =>
    request<{ recorded: boolean; reason?: string }>('/views', {
      method: 'POST',
      body: { articleSlug, referrer },
    }),

  getStats: (slug: string) =>
    request<{
      totalViews: number;
      uniqueViews: number;
      dailyViews: number;
      weeklyViews: number;
      monthlyViews: number;
    }>(`/views?slug=${encodeURIComponent(slug)}`),
};

// =============================================================================
// LIKES API
// =============================================================================

export const likesApi = {
  toggle: (articleSlug: string) =>
    request<{ liked: boolean; count: number }>('/likes', {
      method: 'POST',
      body: { articleSlug },
    }),

  get: (slug: string) =>
    request<{ count: number; liked: boolean }>(`/likes?slug=${encodeURIComponent(slug)}`),
};

// =============================================================================
// BOOKMARKS API
// =============================================================================

export const bookmarksApi = {
  toggle: (articleSlug: string) =>
    request<{ bookmarked: boolean }>('/bookmarks', {
      method: 'POST',
      body: { articleSlug },
    }),

  getAll: () => request<Array<{ articleSlug: string; createdAt: string }>>('/bookmarks'),
};

// =============================================================================
// COMMENTS API
// =============================================================================

interface Comment {
  id: number;
  articleSlug: string;
  content: string;
  authorName: string;
  createdAt: string;
  replies?: Comment[];
  reactionCounts?: Record<string, number>;
}

export const commentsApi = {
  get: (slug: string) =>
    request<{ comments: Comment[]; count: number }>(`/comments?slug=${encodeURIComponent(slug)}`),

  create: (data: {
    articleSlug: string;
    content: string;
    authorName: string;
    authorEmail?: string;
    parentId?: number;
  }) =>
    request<Comment>('/comments', {
      method: 'POST',
      body: data,
    }),

  edit: (commentId: number, content: string) =>
    request<Comment>('/comments/edit', {
      method: 'POST',
      body: { commentId, content },
    }),

  delete: (commentId: number) =>
    request<void>('/comments/delete', {
      method: 'POST',
      body: { commentId },
    }),

  react: (commentId: number, emoji: string) =>
    request<{ added: boolean }>('/comments/react', {
      method: 'POST',
      body: { commentId, emoji },
    }),

  report: (commentId: number, reason: string, details?: string) =>
    request<void>('/comments/report', {
      method: 'POST',
      body: { commentId, reason, details },
    }),
};

// =============================================================================
// NEWSLETTER API
// =============================================================================

export const newsletterApi = {
  subscribe: (email: string) =>
    request<{ token: string }>('/newsletter', {
      method: 'POST',
      body: { email },
    }),

  getStats: () => request<{ total: number; confirmed: number; pending: number }>('/newsletter'),
};

// =============================================================================
// READING HISTORY API
// =============================================================================

export const readingHistoryApi = {
  update: (articleSlug: string, progress: number, readTime?: number) =>
    request<void>('/reading-history', {
      method: 'POST',
      body: { articleSlug, progress, readTime },
    }),

  getRecent: () =>
    request<Array<{ articleSlug: string; progress: number; updatedAt: string }>>(
      '/reading-history'
    ),

  getContinueReading: () =>
    request<{ articleSlug: string; progress: number } | null>('/reading-history?action=continue'),

  getProgress: (slug: string) =>
    request<{ progress: number } | null>(`/reading-history?slug=${encodeURIComponent(slug)}`),
};

// =============================================================================
// USER PREFERENCES API
// =============================================================================

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  contentWidth: number;
  lineHeight: number;
  readingMode: 'default' | 'reader' | 'focused';
}

export const preferencesApi = {
  get: () => request<UserPreferences>('/preferences'),

  update: (preferences: Partial<UserPreferences>) =>
    request<UserPreferences>('/preferences', {
      method: 'POST',
      body: preferences,
    }),
};
