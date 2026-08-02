# Avatar Device Image Upload Design Specification

## Overview

Replace the static Avatar URL text input in the author profile editor on `/profile` with a device file uploader supporting local file picker, drag-and-drop, real-time image preview, and reset/remove functionality.

## Requirements & Behavior

### 1. UI Components in `src/pages/profile.astro`

- **Avatar Uploader Container (`.avatar-upload-widget`)**:
  - **Circular Image Preview (`#inpage-avatar-preview`)**: 80px x 80px circular preview with hairline border (`#e6dfd8`).
  - **Camera Badge Overlay**: Camera SVG icon overlay on hover indicating "Change avatar".
  - **Hidden File Input (`#inpage-avatar-file`)**: `<input type="file" id="inpage-avatar-file" accept="image/png, image/jpeg, image/webp, image/gif" style="display: none;" />`.
  - **Hidden Text Field (`#inpage-avatar`)**: Stores the base64 or image data string for form submission.
- **Action Buttons**:
  - "Upload photo" button (`#trigger-avatar-file-btn`): Triggers file input click.
  - "Remove photo" button (`#remove-avatar-btn`): Resets avatar preview to default initials fallback and clears avatar field.

### 2. Client-Side Script Logic (`src/pages/profile.astro`)

- **Drag & Drop Events**:
  - `dragover`, `dragleave`, and `drop` handlers attached to `.avatar-upload-widget`.
  - Visual feedback on dragover (`border-color: #181715`, background highlight).
- **File Reader Conversion**:
  - When a file is selected or dropped, `FileReader.readAsDataURL(file)` converts it to a base64 Data URL.
  - Updates `#inpage-avatar-preview` src attribute and `#inpage-avatar` hidden input value immediately.
- **Remove Photo Handler**:
  - Clears `#inpage-avatar-preview` and `#inpage-avatar` value.
- **Form Submission**:
  - Includes `avatar` value in the `PUT /api/user/profile` request payload as before.

## Design Tokens & Styling

- Canvas background: `#faf9f5`
- Surface card: `#efe9de` / `#ffffff`
- Hairline border: `#e6dfd8`
- Primary button: `#181715`
