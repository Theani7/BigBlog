# BigBlog Architecture & Technical Reference

This document serves as the primary technical reference for AI agents and developers working on the BigBlog project. It outlines the overall architecture, tech stack, API structure, and database design.

## Tech Stack

- **Framework:** Astro (Server-Side Rendered)
- **Styling:** Vanilla CSS (CSS Variables, Flexbox, CSS Grid). _Note: Tailwind is NOT used, in favor of a strictly scoped, token-driven aesthetic approach._
- **Database:** MongoDB (via Mongoose ORM)
- **Authentication:** JWT (via `jose`), securely stored in HTTP-only cookies.
- **Deployment Target:** Vercel / Cloudflare (Astro SSR adapter)

## Directory Structure

- `src/components/`: Reusable UI components.
- `src/layouts/Layout.astro`: The root HTML layout, handling global meta tags, SEO, and the site-wide Navigation and Footer.
- `src/pages/`: Astro file-based routing.
  - `/index.astro`: Landing page.
  - `/about.astro`: Our Story page.
  - `/write.astro`: Rich-text editor for authors.
  - `/login.astro`, `/signup.astro`: Authentication pages.
  - `/api/`: Server-side API endpoints (Node.js style route handlers).
- `src/styles/`: Global CSS.
  - `tokens.css`: Core design system variables (colors, typography, spacing). **All components must use these variables.**
  - `global.css`: Base styles and global resets.
- `src/db/`: Database configuration and schemas.
  - `index.ts`: MongoDB connection initialization.
  - `schema/`: Mongoose model definitions.

## Authentication & Authorization

The platform uses a custom cookie-based JWT authentication system.

### JWT & Cookies

- **Secret:** Sourced from `process.env.JWT_SECRET`.
- **Payload:** Contains `userId`, `email`, and `role`.
- **Cookie Name:** `auth_token`
- **Cookie Flags:** `httpOnly`, `secure`, `sameSite: 'lax'`, `path: '/'`.

### API Routes

All authentication APIs are located in `src/pages/api/auth/`:

- `POST /api/auth/signup`: Expects `name`, `email`, `password`. Hashes password via `bcryptjs`, creates a user, signs a JWT, and sets the `auth_token` cookie.
- `POST /api/auth/login`: Expects `email`, `password`. Verifies credentials, signs a JWT, and sets the `auth_token` cookie.
- `POST /api/auth/logout`: Clears the `auth_token` cookie.
- `GET /api/auth/me`: Verifies the `auth_token` cookie. Returns `{ success: true, user: { ... } }` if valid, or `{ success: false }` if invalid/missing.

### Role-Based Access Control (RBAC)

The `User` model includes a `role` field with the following enum values:

1.  `READER`: Default role. Can read public blogs and leave comments.
2.  `AUTHOR`: Can access `/write` and publish blogs.
3.  `EDITOR`: Can edit and moderate content from other authors.
4.  `ADMIN`: Full system access.

## Frontend Architecture & Design Philosophy

- **Reference:** Always refer to `DESIGN.md` for styling guidelines.
- **Aesthetic:** The app uses a premium "Light Mode Editorial" aesthetic (warm cream canvas, dark navy surfaces, coral CTAs, and serif display fonts).
- **Scoping:** Astro's `<style>` tags are automatically scoped to the component. Global styles should only be placed in `src/styles/global.css`.
- **Client-side JS:** Minimal. Client-side scripts inside `<script>` tags in `.astro` files are used for interactive UI elements (e.g., password visibility toggles, strength meters) and client-side auth redirection (e.g., in `write.astro`).

## Database Schema (MongoDB / Mongoose)

### User Model (`src/db/schema/user.ts`)

- `name`: String, required.
- `email`: String, required, unique.
- `password`: String, required (hashed).
- `role`: String, enum `['READER', 'AUTHOR', 'EDITOR', 'ADMIN']`, default `READER`.
- `createdAt`, `updatedAt`: Timestamps.

## Development Workflow

1.  **Running Locally:** Use `npm run dev` (runs on `http://localhost:4323`).
2.  **Linting:** Pre-commit hooks (`husky` + `lint-staged`) enforce ESLint and Prettier rules. All unused variables and `any` types must be resolved before committing.
3.  **Making Changes:** When adding features, prioritize creating specific API routes in `src/pages/api/` and keeping the client-side lightweight.

## Upcoming Features (TODO)

- **Blogging Engine:** Create `Post` and `Category` schemas.
- **Dashboard:** Author/Editor dashboard for managing published content and analytics.
- **Draft System:** Implement the "Save Draft" functionality for `/write`.
