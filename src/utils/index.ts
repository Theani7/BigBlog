/**
 * Join class names conditionally, filtering falsy values.
 * Used as a drop-in for `clsx` / `classnames` with zero dependencies.
 *
 * @example
 * cn('px-4', isActive && 'bg-blue-500', 'text-white')
 * // → 'px-4 bg-blue-500 text-white'
 */
export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(' ');
}

/**
 * Format a date string or Date object into a human-readable format.
 *
 * @param date - The date to format
 * @param options - Intl.DateTimeFormat options (defaults to long date)
 * @returns Formatted date string
 *
 * @example
 * formatDate('2026-07-26')
 * // → 'July 26, 2026'
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
 * Estimate reading time for a given text.
 *
 * @param text - The text to measure
 * @param wordsPerMinute - Reading speed (default 200 wpm)
 * @returns Human-readable reading time string
 *
 * @example
 * readingTime('Hello world '.repeat(100))
 * // → '1 min read'
 */
export function readingTime(text: string, wordsPerMinute = 200): string {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  if (minutes < 1) return '< 1 min read';
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
}

/**
 * Convert a string to a URL-safe slug.
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
 * Create a debounced version of a function.
 *
 * @param fn - The function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function with a `cancel` method
 *
 * @example
 * const debouncedSearch = debounce((query) => fetchResults(query), 300);
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId !== null) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced as T & { cancel: () => void };
}

/**
 * Create a throttled version of a function.
 *
 * @param fn - The function to throttle
 * @param limit - Minimum time between calls in milliseconds
 * @returns Throttled function
 *
 * @example
 * const onScroll = throttle(() => console.log('scrolled'), 100);
 */
export function throttle<T extends (...args: unknown[]) => void>(fn: T, limit: number): T {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  const throttled = (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs !== null) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };

  return throttled as T;
}

/**
 * Copy text to the clipboard with fallback for older browsers.
 *
 * @param text - The text to copy
 * @returns Promise that resolves when text is copied
 *
 * @example
 * await copyToClipboard('Hello world');
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

/**
 * Validate that a URL is safe for external links.
 * Returns the URL if valid, or null if it's unsafe.
 *
 * @param url - The URL to validate
 * @returns Safe URL string or null
 *
 * @example
 * safeExternalLink('https://example.com')
 * // → 'https://example.com'
 * safeExternalLink('javascript:alert(1)')
 * // → null
 */
export function safeExternalLink(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}
