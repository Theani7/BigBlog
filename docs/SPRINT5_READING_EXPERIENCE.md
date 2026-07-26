# Sprint 5: Reading Experience — Documentation

## Reading Architecture

### Component Hierarchy

```
Layout.astro
├── Site Header (sticky)
├── Main Content
│   ├── Breadcrumbs
│   ├── Reader Settings Toggle (floating)
│   └── [slug].astro
│       ├── ArticleHero (cover, title, meta)
│       ├── Article Layout (grid)
│       │   ├── TOC Sidebar (sticky, desktop)
│       │   └── Article Main
│       │       ├── Reading Progress Bar (fixed top)
│       │       ├── Meta Row (tags, category, date)
│       │       ├── Article Body (rendered markdown)
│       │       ├── Series Navigation (if applicable)
│       │       ├── ShareButtons
│       │       ├── Related Articles
│       │       └── Newsletter Block
│       ├── Adjacent Post Navigation (prev/next)
│       └── Back Navigation (blog + category)
└── Site Footer
```

### Client-Side JavaScript

All interactive features are implemented as `is:inline` scripts (no bundling, zero JS by default):

1. **Reading Progress** — Scroll-based progress bar + percentage indicator
2. **TOC Generation** — Scans h2/h3/h4 headings, generates nested list
3. **TOC Highlighting** — Tracks current/completed sections via scroll position
4. **Heading Anchors** — Adds anchor links to headings with copy-to-clipboard
5. **Keyboard Navigation** — j/k for scroll, g/G for top/bottom
6. **Code Block Actions** — Copy, word wrap toggle, collapse toggle
7. **Image Lightbox** — Zoom on click, ESC to close
8. **Reader Settings** — Font size, spacing, font family, width
9. **Theme Toggle** — Light/dark/system with localStorage persistence

### Scroll Performance

- All scroll handlers use `requestAnimationFrame` with ticking guard
- Passive event listeners for scroll events
- `IntersectionObserver` not used (simpler scroll math is sufficient)
- `will-change: transform` only on progress bar

---

## Preference System

### CSS Custom Properties

```css
:root {
  --reader-font-size: 1rem; /* small: 0.9375rem, medium: 1rem, large: 1.125rem */
  --reader-line-height: 1.75; /* compact: 1.6, comfortable: 1.75 */
  --reader-font: var(--font-sans); /* sans: Geist, serif: Georgia */
  --reader-max-width: 68ch; /* narrow: 56ch, wide: 68ch */
}
```

### localStorage Keys

| Key               | Values                     | Default       |
| ----------------- | -------------------------- | ------------- |
| `reader-fontSize` | `small`, `medium`, `large` | `medium`      |
| `reader-spacing`  | `compact`, `comfortable`   | `comfortable` |
| `reader-font`     | `sans`, `serif`            | `sans`        |
| `reader-width`    | `narrow`, `wide`           | `wide`        |

### Applying Preferences

Preferences are applied via JavaScript in `Layout.astro`:

```javascript
function applyReaderPrefs() {
  const fontSize = localStorage.getItem('reader-fontSize') || 'medium';
  const spacing = localStorage.getItem('reader-spacing') || 'comfortable';
  const font = localStorage.getItem('reader-font') || 'sans';
  const width = localStorage.getItem('reader-width') || 'wide';

  document.documentElement.style.setProperty('--reader-font-size', fontSizeMap[fontSize]);
  document.documentElement.style.setProperty('--reader-line-height', lineHeightMap[spacing]);
  document.documentElement.style.setProperty(
    '--reader-font',
    font === 'serif' ? 'var(--font-serif)' : 'var(--font-sans)'
  );
  document.documentElement.style.setProperty('--reader-max-width', maxWidthMap[width]);
}
```

---

## Code Block API

### Props

```typescript
interface CodeBlockProps {
  language?: string; // Language for syntax highlighting label
  title?: string; // Title displayed above the block
  code: string; // The code content
  filename?: string; // Filename displayed in header
  lineNumbers?: boolean; // Show line numbers (CSS counters)
  highlightLines?: number[]; // Lines to highlight (1-indexed)
  collapsible?: boolean; // Allow collapsing long code
  maxLines?: number; // Lines before collapse (default: 50)
}
```

### Features

- **Copy Button** — Copies code to clipboard, shows "Copied!" feedback
- **Word Wrap Toggle** — Toggles `white-space: pre-wrap` for long lines
- **Line Highlighting** — Highlights specified lines with blue background
- **Line Numbers** — Pure CSS line numbers using counters
- **Collapse** — Collapses code >50 lines with gradient fade
- **Keyboard Accessible** — Focusable with visible focus ring

---

## Image API

### Props

