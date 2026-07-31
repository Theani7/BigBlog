---
description: Ensure modularity by splitting distinct UI pieces and functional blocks into separate files.
globs:
  - '**/*.astro'
  - '**/*.tsx'
  - '**/*.js'
  - '**/*.ts'
---

- ALWAYS abstract distinct UI pieces, layout sections (like headers, footers, sidebars), and logical blocks into their own separate component files (e.g., `Header.astro`, `Footer.astro`).
- NEVER leave massive chunks of HTML/CSS inside a single parent layout or page if they can logically be separated.
- Breaking things into separate files is a strict architectural requirement for this project because it significantly aids in debugging, maintainability, and code readability.
