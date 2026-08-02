# Design Specification: Complete Profile Page Features & Backend Logic

Date: 2026-08-02
Status: Approved

## Overview

This specification details the complete implementation of the Profile page features in BigBlog:

1. **Edit Profile Modal & Backend Integration** (`PUT /api/user/profile`)
2. **Profile Tabs**:
   - **Home**: Shows user's published stories and reading list.
   - **Reposts**: Shows stories reposted by the user (with `Repost` schema and `POST /api/user/reposts` toggling).
   - **Activity**: Shows timeline of published stories, reposts, and comments.
   - **About**: Displays full bio, member join date, statistics, and social links.

---

## 1. Database Schema Updates

### `User` Schema Extension (`src/db/schema/user.ts`)

Add optional fields:

- `website`: string
- `twitter`: string
- `github`: string
- `linkedin`: string
- `pronouns`: string

### `Repost` Schema (`src/db/schema/repost.ts`)

- `userId`: `Schema.Types.ObjectId` (ref: `'User'`, required, indexed)
- `storyId`: `Schema.Types.ObjectId` (ref: `'Story'`, required, indexed)
- `createdAt`: `Date` (default: `Date.now`)
- Compound unique index on `{ userId: 1, storyId: 1 }`

---

## 2. API Endpoints

### `PUT /api/user/profile`

- **Auth**: Requires valid `auth_token` cookie.
- **Body**: `{ name, bio, avatar, pronouns, website, twitter, github, linkedin }`
- **Behavior**: Validates and updates user document in MongoDB; returns updated user JSON.

### `GET /api/user/reposts` & `POST /api/user/reposts`

- **GET**: Accepts query parameter `userId`. Returns populated stories reposted by the user.
- **POST**: Toggles a repost for `{ storyId }`. Returns `{ reposted: boolean }`.

### `GET /api/user/activity`

- **GET**: Accepts query parameter `userId`. Aggregates recent stories, reposts, and comments sorted by `createdAt` descending.

---

## 3. UI Components & Frontend Logic

### Edit Profile Modal (`src/components/profile/EditProfileModal.astro`)

- Modal dialog with inputs for:
  - Full Name
  - Bio (textarea)
  - Avatar URL
  - Pronouns
  - Social Links (Website, Twitter/X, GitHub, LinkedIn)
- Submits via `fetch('/api/user/profile', { method: 'PUT', ... })`.
- Updates UI elements in real-time or reloads page on success.

### Profile Tab Switcher (`src/pages/profile.astro`)

- Interactive tab headers: **Home**, **Reposts**, **Activity**, **About**.
- Switching tabs updates active state and renders corresponding panel:
  - **Home**: Shows reading list and user's published stories.
  - **Reposts**: Displays list of reposted article cards.
  - **Activity**: Displays chronological activity feed items with icons.
  - **About**: Renders detailed user info, member since date, story count, and social link badges.

---

## 4. Verification & Testing Plan

- Test updating user profile details via modal and verify persistence in MongoDB.
- Test tab navigation on profile page (Home, Reposts, Activity, About).
- Test reposting an article and seeing it appear in the Reposts tab and Activity stream.
