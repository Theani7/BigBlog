# Avatar Device Image Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the plain Avatar URL input in `src/pages/profile.astro` with an interactive device image uploader featuring file selection, drag-and-drop, real-time preview, and remove/reset controls.

**Architecture:** Update `src/pages/profile.astro` edit form UI with a circular avatar uploader widget (`.avatar-upload-widget`), hidden `<input type="file" accept="image/*">`, hidden `<input type="hidden" id="inpage-avatar">`, and `FileReader` drag & drop / file picker JS logic.

**Tech Stack:** Astro, HTML5 File API (`FileReader`), CSS, JavaScript.

## Global Constraints

- Design Tokens: Canvas `#faf9f5`, Surface Cards `#efe9de`, Hairline Border `#e6dfd8`, Dark Navy Surface `#181715`.
- Ensure browser JS compatibility inside `<script is:inline data-astro-rerun>` (no un-transpiled TypeScript type annotations).

---

### Task 1: Replace Avatar URL Input with Device Image Upload Widget & Drag-and-Drop JS

**Files:**

- Modify: `src/pages/profile.astro`

**Interfaces:**

- Consumes: Current user avatar data, `FileReader` web API.
- Produces: Avatar upload widget with live preview image, camera badge, file picker button, remove photo button, drag-and-drop support, and base64 string storage for `PUT /api/user/profile`.

- [ ] **Step 1: Replace Avatar URL input HTML with Uploader Widget in `src/pages/profile.astro`**

Replace the avatar URL `<input type="text">` group in `tab-content-edit` with:

- `.avatar-upload-widget` container wrapping:
  - Circular preview image `#inpage-avatar-preview` (80px diameter, 50% border-radius).
  - Hidden file input `<input type="file" id="inpage-avatar-file" accept="image/png, image/jpeg, image/webp, image/gif" style="display: none;" />`.
  - Hidden text input `<input type="hidden" id="inpage-avatar" name="avatar" value={user.avatar} />`.
  - Buttons group: "Upload photo" button (`#trigger-avatar-file-btn`), "Remove photo" button (`#remove-avatar-btn`).

- [ ] **Step 2: Add Drag-and-Drop & File Reader JavaScript in `setupProfileWorkspace()`**

In `src/pages/profile.astro` script block:

- Attach `click` listener to `#trigger-avatar-file-btn` to trigger `#inpage-avatar-file.click()`.
- Attach `change` listener to `#inpage-avatar-file` reading selected `File` with `FileReader.readAsDataURL()`.
- Attach `dragover`, `dragleave`, and `drop` event listeners to `.avatar-upload-widget` for drag-and-drop file processing.
- Attach `click` listener to `#remove-avatar-btn` to clear avatar value and reset preview image.

- [ ] **Step 3: Add CSS for Avatar Upload Widget**

Add styles for `.avatar-upload-widget`, camera icon badge overlay, hover effects, and responsive button row layout.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/profile.astro
git commit -m "feat(profile): replace avatar URL input with device image uploader and drag-and-drop"
```
