# Universal Image Compression Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a reusable client image compression utility (`src/lib/compressImage.ts`) and integrate it into all upload entry points (profile avatar, article cover image, and inline story body images) to compress uploaded device images before storage or rendering.

**Architecture:** Create `src/lib/compressImage.ts` using HTML5 Canvas API and integrate it into client scripts in `src/pages/profile.astro` and `src/pages/write.astro`.

**Tech Stack:** TypeScript, HTML5 Canvas API, Astro.

## Global Constraints

- Reusable helper in `src/lib/compressImage.ts`.
- Profile Avatar max dimensions: 400x400 at 0.85 quality.
- Article Cover max dimensions: 1600x900 at 0.82 quality.
- Inline Article Images max dimensions: 1400x1400 at 0.82 quality.
- Keep inline script tags in `.astro` files free of TypeScript type annotations if using `is:inline`.

---

### Task 1: Create Image Compression Utility (`src/lib/compressImage.ts`)

**Files:**

- Create: `src/lib/compressImage.ts`

**Interfaces:**

- Consumes: `File` or `Blob` object.
- Produces: `compressImage(file, options): Promise<string>` resolving to compressed Data URL.

- [ ] **Step 1: Write `src/lib/compressImage.ts`**

Implement `compressImage` using `Image`, `URL.createObjectURL`, `HTMLCanvasElement`, and `canvas.toDataURL(format, quality)`.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/compressImage.ts
git commit -m "feat(media): add client-side HTML5 canvas image compression utility"
```

---

### Task 2: Integrate Image Compression in Profile Avatar Uploader (`src/pages/profile.astro`)

**Files:**

- Modify: `src/pages/profile.astro`

**Interfaces:**

- Consumes: `compressImage` logic inside `handleAvatarFile()`.
- Produces: Resized avatar images (max 400x400 at 0.85 quality) for avatar file selection and drag-and-drop.

- [ ] **Step 1: Update `handleAvatarFile()` in `src/pages/profile.astro`**

Use canvas compression inline in `setupProfileWorkspace()` to scale avatars to max 400x400 at 0.85 quality before updating preview and hidden form field.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/pages/profile.astro
git commit -m "feat(profile): integrate canvas image compression into profile avatar uploader"
```

---

### Task 3: Integrate Image Compression in Cover Image & Story Body Editor (`src/pages/write.astro`)

**Files:**

- Modify: `src/pages/write.astro`

**Interfaces:**

- Consumes: Canvas compression for cover images and inline story body images.
- Produces: Resized cover images (max 1600x900 at 0.82 quality) and inline images (max 1400x1400 at 0.82 quality).

- [ ] **Step 1: Update Cover Image file picker handler in `src/pages/write.astro`**

Compress selected cover image to max 1600x900 at 0.82 quality before updating cover image preview and draft data.

- [ ] **Step 2: Update Floating & Toolbar Inline Image insertion handlers in `src/pages/write.astro`**

Compress selected inline image to max 1400x1400 at 0.82 quality before inserting into Quill editor (`quill.insertEmbed`).

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/pages/write.astro
git commit -m "feat(editor): integrate canvas image compression for article cover and body images"
```
