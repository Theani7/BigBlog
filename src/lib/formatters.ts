/**
 * Formats a number into a compact string representation using K, M, B suffixes
 * for numbers 1000 and greater (e.g. 1.2K, 15K, 2.4M, 1.1B).
 */
export function formatCompactNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  if (Math.abs(num) < 1000) return num.toString();

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
}
