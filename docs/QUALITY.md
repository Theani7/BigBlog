# Quality Standards

## TypeScript

- **Strict mode**: Enabled with `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`
- **Zero errors**: All type errors must be resolved
- **No `any`**: Only allowed in documented cases (Drizzle self-referential tables)
- **No `ts-ignore`**: Not permitted

## ESLint

- **Zero errors**: All lint errors must be resolved
- **Warnings allowed**: `no-explicit-any` set to warn
- **Config**: `eslint.config.js` (flat config format)

## Testing

| Category    | Target              | Current                   |
| ----------- | ------------------- | ------------------------- |
| Unit tests  | >90% coverage       | 169 tests passing         |
| E2E tests   | 100% critical paths | 21 tests x 3 viewports    |
| Integration | Key modules         | API, security, SEO tested |

## Code Quality

- **Prettier**: Auto-formatted on commit via lint-staged
- **Husky**: Pre-commit hooks run ESLint + Prettier
- **No unused imports**: Enforced by TypeScript and ESLint

## Build

- **Zero-error build**: `npm run build` must succeed
- **Type checking**: `npm run typecheck` must pass with 0 errors
- **Linting**: `npm run lint` must pass with 0 errors

## Security

- XSS prevention via input sanitization
- CSRF protection via session-based tokens
- Rate limiting on all API endpoints
- Input validation on all user-facing forms
- Safe URL validation (blocks javascript: and data: protocols)

## Performance

- Static output (54 pages pre-rendered)
- Total dist: ~3.1MB
- CSS: 93.5KB total (7 files)
- JS: 4.3KB total (1 file)
- Search index served lazily via API endpoint
- Link prefetching on viewport intersection

## Accessibility

- Semantic HTML throughout
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly content structure
- Reduced motion support via CSS media queries
