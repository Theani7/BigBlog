# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> Blog Post >> displays author info
- Location: tests/e2e/homepage.spec.ts:45:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[class*="author"], [class*="Author"]').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('[class*="author"], [class*="Author"]').first()

```

```yaml
- main:
  - img
  - 'heading "404: Not found" [level=1]'
  - text: "Path: /blog/getting-started-astro-7"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Homepage', () => {
  4   |   test('loads successfully', async ({ page }) => {
  5   |     await page.goto('/');
  6   |     await expect(page).toHaveTitle(/BigBlog/);
  7   |   });
  8   | 
  9   |   test('has navigation', async ({ page }) => {
  10  |     await page.goto('/');
  11  |     const nav = page.locator('nav');
  12  |     await expect(nav).toBeVisible();
  13  |   });
  14  | 
  15  |   test('has blog link', async ({ page }) => {
  16  |     await page.goto('/');
  17  |     await expect(page.locator('a[href="/blog"]')).toBeVisible();
  18  |   });
  19  | 
  20  |   test('has about link', async ({ page }) => {
  21  |     await page.goto('/');
  22  |     await expect(page.locator('a[href="/about"]')).toBeVisible();
  23  |   });
  24  | });
  25  | 
  26  | test.describe('Blog Index', () => {
  27  |   test('loads blog page', async ({ page }) => {
  28  |     await page.goto('/blog');
  29  |     await expect(page).toHaveTitle(/Blog/);
  30  |   });
  31  | 
  32  |   test('displays article cards', async ({ page }) => {
  33  |     await page.goto('/blog');
  34  |     const articles = page.locator('article, [class*="card"]');
  35  |     await expect(articles.first()).toBeVisible();
  36  |   });
  37  | });
  38  | 
  39  | test.describe('Blog Post', () => {
  40  |   test('loads a blog post', async ({ page }) => {
  41  |     await page.goto('/blog/getting-started-astro-7');
  42  |     await expect(page.locator('h1')).toBeVisible();
  43  |   });
  44  | 
  45  |   test('displays author info', async ({ page }) => {
  46  |     await page.goto('/blog/getting-started-astro-7');
  47  |     const author = page.locator('[class*="author"], [class*="Author"]');
> 48  |     await expect(author.first()).toBeVisible();
      |                                  ^ Error: expect(locator).toBeVisible() failed
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
  142 |     expect(response.ok()).toBeTruthy();
  143 |     const data = await response.json();
  144 |     expect(data.success).toBe(true);
  145 |   });
  146 | 
  147 |   test('POST /api/newsletter validates email', async ({ request }) => {
  148 |     const response = await request.post('/api/newsletter', {
```