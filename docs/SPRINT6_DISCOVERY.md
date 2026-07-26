# Sprint 6: Discovery Experience

## Overview

Sprint 6 implements a comprehensive content discovery system for BigBlog, including search, command palette, and enhanced content browsing pages.

## Completed Phases

### Phase 1: Search Index Generation

**File:** `src/lib/search.ts`

- Build-time index generation via `generateSearchIndex()`
- Returns array of `SearchEntry` objects with title, description, tags, category, author, date, readingTime, slug, featured, series, excerpt, content
- `stripMarkdown()` helper removes markdown formatting for search indexing

### Phase 2: Search UI

**File:** `src/pages/search.astro`

- Instant client-side search with 150ms debounce
- Filter by: All, Articles, Tags, Categories
- Grouped results with highlighted matches
- Popular search suggestions
- Keyboard shortcut: `/` to focus search, `ESC` to clear

### Phase 3: Command Palette

**File:** `src/components/navigation/CommandPalette.astro`

- Triggered by `⌘K` / `Ctrl+K` from any page
- Features:
  - Search articles
  - Quick navigation (Home, Blog, Archive, Search)
  - Browse categories
  - Recently viewed articles (localStorage)
- Keyboard navigation: `↑↓` to move, `Enter` to select, `Escape` to close
- Live search index from build-time generation

### Phase 4: Category Experience

**File:** `src/pages/category/[slug].astro`

- Featured article hero (if exists)
- Category statistics (article count, topics, avg read time)
- Popular tags sidebar
- Related categories sidebar
- Responsive grid layout

### Phase 5: Tag Experience

**File:** `src/pages/tag/[slug].astro`

- Related tags sidebar
- Browse by category sidebar
- Post count display
- Responsive layout

### Phase 6: Author Experience

**File:** `src/pages/author/[slug].astro`

- Author avatar/initials with fallback
- Bio and social links
- Statistics (articles, series, total reading time, topics)
- Featured articles
- Topic expertise sidebar
- Series sidebar

### Phase 7: Series Experience

**File:** `src/pages/series/[slug].astro`

- Cover image (if exists)
- Series metadata (article count, total reading time, author, category)
- Numbered article list with reading times
- Series navigation (previous/next)
- Other series sidebar
- Browse by category sidebar

### Phase 8: Archive Page

**File:** `src/pages/archive.astro`

- Browse articles by year and month
- Statistics (years, categories, authors)
- Sidebar with categories and authors
- Post count per category/author

### Phase 9: Recommendations Enhancement

**File:** `src/lib/content.ts`

Enhanced `calculateRelatedScore()` with:

- Shared tags (3 points each)
- Same category (2 points)
- Same author (1 point)
- Same series (2 points)
- Recency bonus (30 days: +2, 90 days: +1)
- Featured bonus (+1)

### Phase 10: Trending Content

**File:** `src/lib/content.ts`, `src/pages/blog/index.astro`

New functions:

- `getTrendingPosts(posts, limit)` - Posts ranked by trending score
- `getPopularTags(posts, limit)` - Tags by frequency
- `getFeaturedCategories(posts)` - Categories by post count
- `getEditorsPicks(posts, limit)` - Featured/highlighted posts

Trending score based on:

- Recency (7 days: +10, 30 days: +7, 90 days: +4, 180 days: +2)
- Featured status (+5)
- Tag count (+1 per tag, max 3)

Blog index now shows a "Trending" section.

### Phase 11: Navigation Enhancement

**File:** `src/components/navigation/RecentlyViewed.astro`

- Tracks recently viewed articles in localStorage
- Displays last 5 viewed articles in blog sidebar
- Automatically updates when reading articles

### Phase 12: Empty States

**File:** `src/pages/search.astro`

- Improved no-results state with search suggestions
- Popular search chips in both empty and no-results states

### Phase 13: Performance & Accessibility

- Global `:focus-visible` styles for keyboard navigation
- Keyboard support for filter chips and suggestion buttons
- `aria-live` regions for search results
- Skip-to-content link
- Proper heading hierarchy
- Reduced motion support

### Phase 14: Documentation

This file (`docs/SPRINT6_DISCOVERY.md`)

## Files Created/Modified

### New Files

- `src/lib/search.ts` - Search index generator
- `src/pages/search.astro` - Search page
- `src/pages/archive.astro` - Archive page
- `src/components/navigation/CommandPalette.astro` - Command palette
- `src/components/navigation/RecentlyViewed.astro` - Recently viewed component
- `docs/SPRINT6_DISCOVERY.md` - This documentation

### Modified Files

- `src/layouts/Layout.astro` - Added search toggle, command palette, focus styles
- `src/pages/blog/index.astro` - Added trending section, search link, recently viewed
- `src/pages/category/[slug].astro` - Enhanced with stats, sidebar
- `src/pages/tag/[slug].astro` - Enhanced with related tags, categories
- `src/pages/author/[slug].astro` - Enhanced with avatar, stats, series
- `src/pages/series/[slug].astro` - Enhanced with progress, navigation
- `src/pages/blog/[slug].astro` - Added recently viewed tracking
- `src/lib/content.ts` - Added trending, recommendations, archive helpers
- `src/components/ui/Icon.astro` - Fixed lucide-astro imports (static)

## Keyboard Shortcuts

| Shortcut        | Action                               |
| --------------- | ------------------------------------ |
| `⌘K` / `Ctrl+K` | Open command palette                 |
| `/`             | Focus search input                   |
| `ESC`           | Close command palette / clear search |
| `↑↓`            | Navigate command palette items       |
| `Enter`         | Select command palette item          |

## Build Notes

- Icon.astro uses static imports from `lucide-astro/IconName` (not `lucide-astro/dist/`)
- Search index generated at build time, embedded in search page
- All new pages are statically generated
