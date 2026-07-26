# Setup Guide

## Prerequisites

- **Bun** 1.3+ (recommended) or Node.js 22+
- Git

## Installation

```bash
# Clone the repository
git clone git@github.com:Theani7/BigBlog.git
cd BigBlog

# Install dependencies
bun install

# Set up Git hooks
bunx husky init
```

## Development

```bash
# Start the dev server
bun run dev
```

The dev server runs at `http://localhost:4321`.

## Building

```bash
# Build for production
bun run build

# Preview the production build
bun run preview
```

## Environment Variables

Create a `.env` file for local development:

```env
# Site configuration
SITE_URL=https://bigblog.dev

# Future: Cloudinary
PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

# Future: Cloudflare D1
CLOUDFLARE_D1_DATABASE_ID=
```

## Code Quality

```bash
# Lint
bun run lint

# Fix lint errors
bun run lint:fix

# Format
bun run format

# Check formatting
bun run format:check

# TypeScript check
bun run typecheck
```

## Git Hooks

Husky is configured with `lint-staged` for pre-commit hooks:

- TypeScript/JavaScript/JSX/TSX/Astro files → ESLint + Prettier
- Markdown files → Prettier
- JSON/YAML files → Prettier
