# Instagram-Inspired Author Profile & Settings Workspace Design Spec

## Overview

Redesign `/profile` into an Instagram-inspired author workspace combining profile metrics, published stories, bookmarked reading list, analytics, and an in-page dedicated profile & social links editor.

## UI / Layout Architecture

### 1. Instagram-Style Profile Header Card

- **Avatar & Badge**:
  - 96px circular profile picture with a hairline border (`#e6dfd8`).
  - Display Name in display serif (`Copernicus`, `Tiempos Headline`, `Cormorant Garamond`, `serif`), 28px.
  - Role pill (`AUTHOR` / `ADMIN`) in dark navy surface (`#181715`).
  - Pronouns pill (e.g. `they/them`).
- **Instagram Metrics Bar**:
  - `X` Posts (total published stories count).
  - `Y` Followers (live total followers count from `authorFollows`).
  - `Z` Following (live total authors followed count).
- **Bio & Links**:
  - Author bio paragraph (`15px`, StyreneB/Inter).
  - External links row: Personal website (with globe icon), Twitter/X, GitHub, and LinkedIn links.
- **Header Actions**:
  - "Edit Profile" button: Switches active tab to the inline "Edit Profile" panel.
  - "Share Profile" button: Copies profile URL to clipboard.

### 2. Workspace Navigation Tabs

Tabs bar positioned under the profile header card:

- 📝 **Posts** — Grid of published stories with cover images, titles, excerpts, read time, and compact view/read stats.
- ⚙️ **Edit Profile** — In-page dedicated profile management form (Name, Pronouns, Avatar URL, Bio, Website, Twitter, GitHub, LinkedIn) with live feedback and instant save button.
- 🔖 **Saved** — Bookmarked articles list.
- 📊 **Stats** — Performance overview (Total Views, Total Reads, Average Read Ratio).

### 3. API Integrations & Data Flow

- `GET /api/auth/me` & SSR session lookup for current user document.
- `PUT /api/user/profile` for saving updated profile details (name, pronouns, avatar, bio, website, twitter, github, linkedin).
- `GET /api/follows` for fetching live follower & following metrics.

## Design System Tokens & Styling

- Canvas background: `var(--color-canvas, #faf9f5)`
- Surface cards: `var(--color-surface-card, #efe9de)`
- Hairline borders: `var(--color-hairline, #e6dfd8)`
- Primary accent & dark surfaces: `var(--color-surface-dark, #181715)`
