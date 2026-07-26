# Sprint 2: Content Engine

## Overview

Sprint 2 builds the production-ready Markdown/MDX content engine for BigBlog. The result is a scalable, type-safe content architecture comparable to Astro Docs, Vercel Blog, Stripe Docs, and Overreacted.

## What Was Built

### Content Collections

Five content collections with Zod schemas:

| Collection   | Purpose            | Key Fields                                                                                                                                                |
| ------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `blog`       | Blog posts         | title, description, excerpt, slug, publishedAt, draft, cover, author, category, tags, series, seriesOrder, canonical, ogImage, readingTime, toc, keywords |
| `authors`    | Author profiles    | name, bio, avatar, social links                                                                                                                           |
| `series`     | Article series     | title, description, cover, author, category, order                                                                                                        |
| `categories` | Content categories | title, description, parent                                                                                                                                |
| `pages`      | Static pages       | title, description, slug, cover, canonical                                                                                                                |

### Frontmatter Schema

Every blog post supports these frontmatter fields:

- `title` — Post title (required)
- `description` — Short description for SEO (required)
- `excerpt` — Longer excerpt for listings
- `slug` — Custom URL slug (auto-generated if omitted)
- `publishedAt` — Publication date (required)
- `updatedAt` — Last update date
- `draft` — Whether the post is a draft (default: false)
- `featured` — Whether the post is featured (default: false)
- `cover` — Cover image URL
- `coverAlt` — Cover image alt text
- `author` — Author name (required)
- `category` — Content category (required)
- `tags` — Array of tags (at least one required)
- `series` — Series name (optional)
- `seriesOrder` — Position in series (optional)
- `canonical` — Canonical URL (optional)
- `ogImage` — Open Graph image URL (optional)
- `readingTime` — Override reading time (optional, auto-calculated)
- `toc` — Whether to show table of contents (default: true)
- `keywords` — SEO keywords (optional)
- `language` — Content language (default: "en")
- `featuredOrder` — Sort order for featured posts (optional)

### MDX Support

MDX is enabled via `@astrojs/mdx`. This allows:

- React components in markdown files
- Custom callouts (info, warning, danger, success)
- Tables with responsive wrapping
- Math support (via KaTeX or MathJax)
- Footnotes
- Mermaid diagrams
- GitHub-flavored markdown
- Syntax highlighting
- Task lists
- Admonitions

### Markdown Components

Reusable components for rich content:

| Component   | Purpose                                   |
| ----------- | ----------------------------------------- |
| `Callout`   | Info/warning/danger/success callout boxes |
| `CodeBlock` | Syntax-highlighted code blocks            |
| `Table`     | Responsive data tables                    |
| `Badge`     | Color-coded badges                        |
| `Image`     | Responsive images with captions           |
| `Quote`     | Blockquotes with attribution              |
| `Steps`     | Numbered step lists                       |
| `Tabs`      | Tabbed content panels                     |

All components support dark mode via CSS custom properties.

### Content Utilities

| Utility                | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `readingTime()`        | Calculate minutes, word count, character count |
| `slugify()`            | Convert strings to URL-safe slugs              |
| `generateUniqueSlug()` | Generate slugs with collision avoidance        |
| `headingId()`          | Generate heading anchor IDs                    |
| `extractHeadings()`    | Parse markdown for TOC generation              |
| `generateToc()`        | Build nested TOC from headings                 |
| `formatDate()`         | Format dates for display                       |
| `formatRfc2822()`      | Format dates for RSS                           |
| `clamp()`              | Clamp a number between min/max                 |
| `chunkArray()`         | Split array into chunks                        |
| `getPaginationMeta()`  | Calculate pagination metadata                  |
| `paginate()`           | Paginate an array of items                     |

### Content Utilities (lib/content.ts)

| Function                | Description                                       |
| ----------------------- | ------------------------------------------------- |
| `filterDrafts()`        | Remove draft posts                                |
| `sortPosts()`           | Sort by publication date                          |
| `getFeaturedPosts()`    | Get featured posts sorted by order                |
| `getLatestPosts()`      | Get most recent published posts                   |
| `getRecentPosts()`      | Alias for getLatestPosts                          |
| `getPostsByTag()`       | Filter posts by tag                               |
| `getPostsByCategory()`  | Filter posts by category                          |
| `getPostsByAuthor()`    | Filter posts by author                            |
| `getSeries()`           | Get all posts in a series                         |
| `getSeriesNavigation()` | Get prev/next and progress for a series           |
| `getRelatedPosts()`     | Rank related articles by tag/category/series/date |
| `groupByYear()`         | Group posts by publication year                   |
| `archive()`             | Generate year/month archive                       |

### RSS & Sitemap

- `generateRss()` — Generate RSS 2.0 feed XML
- `generateSitemap()` — Generate sitemap XML with all published posts

### Content Validation

`validateContent()` detects:

- Duplicate slugs
- Missing descriptions
- Missing authors
- Empty tags
- Future publication dates
- Broken series references

`validateContentOrThrow()` fails the build if any errors are found.

### Article Layout

`ArticleLayout.astro` provides a premium article structure with:

- Hero image area
- Metadata (category, date, reading time, updated date)
- Table of contents
- Article body
- Series navigation (progress bar, prev/next)
- Related articles
- Share actions placeholder
- Newsletter placeholder

### Sample Content

- **8 blog posts** across 4 categories
- **3 authors** (Sarah Chen, Marcus Rivera, Aiko Tanaka)
- **2 series** (Astro Content Engine, Performance at Scale)
- **8 categories** (Engineering, Performance, Design, Developer Tools, Astro, TypeScript, Accessibility, Vercel)
- **20 tags** distributed across posts

## Architecture Decisions

1. **Content collections over file-based routing** — Astro 7's content collections provide type safety and validation that file-based routing cannot match.

2. **Zod schemas for validation** — Every field is validated at build time. Invalid content fails the build rather than shipping broken data.

3. **CSS custom properties for theming** — All components use CSS variables, ensuring dark mode works without JavaScript.

4. **Pure utility functions** — All content utilities are pure functions with no side effects, making them testable and reusable.

5. **Deterministic related articles** — Related articles are ranked by shared tags, category, series, and recency — no AI required.

## Remaining Technical Debt

- Blog page routes (`/blog`, `/blog/[slug]`) are not yet implemented — these will be Sprint 3
- Image optimization is not yet configured (deferred to Sprint 3)
- The `pages` content collection has an empty directory (no content files yet)
- Some markdown components (Accordion, Timeline, Notice, Warning, Info, Danger, Success) are not yet created
- RSS and sitemap are utility functions — they need page routes to serve the XML
- No integration tests for content utilities

## Recommendations for Sprint 3

1. **Blog page routes** — Create `/blog` listing page and `/blog/[slug]` article pages that render posts using the content collections
2. **Image optimization** — Integrate Cloudinary for hero images and in-post images
3. **Search** — Add client-side search using the content collection data
4. **Integration tests** — Test content utilities with real data
5. **RSS/Sitemap pages** — Create `/rss.xml` and `/sitemap.xml` routes
6. **Missing components** — Build Accordion, Timeline, Notice, Warning, Info, Danger, Success components
