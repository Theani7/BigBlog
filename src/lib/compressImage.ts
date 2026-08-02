export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 to 1.0
  format?: 'image/webp' | 'image/jpeg' | 'image/png';
}

/**
 * Compresses an image file or blob using HTML5 Canvas.
 *
 * @param file - The input File or Blob object to compress.
 * @param options - Configuration options for compression (maxWidth, maxHeight, quality, format).
 * @returns A Promise resolving to the compressed base64 Data URL string (`data:image/...;base64,...`).
 */
export function compressImage(file: File | Blob, options: CompressOptions = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1600,
      maxHeight = 1600,
      quality = 0.82,
      format: targetFormat = 'image/webp',
    } = options;

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return reject(new Error('compressImage must be run in a browser environment'));
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        if (width === 0 || height === 0) {
          return reject(new Error('Invalid image dimensions'));
        }

        let ratio = 1;
        if (width > maxWidth || height > maxHeight) {
          ratio = Math.min(maxWidth / width, maxHeight / height);
        }

        const targetWidth = Math.max(1, Math.round(width * ratio));
        const targetHeight = Math.max(1, Math.round(height * ratio));

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to get 2D context from canvas'));
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        let format = targetFormat;
        if (format === 'image/webp') {
          const testCanvas = document.createElement('canvas');
          testCanvas.width = 1;
          testCanvas.height = 1;
          const isWebpSupported = testCanvas.toDataURL('image/webp').startsWith('data:image/webp');
          if (!isWebpSupported) {
            format = 'image/jpeg';
          }
        }

        const dataUrl = canvas.toDataURL(format, quality);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = objectUrl;
  });
}
