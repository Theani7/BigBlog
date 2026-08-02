# Profile Page Features & Backend Logic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full Profile page capabilities including Edit Profile modal with backend persistence, and interactive tabs for Home, Reposts, Activity, and About.

**Architecture:** Extend MongoDB User schema and create Repost schema; build REST API endpoints (`PUT /api/user/profile`, `GET/POST /api/user/reposts`, `GET /api/user/activity`); create `EditProfileModal.astro` component; and integrate interactive tabs into `src/pages/profile.astro`.

**Tech Stack:** Astro, TypeScript, MongoDB (Mongoose), Vanilla CSS / Tailwind utilities.

## Global Constraints

- Preserve existing authentication patterns using `auth_token` cookie and `verifyAuthToken`.
- Follow established project coding style and UI design system (`tokens.css`, `global.css`).

---

### Task 1: Extend Database Schemas (User & Repost)

**Files:**

- Modify: `src/db/schema/user.ts`
- Create: `src/db/schema/repost.ts`
- Modify: `src/db/schema/index.ts`

**Interfaces:**

- Consumes: Mongoose `Schema`, `Document`
- Produces: `IUser` (with social/pronouns fields), `IRepost`, `Repost` model

- [ ] **Step 1: Update `src/db/schema/user.ts` to include optional fields**

Add `website`, `twitter`, `github`, `linkedin`, `pronouns` to `IUser` interface and `userSchema`:

```typescript
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name?: string;
  bio?: string;
  avatar?: string;
  pronouns?: string;
  website?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
```

- [ ] **Step 2: Create `src/db/schema/repost.ts`**

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IRepost extends Document {
  userId: mongoose.Types.ObjectId;
  storyId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const repostSchema = new Schema<IRepost>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  storyId: { type: Schema.Types.ObjectId, ref: 'Story', required: true },
  createdAt: { type: Date, default: Date.now },
});

repostSchema.index({ userId: 1, storyId: 1 }, { unique: true });

export const Repost = mongoose.models.Repost || mongoose.model<IRepost>('Repost', repostSchema);
```

- [ ] **Step 3: Export `Repost` from `src/db/schema/index.ts`**

Export `Repost` and `IRepost` from `src/db/schema/index.ts`.

- [ ] **Step 4: Commit schema changes**

```bash
git add src/db/schema/
git commit -m "feat(schema): extend User schema and add Repost model"
```

---

### Task 2: Implement Profile Backend API Endpoints

**Files:**

- Create: `src/pages/api/user/profile.ts`
- Create: `src/pages/api/user/reposts.ts`
- Create: `src/pages/api/user/activity.ts`

**Interfaces:**

- Consumes: `auth_token` cookie, `User`, `Story`, `Repost`
- Produces: JSON response for `PUT /api/user/profile`, `GET/POST /api/user/reposts`, `GET /api/user/activity`

- [ ] **Step 1: Create `src/pages/api/user/profile.ts` for updating user profile**

```typescript
import type { APIRoute } from 'astro';
import { createDatabase, type Env } from '../../../db';
import { User } from '../../../db/schema';
import { verifyAuthToken } from '../../../lib/auth';

export const PUT: APIRoute = async ({ locals, cookies, request }) => {
  const env = (locals as { env: Env }).env;
  if (!env) {
    return new Response(JSON.stringify({ success: false, error: 'Environment not configured' }), {
      status: 503,
    });
  }

  const token = cookies.get('auth_token')?.value;
  if (!token) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
  }

  const payload = await verifyAuthToken(token, env);
  if (!payload?.userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
  }

  await createDatabase(env);
  const body = await request.json();

  const allowedUpdates = [
    'name',
    'bio',
    'avatar',
    'pronouns',
    'website',
    'twitter',
    'github',
    'linkedin',
  ];
  const updateData: Record<string, any> = {};
  for (const key of allowedUpdates) {
    if (body[key] !== undefined) {
      updateData[key] = body[key];
    }
  }
  updateData.updatedAt = new Date();

  const updatedUser = await User.findByIdAndUpdate(payload.userId, updateData, {
    new: true,
  }).select('-passwordHash');

  return new Response(JSON.stringify({ success: true, user: updatedUser }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

- [ ] **Step 2: Create `src/pages/api/user/reposts.ts`**

Handles fetching and toggling reposts for stories.

- [ ] **Step 3: Create `src/pages/api/user/activity.ts`**

Fetches aggregated activity (published stories, reposts) for a given `userId`.

- [ ] **Step 4: Commit API endpoints**

```bash
git add src/pages/api/user/
git commit -m "feat(api): add profile, reposts, and activity REST endpoints"
```

---

### Task 3: Create EditProfileModal Component

**Files:**

- Create: `src/components/profile/EditProfileModal.astro`

**Interfaces:**

- Consumes: User profile props (`user`)
- Produces: Modal component that submits changes to `/api/user/profile`

- [ ] **Step 1: Create `EditProfileModal.astro`**

Implement accessible modal dialog with inputs for:

- Name
- Bio
- Avatar URL
- Pronouns
- Website, Twitter, GitHub, LinkedIn
- Submit button with loading spinner and error/success handling.

- [ ] **Step 2: Commit component**

```bash
git add src/components/profile/EditProfileModal.astro
git commit -m "feat(ui): add EditProfileModal component"
```

---

### Task 4: Integrate Profile Tabs & Edit Profile Logic in `src/pages/profile.astro`

**Files:**

- Modify: `src/pages/profile.astro`

**Interfaces:**

- Consumes: `EditProfileModal.astro`, `User`, `Story`, `Repost`
- Produces: Complete profile page with active tabs (Home, Reposts, Activity, About) and modal triggering

- [ ] **Step 1: Update SSR data loading in `src/pages/profile.astro`**

Load user profile, published stories, reposts, and activity count.

- [ ] **Step 2: Implement Tab switching markup & styling**

Render active panels based on current tab:

- **Home**: Published stories & reading list card.
- **Reposts**: Grid of reposted stories.
- **Activity**: Activity timeline.
- **About**: Extended user info, statistics, member join date, social link badges.

- [ ] **Step 3: Wire up Edit Profile modal trigger and event listeners**

Include `<EditProfileModal user={user} />` and add JS to handle opening/closing modal and refreshing state on successful save.

- [ ] **Step 4: Commit profile page updates**

```bash
git add src/pages/profile.astro
git commit -m "feat(profile): integrate tabs, edit modal, and activity timeline"
```

---

## Verification Plan

- Run `npm run build` to verify TypeScript types and build correctness.
- Test `PUT /api/user/profile` by editing profile fields from the UI modal.
- Verify tab navigation across Home, Reposts, Activity, and About panels.
