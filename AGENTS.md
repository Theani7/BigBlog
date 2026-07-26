# AGENTS.md

## Project
Astro blog site deployed on Vercel with Cloudflare D1 and Cloudinary.

## Package manager
**bun** — use `bun install`, `bun run dev`, `bun run build`. Do not use npm or pnpm.

## Key commands
- `bun run dev` — dev server at `localhost:4322`
- `bun run build` — static build to `dist/` (also copies to `.vercel/output/static`)
- `bun run preview` — preview production build

## Architecture
- **Framework**: Astro 7 (static output)
- **Adapter**: `@astrojs/vercel` for Vercel deployment
- **Content**: Markdown blog posts in `src/content/blog/`, configured in `src/content.config.ts` using Astro 7 content collections (`glob` loader, `astro/zod` schema)
- **Styling**: Global CSS in `public/styles/global.css`, design tokens in `:root`
- **Fonts**: Playfair Display (display) + Inter (body) via Google Fonts

## Cloudflare D1
- Binding configured in `wrangler.jsonc` under `d1_databases` with binding name `DB`
- No `database_id` yet — API setup deferred; local dev uses SQLite file
- Run `wrangler d1 migrations apply blog-db --local` when D1 is provisioned

## Cloudinary
- Package: `astro-cloudinary` (provides `<CldImage>` component)
- Requires `PUBLIC_CLOUDINARY_CLOUD_NAME` env var (set in `.env`)
- `.env` is gitignored

## Deployment
- Push to GitHub: `git push -u origin main`
- Remote: `git@github.com:Theani7/BigBlog.git`
- Vercel auto-deploys from the `main` branch on push

## Conventions
- Conventional commits (`feat:`, `fix:`, `chore:`, etc.)
- Each logical change gets its own commit