# Universal Image Compression Utility & Integration Design Spec

## Overview

Implement a reusable client-side image compression utility (`src/lib/compressImage.ts`) using HTML5 Canvas to compress all user-uploaded images (avatars, article cover photos, and inline story images) before storing or rendering them.

## Component Architecture

### 1. Compression Utility (`src/lib/compressImage.ts`)

Function signature:

```typescript
interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 to 1.0
  format?: 'image/webp' | 'image/jpeg' | 'image/png';
}

export function compressImage(file: File | Blob, options?: CompressOptions): Promise<string>;
```

- Reads input `File` using `Image` or `createObjectURL`.
- Calculates proportional target dimensions matching `maxWidth` and `maxHeight`.
- Draws onto an in-memory `<canvas>` element.
- Calls `canvas.toDataURL(format, quality)` to output a compact, web-optimized Data URL.

### 2. Integration Target 1: Profile Avatar Upload (`src/pages/profile.astro`)

- Target: `#inpage-avatar-file` change handler & drag-and-drop handler.
- Config: `maxWidth: 400`, `maxHeight: 400`, `quality: 0.85`.
- Output: Compact base64 string stored in `#inpage-avatar` hidden field and previewed in `#inpage-avatar-preview`.

### 3. Integration Target 2: Article Cover Image Upload (`src/pages/write.astro`)

- Target: `#cover-image-input` change handler.
- Config: `maxWidth: 1600`, `maxHeight: 900`, `quality: 0.82`.
- Output: Compact base64 cover image previewed in `#cover-image-preview` and saved in draft payload.

### 4. Integration Target 3: Story Inline Image Upload (`src/pages/write.astro`)

- Target: Floating image button (`#floating-image-btn`) & Quill editor image handler input.
- Config: `maxWidth: 1400`, `maxHeight: 1400`, `quality: 0.82`.
- Output: Compact base64 embedded image inserted directly into Quill editor at current cursor position.

## Design System Tokens & Styling

- Maintain Warm Editorial design system tokens (`#faf9f5` canvas, `#efe9de` cards, `#e6dfd8` borders, `#181715` dark surfaces).
