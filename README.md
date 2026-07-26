# BigBlog

A premium developer publishing platform built with Astro, Tailwind CSS, and TypeScript.

## Quick Start

```bash
bun install
bun run dev
```

## Scripts

| Command                | Description              |
| ---------------------- | ------------------------ |
| `bun run dev`          | Start development server |
| `bun run build`        | Build for production     |
| `bun run preview`      | Preview production build |
| `bun run lint`         | Run ESLint               |
| `bun run lint:fix`     | Fix ESLint errors        |
| `bun run format`       | Format with Prettier     |
| `bun run format:check` | Check formatting         |
| `bun run typecheck`    | Run TypeScript checks    |

## Tech Stack

- **Framework**: Astro 7
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript (strict)
- **Package Manager**: Bun
- **Hosting**: Vercel
- **Icons**: Lucide
- **Fonts**: Geist, Geist Mono

## Project Structure

```
src/
  assets/        Static assets (images, fonts)
  components/    Reusable UI components
  content/       Markdown content (blog posts, authors)
  layouts/       Shared page layouts
  pages/         Route-based pages
  styles/        Global CSS and design tokens
  lib/           Shared utilities and services
  hooks/         Custom hooks
  config/        Centralized configuration
  utils/         Utility functions
  constants/     Application constants
  icons/         Icon components
  types/         TypeScript type definitions
  data/          Static data files

public/          Static assets served as-is
scripts/         Build and utility scripts
docs/            Project documentation
```

## Architecture

Feature-oriented architecture with:

- Reusable, composable components
- Separation of concerns
- Centralized configuration
- Design token system with CSS variables
- Light/dark/system theme support
- SEO utilities
- Accessibility-first markup

## License

MIT
