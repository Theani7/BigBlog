# Instagram-Inspired Profile & Settings Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/profile` into an Instagram-inspired author profile & workspace featuring live follower metrics, post counts, bookmarked stories, performance analytics, and a dedicated in-page profile & social links editor.

**Architecture:**
Update `src/pages/profile.astro` with an Instagram header card (Avatar, Name, Pronouns, Posts/Followers/Following counts, Bio, Website, Social links) and 4 interactive workspace tabs (`Posts`, `Edit Profile`, `Saved`, `Stats`). Connect `Edit Profile` tab directly to `PUT /api/user/profile` and `GET /api/follows`.

**Tech Stack:** Astro, HTML, CSS (Warm Editorial design tokens), TypeScript, MongoDB / Mongoose (`User`, `Story`, `authorFollows`).

## Global Constraints

- Design Tokens: Canvas `#faf9f5`, Surface Cards `#efe9de`, Hairline Border `#e6dfd8`, Dark Surface `#181715`, Primary Coral `#cc785c`.
- Typography: Titles in Display Serif (`Copernicus`, `Tiempos Headline`, `Cormorant Garamond`, `serif`), body text in sans-serif (`StyreneB`, `Inter`, sans-serif).
- Retain all existing functionality: Bookmarks list, user profile updating (`PUT /api/user/profile`), stats overview, and follower counters.

---

### Task 1: Redesign Profile Header & Instagram Metrics Counter Bar

**Files:**

- Modify: `src/pages/profile.astro:60-150`

**Interfaces:**

- Consumes: User document from SSR `User.findById(userId)`, `authorFollows` database model for live counts.
- Produces: Instagram-style header with 96px circular avatar, name, pronouns, role badge, bio, website link, social links, `X Posts` | `Y Followers` | `Z Following` stats bar, "Edit Profile" tab trigger, and "Share Profile" button.

- [ ] **Step 1: Update SSR queries in `src/pages/profile.astro`**

Fetch total published stories count (`Story.countDocuments({ authorId: userId, status: 'PUBLISHED' })`), total followers count (`authorFollows.countDocuments({ authorId: userId })`), and total following count (`authorFollows.countDocuments({ userId })`).

- [ ] **Step 2: Update HTML structure for Instagram Profile Header**

Replace the current profile banner with:

- 96px circular avatar image with fallback initials avatar.
- Author display name, pronouns pill, and role badge.
- Instagram metric items: `{formatCompactNumber(publishedCount)} Posts`, `{formatCompactNumber(followerCount)} Followers`, `{formatCompactNumber(followingCount)} Following`.
- Bio text paragraph, Website link with icon, Twitter/X, GitHub, LinkedIn badges.
- Header actions: "Edit Profile" tab switcher button (`data-tab-target="edit"`).

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/pages/profile.astro
git commit -m "feat(profile): implement Instagram-style profile header and metric counters"
```

---

### Task 2: Implement Instagram Workspace Tabs & Dedicated In-Page Edit Profile Form

**Files:**

- Modify: `src/pages/profile.astro`

**Interfaces:**

- Consumes: User profile data, `PUT /api/user/profile`, `GET /api/follows`.
- Produces: 4 workspace tabs (`Posts`, `Edit Profile`, `Saved`, `Stats`) with an inline full-width Edit Profile form for Name, Pronouns, Avatar URL, Bio, Website, Twitter, GitHub, and LinkedIn.

- [ ] **Step 1: Implement Workspace Tab bar in `src/pages/profile.astro`**

Render top tab controls (`Posts`, `Edit Profile`, `Saved`, `Stats`) with active state indicator styling (`#181715` active border & text).

- [ ] **Step 2: Build dedicated in-page Edit Profile panel (`tab-content-edit`)**

Replace the old modal approach with an in-page 2-column form card (`#efe9de` surface card):

- Left column: Full Name, Pronouns, Avatar URL, Author Bio (280 max length textarea).
- Right column: Website URL, Twitter/X handle/URL, GitHub handle/URL, LinkedIn handle/URL.
- Form action buttons: "Save Changes" button with loading spinner & error/success status message container.

- [ ] **Step 3: Add client-side tab switching & profile form submit handler**

In `<script>`:

- Tab click listener that updates active tab classes and shows/hides target tab content panels.
- Form submit listener that sends `PUT` request to `/api/user/profile` with `name`, `pronouns`, `avatar`, `bio`, `website`, `twitter`, `github`, `linkedin`, and reloads or updates UI on success.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/profile.astro
git commit -m "feat(profile): add Instagram workspace tabs and dedicated in-page profile editor"
```
