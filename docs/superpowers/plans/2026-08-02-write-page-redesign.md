# Write Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/write` page, its subcomponents (`EditorToolbar`, `EditorMeta`, `PublishDrawer`), and Quill styling to strictly adhere to the Warm Editorial Studio specification in `docs/DESIGN.md`.

**Architecture:** Update CSS & Astro layout/component markup across the 4 key write page files. Standardize font families to display serif (`Copernicus`, `Tiempos Headline`, `Cormorant Garamond`, `serif`) for headings and body, and humanist sans (`StyreneB`, `Inter`, `sans-serif`) for metadata/controls. Use exact surface tokens (`#faf9f5` canvas, `#efe9de` surface card, `#181715` dark navy surface/primary, `#e6dfd8` hairline).

**Tech Stack:** Astro, CSS variables, Quill.js, HTML5.

## Global Constraints

- **Canvas background:** `#faf9f5` (`var(--color-canvas)`)
- **Hairline border:** `#e6dfd8` (`var(--color-hairline)`)
- **Card background:** `#efe9de` (`var(--color-surface-card)`)
- **Dark navy background & primary action:** `#181715` (`var(--color-surface-dark)`)
- **Title typography:** `Copernicus`, `Tiempos Headline`, `Cormorant Garamond`, `serif`, weight 400, letter-spacing `-1.5px`
- **Body typography:** `Copernicus`, `Tiempos Headline`, `Cormorant Garamond`, `serif`, line-height 1.65

---

### Task 1: Redesign EditorToolbar.astro

**Files:**

- Modify: `src/components/editor/EditorToolbar.astro`

**Interfaces:**

- Consumes: `#draft-status`, `#word-count`, `#save-draft-btn`, `#publish-btn` DOM element IDs expected by `src/pages/write.astro`.
- Produces: Redesigned sticky toolbar matching Warm Editorial header spec.

- [ ] **Step 1: Inspect existing EditorToolbar markup and IDs**

Verify `#draft-status`, `#word-count`, `#save-draft-btn`, and `#publish-btn` exist in `src/components/editor/EditorToolbar.astro`.

- [ ] **Step 2: Update EditorToolbar.astro styling and structure**

Modify `src/components/editor/EditorToolbar.astro` to add sticky glassmorphism header, live pulse indicator for draft status, warm pill badge for word count, and redesigned cream/dark buttons.

- [ ] **Step 3: Verify component renders clean CSS and markup**

Run `npm run build` or check for any syntax errors in Astro.

---

### Task 2: Redesign EditorMeta.astro

**Files:**

- Modify: `src/components/editor/EditorMeta.astro`

**Interfaces:**

- Consumes: `#add-cover-btn`, `#cover-image-preview`, `#remove-cover-btn`, `#cover-image-input`, `#post-title`, `#post-subtitle`, `#tags-list`, `#post-tags-input`.
- Produces: Warm editorial title & subtitle inputs with display serif typography, cover image dropzone, and tag pills.

- [ ] **Step 1: Replace EditorMeta.astro markup and style**

Update `src/components/editor/EditorMeta.astro`.

---

### Task 3: Redesign PublishDrawer.astro

**Files:**

- Modify: `src/components/editor/PublishDrawer.astro`

**Interfaces:**

- Consumes: `#publish-drawer-overlay`, `#publish-drawer-close`, `#post-excerpt`, `#preview-cover`, `#preview-title`, `#preview-excerpt`, `#confirm-publish-btn`.
- Produces: Warm editorial publish drawer modal.

- [ ] **Step 1: Replace PublishDrawer.astro markup and styling**

Update `src/components/editor/PublishDrawer.astro`.

---

### Task 4: Redesign write.astro Layout & Quill Theme

**Files:**

- Modify: `src/pages/write.astro`

**Interfaces:**

- Consumes: All script event handlers and layout elements.
- Produces: 740px centered write page layout with custom dark navy Quill bubble theme, floating side menu, and editorial blockquote/code formatting.

- [ ] **Step 1: Update write.astro CSS and HTML structure**

Modify `src/pages/write.astro` layout and styles.

---

### Task 5: Project Build & Visual Verification

- [ ] **Step 1: Run project build**

Run: `npm run build`
Expected: Build succeeds cleanly with no TypeScript/Astro compilation errors.

- [ ] **Step 2: Verify git status and changes**

Run: `git status`
Expected: Only modified write files and spec/plan docs modified.