```typescript
interface ImageProps {
  src: string; // Image source URL
  alt: string; // Alt text (required for accessibility)
  width?: number; // Width in pixels (prevents CLS)
  height?: number; // Height in pixels (prevents CLS)
  caption?: string; // Caption text below image
  blur?: boolean; // Show blur placeholder while loading
}
```

### Features

- **Lazy Loading** — `loading="lazy"` + `fetchpriority="low"`
- **Blur Placeholder** — CSS blur effect while loading
- **Aspect Ratio** — Set via `width`/`height` or CSS `aspect-ratio`
- **Lightbox** — Click to zoom, ESC or click outside to close
- **Reduced Motion** — Animations disabled when `prefers-reduced-motion: reduce`

---

## Accessibility Decisions

### Keyboard Navigation

| Key           | Action                 |
| ------------- | ---------------------- |
| `j`           | Scroll down one screen |
| `k`           | Scroll up one screen   |
| `g`           | Scroll to top          |
| `G` (Shift+g) | Scroll to bottom       |
| `Escape`      | Close lightbox         |

### ARIA Patterns

- **Progress Bar**: `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- **TOC**: `aria-label="Table of contents"`, `aria-current="true"` on active item
- **Lightbox**: `role="dialog"`, `aria-label="Image preview"`, focus trap
- **Code Blocks**: `role="region"`, `tabindex="0"`, `aria-label`
- **Callouts**: `role="note"`, `aria-expanded` for collapsible

### Focus Management

- All interactive elements have visible `:focus-visible` rings
- Skip link for keyboard users
- Heading anchors are focusable with visible focus
- Lightbox traps focus and returns focus on close

### Reduced Motion

All animations respect `prefers-reduced-motion: reduce`:

- Progress bar transition disabled
- TOC highlighting transition disabled
- Toast animation disabled
- Lightbox fade disabled
- Scroll behavior set to `auto`

### Screen Reader Support

- Progress bar announces percentage via `aria-valuenow`
- Active TOC item marked with `aria-current="true"`
- Collapsible elements have `aria-expanded`
- Images have meaningful `alt` text
- Hidden decorative elements use `aria-hidden="true"`

---

## Print Stylesheet

Print styles are defined in `global.css`:

**Hidden elements:**

- Site header, footer
- Reader settings toggle
- TOC sidebar
- Reading progress bar
- Share buttons
- Related articles
- Newsletter block
- Article navigation
- Heading anchors

**Print adjustments:**

- Font size: 11pt body, 12pt page
- Line height: 1.5
- Max width: 100%
- Links show URL in parentheses (except anchors/internal)
- Page break rules for headings and pre blocks

---

## Responsive Breakpoints

| Breakpoint | Layout                                    |
| ---------- | ----------------------------------------- |
| 320px      | Single column, full-width content, no TOC |
| 375px      | Same as 320px with slightly more padding  |
| 768px      | Wider content, tablet-optimized spacing   |
| 1024px     | Two-column layout with sticky TOC sidebar |
| 1440px     | Same layout, wider margins                |
| 1920px     | Max-width container, centered content     |

### Mobile-First Design

- TOC hidden on mobile, accessible via screen reader
- Navigation cards stack vertically on small screens
- Touch-friendly tap targets (44px minimum)
- Reduced padding on mobile

---

## Performance Considerations

### JavaScript

- Zero JS by default (Astro static output)
- `is:inline` scripts for client-side interactivity
- No framework overhead (vanilla JS)
- Passive scroll listeners
- `requestAnimationFrame` for smooth updates

### CSS

- CSS custom properties for theming (no re-renders)
- Scoped styles per component
- No CSS-in-JS runtime
- Minimal transitions (only for progress and TOC)

### Images

- Lazy loading by default
- `fetchpriority="low"` for below-fold images
- Explicit `width`/`height` to prevent CLS
- Blur placeholders for perceived performance

### Layout

- No layout shifts (explicit dimensions)
- `scroll-padding-top` for fixed header
- `will-change: transform` only where needed

---

## Remaining Work (Pre-Sprint 6)

### Must Fix

- [ ] Resolve `ArrowRight` icon build error (pre-existing from Sprint 1-4)
- [ ] Test all interactive features on mobile devices
- [ ] Verify keyboard navigation works end-to-end

### Should Fix

- [ ] Add footnotes support (Phase 11)
- [ ] Add expand/collapse all for `<details>` elements
- [ ] Add estimated remaining time in sticky header
- [ ] Audit all ARIA patterns with screen reader

### Nice to Have

- [ ] Add reading time progress (words read / total)
- [ ] Add reading heatmap (sections read)
- [ ] Add "Continue reading" prompt after inactivity
- [ ] Add keyboard shortcut help modal (`?` key)
