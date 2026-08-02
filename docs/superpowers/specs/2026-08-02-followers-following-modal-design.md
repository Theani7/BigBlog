# Instagram-Style Followers & Following Modal Design Spec

## Overview

Implement an interactive modal popup on `/profile` and `/author/[id]` triggered by clicking the Followers or Following metrics counters. The modal displays a list of follower and following authors with avatars, names, bios, profile links, and live Follow/Unfollow toggle buttons.

## Data API Endpoints (`/api/follows/list`)

Create `src/pages/api/follows/list.ts`:

- `GET /api/follows/list?authorId=<id>&type=followers|following`
- Returns JSON payload:

```json
{
  "success": true,
  "data": [
    {
      "id": "author_id",
      "name": "Author Name",
      "avatar": "https://...",
      "bio": "Author bio...",
      "isFollowing": true
    }
  ]
}
```

## UI Components & Integration

### 1. Followers / Following Modal Component (`src/components/profile/FollowsModal.astro`)

- Structure:
  - Overlay backdrop blur (`backdrop-filter: blur(8px)`, `#faf9f5` cream modal surface).
  - Top tab switcher: **Followers** (`data-follows-tab="followers"`) | **Following** (`data-follows-tab="following"`).
  - Close button (`&times;`).
  - Scrollable author list container (`#follows-list-container`).
  - Loading spinner & empty state illustration ("No followers yet" / "Not following anyone yet").
- Author List Card Item:
  - 44px circular avatar with fallback initials.
  - Display name linking to `/author/[id]`.
  - Short bio preview (1-line truncated).
  - Follow / Unfollow toggle button (`.btn-follow-toggle`).

### 2. Integration Targets

- `src/pages/profile.astro`: Metric items `Followers` & `Following` trigger the modal with initial tab `followers` or `following`.
- `src/pages/author/[id].astro`: Metric items `Followers` & `Following` trigger the modal for target author.

## Design Tokens & Styling

- Canvas / Surface: `#faf9f5` / `#efe9de` / `#ffffff`
- Hairline borders: `#e6dfd8`
- Dark Navy primary accent: `#181715`
