# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> API Endpoints >> GET /api/views returns JSON
- Location: tests/e2e/homepage.spec.ts:140:3

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
  42  |     await expect(page.locator('h1')).toBeVisible();
  43  |   });
  44  | 
  45  |   test('displays author info', async ({ page }) => {
  46  |     await page.goto('/blog/getting-started-astro-7');
  47  |     const author = page.locator('[class*="author"], [class*="Author"]');
  48  |     await expect(author.first()).toBeVisible();
  49  |   });
  50  | });
  51  | 
  52  | test.describe('Search', () => {
  53  |   test('loads search page', async ({ page }) => {
  54  |     await page.goto('/search');
  55  |     await expect(page).toHaveTitle(/Search/);
  56  |   });
  57  | 
  58  |   test('has search input', async ({ page }) => {
  59  |     await page.goto('/search');
  60  |     const input = page.locator('input[type="search"], input[placeholder*="earch"]');
  61  |     await expect(input.first()).toBeVisible();
  62  |   });
  63  | });
  64  | 
  65  | test.describe('About Page', () => {
  66  |   test('loads about page', async ({ page }) => {
  67  |     await page.goto('/about');
  68  |     await expect(page).toHaveTitle(/About/);
  69  |   });
  70  | });
  71  | 
  72  | test.describe('Contact Page', () => {
  73  |   test('loads contact page', async ({ page }) => {
  74  |     await page.goto('/contact');
  75  |     await expect(page).toHaveTitle(/Contact/);
  76  |   });
  77  | });
  78  | 
  79  | test.describe('Archive Page', () => {
  80  |   test('loads archive page', async ({ page }) => {
  81  |     await page.goto('/archive');
  82  |     await expect(page).toHaveTitle(/Archive/);
  83  |   });
  84  | });
  85  | 
  86  | test.describe('Dark Mode', () => {
  87  |   test('theme toggle exists', async ({ page }) => {
  88  |     await page.goto('/');
  89  |     const themeToggle = page.locator('[class*="theme"], [class*="Theme"], button[aria-label*="theme" i], button[aria-label*="dark" i]');
  90  |     await expect(themeToggle.first()).toBeVisible();
  91  |   });
  92  | });
  93  | 
  94  | test.describe('Responsive Layout', () => {
  95  |   test('mobile nav toggle exists', async ({ page }) => {
  96  |     await page.setViewportSize({ width: 375, height: 812 });
  97  |     await page.goto('/');
  98  |     const menuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="nav" i], [class*="mobile"]');
  99  |     await expect(menuButton.first()).toBeVisible();
  100 |   });
  101 | });
  102 | 
  103 | test.describe('RSS Feed', () => {
  104 |   test('RSS XML is valid', async ({ request }) => {
  105 |     const response = await request.get('/rss.xml');
  106 |     expect(response.ok()).toBeTruthy();
  107 |     const body = await response.text();
  108 |     expect(body).toContain('<rss');
  109 |     expect(body).toContain('</rss>');
  110 |   });
  111 | });
  112 | 
  113 | test.describe('Sitemap', () => {
  114 |   test('sitemap XML is valid', async ({ request }) => {
  115 |     const response = await request.get('/sitemap.xml');
  116 |     expect(response.ok()).toBeTruthy();
  117 |     const body = await response.text();
  118 |     expect(body).toContain('<urlset');
  119 |     expect(body).toContain('</urlset>');
  120 |   });
  121 | });
  122 | 
  123 | test.describe('Robots.txt', () => {
  124 |   test('robots.txt exists', async ({ request }) => {
  125 |     const response = await request.get('/robots.txt');
  126 |     expect(response.ok()).toBeTruthy();
  127 |     const body = await response.text();
  128 |     expect(body).toContain('User-agent');
  129 |   });
  130 | });
  131 | 
  132 | test.describe('404 Page', () => {
  133 |   test('shows 404 for non-existent routes', async ({ page }) => {
  134 |     const response = await page.goto('/non-existent-page');
  135 |     expect(response?.status()).toBe(404);
  136 |   });
  137 | });
  138 | 
  139 | test.describe('API Endpoints', () => {
  140 |   test('GET /api/views returns JSON', async ({ request }) => {
  141 |     const response = await request.get('/api/views?slug=test');
> 142 |     expect(response.ok()).toBeTruthy();
      |                           ^ Error: expect(received).toBeTruthy()
  143 |     const data = await response.json();
  144 |     expect(data.success).toBe(true);
  145 |   });
  146 | 
  147 |   test('POST /api/newsletter validates email', async ({ request }) => {
  148 |     const response = await request.post('/api/newsletter', {
  149 |       data: { email: 'invalid' },
  150 |     });
  151 |     const data = await response.json();
  152 |     expect(data.success).toBe(false);
  153 |   });
  154 | 
  155 |   test('GET /api/bookmarks returns JSON', async ({ request }) => {
  156 |     const response = await request.get('/api/bookmarks');
  157 |     expect(response.ok()).toBeTruthy();
  158 |     const data = await response.json();
  159 |     expect(data.success).toBe(true);
  160 |   });
  161 | 
  162 |   test('GET /api/preferences returns defaults', async ({ request }) => {
  163 |     const response = await request.get('/api/preferences');
  164 |     expect(response.ok()).toBeTruthy();
  165 |     const data = await response.json();
  166 |     expect(data.data.theme).toBe('system');
  167 |   });
  168 | });
  169 | 
  170 | test.describe('Accessibility', () => {
  171 |   test('page has lang attribute', async ({ page }) => {
  172 |     await page.goto('/');
  173 |     const html = page.locator('html');
  174 |     await expect(html).toHaveAttribute('lang', 'en');
  175 |   });
  176 | 
  177 |   test('images have alt text', async ({ page }) => {
  178 |     await page.goto('/blog');
  179 |     const images = page.locator('img');
  180 |     const count = await images.count();
  181 |     for (let i = 0; i < Math.min(count, 5); i++) {
  182 |       const alt = await images.nth(i).getAttribute('alt');
  183 |       expect(alt).toBeTruthy();
  184 |     }
  185 |   });
  186 | });
  187 | 
```