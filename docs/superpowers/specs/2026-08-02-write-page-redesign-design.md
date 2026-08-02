# Design Specification: Write Page Redesign

**Date:** 2026-08-02  
**Status:** Approved  
**Topic:** Redesigning `/write` to align strictly with `docs/DESIGN.md` (Warm Editorial Studio)

---

## 1. Overview & Goals

The `/write` page will be transformed into a **Warm Editorial Studio**, matching the Claude.com design system defined in `docs/DESIGN.md`.

Key visual markers:

- Tinted cream canvas background (`#faf9f5`)
- Serif display headlines (`Copernicus`, `Tiempos Headline`, or `Cormorant Garamond`) with negative tracking (`-1.5px`)
- Humanist sans-serif (`StyreneB` or `Inter`) for navigation, UI controls, metadata, and badges
- Dark navy (`#181715`) elements for primary actions, Quill editor bubble toolbar, and dark preview surfaces
- Coral (`#cc785c`) accents for active states, link press states, and focal callouts
- Generous internal padding and centered 740px writing container

---

## 2. Layout & Typography Structure

### Page Floor & Width

- Main background: `var(--color-canvas)` (`#faf9f5`)
- Content Container (`.write-container`): Centered, `max-width: 740px`, padding `40px 24px 96px 24px`.

### Typography Tokens Applied

- **Post Title Input (`#post-title`)**:
  - `font-family`: `Copernicus`, `Tiempos Headline`, `Cormorant Garamond`, `serif`
  - `font-size`: `clamp(2.5rem, 5vw, 3.75rem)` (Display LG/XL)
  - `font-weight`: `400`
  - `line-height`: `1.05`
  - `letter-spacing`: `-1.5px`
  - `color`: `var(--color-ink)` (`#141413`)
- **Post Subtitle Input (`#post-subtitle`)**:
  - `font-family`: `Copernicus`, `Tiempos Headline`, `Cormorant Garamond`, `serif`
  - `font-size`: `1.375rem` (Title MD)
  - `font-weight`: `400`
  - `line-height`: `1.3`
  - `color`: `var(--color-muted)` (`#6c6a64`)
- **Quill Editor Body (`.ql-editor`)**:
  - `font-family`: `Copernicus`, `Tiempos Headline`, `Cormorant Garamond`, `serif`
  - `font-size`: `1.25rem` (20px)
  - `line-height`: `1.65`
  - `color`: `var(--color-body-strong)` (`#252523`)

---

## 3. Component Details

### A. Sticky Toolbar (`EditorToolbar.astro`)

- `position: sticky`, `top: 64px`, `height: 56px`, `z-index: 20`
- `background`: `rgba(250, 249, 245, 0.85)` with `backdrop-filter: blur(16px)`
- `border-bottom`: `1px solid var(--color-hairline)` (`#e6dfd8`)
- Left section:
  - Draft status indicator with pulsing green dot (`#5db872`) and text `Draft saved` / `Saving...`
  - Separator dot/bar in `var(--color-hairline)`
  - Word count & reading time pill badge (`background: var(--color-surface-card)`, `color: var(--color-ink)`, `font-size: 13px`, `border-radius: 9999px`)
- Right section:
  - "Save Draft" button: Secondary cream style with hairline border (`height: 36px`, `padding: 0 16px`, `border-radius: 8px`)
  - "Publish" button: Primary dark button (`background: #181715`, `color: #ffffff`, `height: 36px`, `padding: 0 18px`, `border-radius: 8px`, hover background `#252320`)

### B. Story Metadata (`EditorMeta.astro`)

- **Cover Image Uploader**:
  - Dashed container with `background: var(--color-surface-card)` (`#efe9de`), `border: 1.5px dashed var(--color-hairline)`, `border-radius: 12px`, padding `32px 24px`.
  - Smooth hover effect: border color shifts to `var(--color-primary)` (`#cc785c`).
  - Preview Image: Full width, `max-height: 400px`, `object-fit: cover`, `border-radius: 12px`.
  - Floating circular remove button (`32px x 32px`, dark background with 80% opacity, top-right).
- **Tag Chips & Input**:
  - Container with bottom border divider (`1px solid var(--color-hairline)`).
  - Tag Chips: `background: var(--color-surface-card)` (`#efe9de`), `color: var(--color-ink)` (`#141413`), `font-family: StyreneB, Inter, sans-serif`, `font-size: 13px`, `font-weight: 500`, `border-radius: 9999px`, padding `6px 14px`. Hover effect slightly elevates.
  - Tag Close Button: Subtle circular background inside chip.
  - Tag Input: Seamless borderless input field in StyreneB/Inter font.

### C. Quill Editor & Floating Action Menu (`write.astro`)

- **Quill Bubble Toolbar**:
  - Styled as dark navy product card (`background: #181715 !important`), `border-radius: 8px !important`, `padding: 6px 12px`.
  - Icons and picker text in `var(--color-on-dark-soft)` (`#a09d96`), hovering/active in `var(--color-on-dark)` (`#faf9f5`).
- **Floating Action Menu (+)**:
  - Left offset: `-52px`.
  - Toggle Button: `32px x 32px`, `border-radius: 50%`, `background: var(--color-canvas)`, `border: 1px solid var(--color-hairline)`. Rotates 45 degrees on open.
  - Action Buttons: Floating dark/coral action pills (`32px x 32px`) to add image embed.

### D. Publish Settings Drawer (`PublishDrawer.astro`)

- **Overlay**: `background: rgba(20, 20, 19, 0.5)`, `backdrop-filter: blur(8px)`.
- **Drawer**: `background: var(--color-canvas)` (`#faf9f5`), `max-width: 600px`, `border-radius: 16px 16px 0 0`, padding `32px`.
- **Title**: Serif `Copernicus`/`Garamond` "Publish Settings" (`font-size: 24px`, `font-weight: 400`).
- **SEO Excerpt Textarea**: `background: var(--color-surface-card)` (`#efe9de`), `border: 1px solid var(--color-hairline)`, `border-radius: 8px`, padding `12px`.
- **Social Preview Card**:
  - Inner container: `background: var(--color-surface-card)` (`#efe9de`), `border: 1px solid var(--color-hairline)`, `border-radius: 12px`, padding `16px`.
  - Title: Serif font `18px`, Excerpt: Sans font `14px`, Muted color.
- **Publish Button**: Full-width primary button in dark navy (`#181715`), height `44px`, font weight `500`.

---

## 4. Verification Plan

1. Verify layout responsiveness on Mobile (<768px), Tablet, and Desktop.
2. Check color hex accuracy against `docs/DESIGN.md`:
   - Canvas: `#faf9f5`
   - Hairline: `#e6dfd8`
   - Primary dark: `#181715`
   - Card surface: `#efe9de`
   - Accent coral: `#cc785c`
3. Verify Quill editor text formatting, floating button position, image uploading, and tag addition/removal.
4. Verify Publish drawer open/close, live social preview generation, and story publishing.
