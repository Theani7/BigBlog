# Known Limitations

## Current Limitations

### Database

- **D1 not connected in static mode**: API endpoints return mock data when `output: 'static'`
- **No D1 schema migrations**: Schema is defined but migrations aren't automated
- **Self-referential table type**: `comments.parentId` uses `any` escape for Drizzle circular reference

### Search

- **Client-side only**: Search index is loaded lazily via API, not pre-rendered
- **No full-text search engine**: Uses simple string matching, not FlexSearch/MiniSearch
- **No search analytics**: No tracking of search queries or results

### Performance

- **Google Fonts dependency**: External stylesheet load (could self-host)
- **No service worker**: No offline support
- **No image CDN in static build**: Cloudinary URLs are generated but images aren't optimized at build time

### Testing

- **E2E tests require dev server**: Playwright tests run against `localhost:4321`
- **No visual regression tests**: No screenshot comparison tests
- **No Lighthouse CI**: Performance budgets not automated

### Accessibility

- **No screen reader testing**: Automated tests only, no manual NVDA/VoiceOver testing
- **No contrast ratio auditing**: Manual checks needed
- **Command palette not fully keyboard navigable**: Some edge cases

### Security

- **No CSRF tokens**: Session-based, not token-based
- **No Content-Security-Policy header**: Could be added to vercel.json
- **No rate limiting in static mode**: Rate limiting requires D1

### Build

- **54 pages pre-rendered**: All pages generated at build time
- **No incremental builds**: Full rebuild required for content changes
- **No ISR**: No incremental static regeneration

### API

- **Mock responses**: Most API endpoints return static mock data
- **No authentication**: Anonymous-only, no user accounts
- **No webhook support**: No external service integrations

## Planned Improvements

1. Self-host Geist fonts
2. Add service worker for offline support
3. Implement full-text search with FlexSearch
4. Add Lighthouse CI to pipeline
5. Add visual regression testing
6. Implement CSP headers
7. Add D1 schema migration automation
