# Folder Structure

```
src/
├── assets/          Static assets (images, fonts, favicons)
├── components/      Reusable UI components
│   ├── ui/          Base UI primitives (buttons, inputs, badges)
│   ├── common/      Shared components used across features
│   ├── layout/      Layout-specific components (header, footer, sidebar)
│   ├── navigation/  Navigation components (menus, breadcrumbs)
│   └── article/     Article-specific components (toc, code blocks, etc.)
├── content/         Markdown content sources
│   ├── blog/        Blog post markdown files
│   └── authors/     Author data files
├── layouts/         Astro layout components
├── pages/           Route-based Astro pages
├── styles/          Global CSS, design tokens, theme system
├── lib/             Shared libraries and services
├── hooks/           Custom hooks (future use)
├── services/        External service integrations (future use)
├── config/          Centralized configuration files
├── utils/           Pure utility functions
├── constants/       Application constants
├── icons/           Icon components
├── types/           TypeScript type definitions
└── data/            Static data files

public/              Static assets served as-is (favicon, robots.txt, etc.)
scripts/             Build scripts and automation
docs/                Project documentation (ARCHITECTURE.md, SETUP.md, etc.)
```

## Folder Rationale

- **`src/assets/`** — Images, fonts, and other static files that get processed by Astro's asset pipeline.
- **`src/components/ui/`** — Lowest-level UI primitives. These are framework-agnostic and reusable across the entire app.
- **`src/components/common/`** — Components used across multiple features but not at the primitive level (cards, modals, etc.).
- **`src/components/layout/`** — Layout-specific components that define page structure.
- **`src/components/navigation/`** — Navigation-related components (header, footer, menus, breadcrumbs).
- **`src/components/article/`** — Components specific to rendering articles (typography, code blocks, tables).
- **`src/content/`** — Astro content collections. Markdown files live here and are queried via `astro:content`.
- **`src/layouts/`** — Astro layout components that wrap pages with shared structure.
- **`src/pages/`** — Astro page components. File-based routing maps these to URLs.
- **`src/styles/`** — Design tokens (`tokens.css`), global styles (`global.css`), and theme CSS.
- **`src/lib/`** — Shared libraries that don't fit into components (SEO utilities, etc.).
- **`src/config/`** — Centralized configuration objects (site, navigation, socials, SEO).
- **`src/utils/`** — Pure utility functions with no side effects.
- **`src/constants/`** — Application-wide constants that shouldn't be computed at runtime.
- **`src/icons/`** — Icon components wrapping Lucide icons.
- **`src/types/`** — TypeScript type definitions shared across the project.
- **`src/data/`** — Static data files (JSON, YAML) used at build time.
- **`public/`** — Files served as-is without processing. Good for `favicon.svg`, `robots.txt`, `manifest.json`.
- **`scripts/`** — Build scripts, migration scripts, and automation.
- **`docs/`** — Project documentation that doesn't belong in the codebase.
