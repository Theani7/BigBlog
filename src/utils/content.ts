import type { ReadingTimeResult } from './content';

/**
 * Calculate reading time for a given text.
 *
 * @param text - The text to measure
 * @param wordsPerMinute - Reading speed (default 200 wpm)
 * @returns Reading time with minutes, word count, and character count
 *
 * @example
 * readingTime('Hello world '.repeat(100))
 * // → { minutes: 1, words: 120, characters: 840 }
 */
export function readingTime(text: string, wordsPerMinute = 200): ReadingTimeResult {
  const words = text.trim().split(/\s+/).length;
  const characters = text.length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return { minutes, words, characters };
}

/**
 * Generate a URL-safe slug from a string.
 *
 * @param text - The string to slugify
 * @returns URL-safe slug string
 *
 * @example
 * slugify('Hello World!')
 * // → 'hello-world'
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique slug, appending a suffix if the slug already exists.
 *
 * @param text - The string to slugify
 * @param existingSlugs - Set of already-used slugs
 * @returns A unique slug string
 *
 * @example
 * generateUniqueSlug('hello world', new Set(['hello-world']))
 * // → 'hello-world-1'
 */
export function generateUniqueSlug(text: string, existingSlugs: Set<string>): string {
  const base = slugify(text);
  if (!existingSlugs.has(base)) return base;

  let suffix = 1;
  while (existingSlugs.has(`${base}-${suffix}`)) {
    suffix++;
  }
  return `${base}-${suffix}`;
}

/**
 * Generate heading IDs for TOC anchor links.
 *
 * @param text - The heading text
 * @returns URL-safe ID string
 *
 * @example
 * headingId('Hello World')
 * // → 'hello-world'
 */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse a markdown string and extract headings for TOC generation.
 *
 * @param markdown - The markdown content
 * @returns Array of heading objects with id, text, and level
 *
 * @example
 * extractHeadings('# Hello\n\nSome text\n\n## World')
 * // → [{ id: 'hello', text: 'Hello', level: 1 }, { id: 'world', text: 'World', level: 2 }]
 */
export function extractHeadings(
  markdown: string
): Array<{ id: string; text: string; level: number }> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ id: string; text: string; level: number }> = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    headings.push({
      id: headingId(text),
      text,
      level,
    });
  }

  return headings;
}

/**
 * Generate a nested table of contents from heading data.
 *
 * @param headings - Array of heading objects
 * @returns Nested TOC structure
 *
 * @example
 * generateToc([{ id: 'intro', text: 'Intro', level: 1 }, { id: 'setup', text: 'Setup', level: 2 }])
 * // → [{ id: 'intro', text: 'Intro', level: 1, children: [{ id: 'setup', text: 'Setup', level: 2 }] }]
 */
export function generateToc(
  headings: Array<{ id: string; text: string; level: number }>
): Array<{ id: string; text: string; level: number; children: unknown[] }> {
  const root: Array<{ id: string; text: string; level: number; children: unknown[] }> = [];
  const stack: Array<{ level: number; item: unknown }> = [];

  for (const heading of headings) {
    const item = { ...heading, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(item);
    } else {
      const parent = stack[stack.length - 1].item as { children: unknown[] };
      parent.children.push(item);
    }

    stack.push({ level: heading.level, item });
  }

  return root;
}

/**
 * Format a date string or Date object into a human-readable format.
 *
 * @param date - The date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', options);
}

/**
 * Format a date for RSS/Atom feeds (RFC 2822 format).
 *
 * @param date - The date to format
 * @returns RFC 2822 formatted date string
 */
export function formatRfc2822(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toUTCString();
}

/**
 * Clamp a number between a minimum and maximum value.
 *
 * @param value - The value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Chunk an array into groups of a given size.
 *
 * @param array - The array to chunk
 * @param size - The chunk size
 * @returns Array of arrays
 *
 * @example
 * chunkArray([1, 2, 3, 4, 5], 2)
 * // → [[1, 2], [3, 4], [5]]
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Calculate pagination metadata.
 *
 * @param totalItems - Total number of items
 * @param currentPage - Current page (1-indexed)
 * @param pageSize - Items per page
 * @returns Pagination metadata
 *
 * @example
 * getPaginationMeta(25, 2, 10)
 * // → { currentPage: 2, totalPages: 3, totalPosts: 25, hasNext: true, hasPrevious: true, nextPage: 3, previousPage: 1 }
 */
export function getPaginationMeta(
  totalItems: number,
  currentPage: number,
  pageSize: number
): {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasNext: boolean;
  hasPrevious: boolean;
  nextPage?: number;
  previousPage?: number;
} {
  const totalPages = Math.ceil(totalItems / pageSize);
  const nextPage = currentPage < totalPages ? currentPage + 1 : undefined;
  const previousPage = currentPage > 1 ? currentPage - 1 : undefined;

  return {
    currentPage,
    totalPages,
    totalPosts: totalItems,
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1,
    nextPage,
    previousPage,
  };
}

/**
 * Paginate an array of items.
 *
 * @param items - The items to paginate
 * @param currentPage - Current page (1-indexed)
 * @param pageSize - Items per page
 * @returns Paginated items and metadata
 *
 * @example
 * paginate([1, 2, 3, 4, 5], 1, 2)
 * // → { items: [1, 2], meta: { currentPage: 1, totalPages: 3, ... } }
 */
export function paginate<T>(
  items: T[],
  currentPage: number,
  pageSize: number
): { items: T[]; meta: ReturnType<typeof getPaginationMeta> } {
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const paginatedItems = items.slice(start, end);
  const meta = getPaginationMeta(items.length, currentPage, pageSize);

  return { items: paginatedItems, meta };
}
