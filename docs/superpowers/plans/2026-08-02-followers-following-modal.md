# Followers & Following Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a Followers & Following API endpoint (`/api/follows/list`) and modal component (`FollowsModal.astro`) triggered by clicking Followers or Following metrics on `/profile` and `/author/[id]`.

**Architecture:** Create `/api/follows/list.ts` to query `authorFollows` database model, build `src/components/profile/FollowsModal.astro`, and wire click event listeners on metric items in `src/pages/profile.astro` and `src/pages/author/[id].astro`.

**Tech Stack:** Astro, TypeScript, MongoDB / Mongoose (`authorFollows`, `User`), CSS.

## Global Constraints

- Design Tokens: Canvas `#faf9f5`, Surface `#efe9de` / `#ffffff`, Hairline Border `#e6dfd8`, Dark Navy `#181715`.
- Keep inline script tags in `.astro` files free of TypeScript type annotations if using `is:inline`.

---

### Task 1: Create Followers & Following List API (`src/pages/api/follows/list.ts`)

**Files:**

- Create: `src/pages/api/follows/list.ts`

**Interfaces:**

- Consumes: Query params `authorId` and `type` (`followers` | `following`).
- Produces: `GET /api/follows/list` JSON response with array of author objects `{ id, name, avatar, bio, isFollowing }`.

- [ ] **Step 1: Write `src/pages/api/follows/list.ts`**

Implement `GET` handler:

- Connect to DB.
- If `type === 'followers'`, query `authorFollows.find({ authorId })` and populate `userId` to return follower author documents.
- If `type === 'following'`, query `authorFollows.find({ userId: authorId })` and populate `authorId` to return followed author documents.
- Check current user's follow status for each author to compute `isFollowing`.
- Return `{ success: true, data: [...] }`.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/follows/list.ts
git commit -m "feat(follows): create GET /api/follows/list endpoint for followers and following"
```

---

### Task 2: Create FollowsModal Component & Wire Triggers in Profile & Author Pages

**Files:**

- Create: `src/components/profile/FollowsModal.astro`
- Modify: `src/pages/profile.astro`
- Modify: `src/pages/author/[id].astro`

**Interfaces:**

- Consumes: `GET /api/follows/list`, `POST /api/follows`.
- Produces: Interactive Followers/Following modal overlay with tab switcher, list items, follow/unfollow toggle buttons, and trigger listeners on profile/author metrics.

- [ ] **Step 1: Create `src/components/profile/FollowsModal.astro`**

Build modal UI:

- Overlay container `#follows-modal-overlay` with backdrop blur.
- Header with tabs: **Followers** (`#follows-tab-followers`) and **Following** (`#follows-tab-following`), and close button (`#follows-modal-close`).
- List container `#follows-list-container` displaying loading spinner, author item list, or empty state.
- JS script handling modal show/hide, API fetching, tab switching, and follow toggle button clicks.

- [ ] **Step 2: Wire modal triggers in `src/pages/profile.astro` and `src/pages/author/[id].astro`**

- Import and render `<FollowsModal />` in both pages.
- Add `cursor: pointer` and `data-open-follows="followers"` / `data-open-follows="following"` to Followers & Following metric items in `profile.astro` and `author/[id].astro`.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/profile/FollowsModal.astro src/pages/profile.astro src/pages/author/[id].astro
git commit -m "feat(follows): add Followers & Following modal popup with live follow controls"
```
