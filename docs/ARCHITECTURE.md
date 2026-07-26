# Architecture

## Overview

BigBlog follows a **feature-oriented architecture** where code is organized by concern rather than by technical layer. This means:

- **Components** are grouped by feature (ui, common, layout, navigation, article)
- **Utilities** are shared across features with no duplication
- **Configuration** is centralized and environment-aware
- **Content** is separated from presentation

## Key Principles

### 1. Composition over Inheritance

Components are small and composable. Complex UI is built by combining simpler pieces.

### 2. Separation of Concerns

- Layout handles structure and navigation
- Components handle specific UI patterns
- Utilities handle pure logic
- Configuration holds all magic strings and constants

### 3. Low Coupling, High Cohesion

- Components import only what they need
- No shared mutable state
- Each module has a single responsibility

### 4. Scalable Imports

Path aliases (`@/`, `@components/`, `@lib/`, etc.) keep imports clean and refactorable.

## Theme System

The theme system uses CSS custom properties with three modes:

- **Light**: Default, explicit `data-theme="light"`
- **Dark**: Explicit `data-theme="dark"`
- **System**: `data-theme="system"` + `prefers-color-scheme` media query

No JavaScript is needed for theme switching — CSS handles all visual changes. The `data-theme` attribute is set on `<html>` and persists to `localStorage`.

## Performance

- Static output for zero-JS pages
- Island architecture for interactive components
- Font subsetting via Google Fonts
- CSS variables for zero-runtime theming
- `prefers-reduced-motion` respected throughout

## SEO

Reusable `generateSeo()`, `generateOpenGraph()`, and `generateTwitterCard()` utilities in `src/lib/seo.ts` ensure consistent metadata across all pages.
