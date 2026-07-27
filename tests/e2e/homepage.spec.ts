import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/BigBlog/);
  });

  test('has navigation', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('has blog link', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="/blog"]')).toBeVisible();
  });

  test('has about link', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="/about"]')).toBeVisible();
  });
});

test.describe('Blog Index', () => {
  test('loads blog page', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveTitle(/Blog/);
  });

  test('displays article cards', async ({ page }) => {
    await page.goto('/blog');
    const articles = page.locator('article, [class*="card"]');
    await expect(articles.first()).toBeVisible();
  });
});

test.describe('Blog Post', () => {
  test('loads a blog post', async ({ page }) => {
    await page.goto('/blog/getting-started-astro-7');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('displays author info', async ({ page }) => {
    await page.goto('/blog/getting-started-astro-7');
    const author = page.locator('[class*="author"], [class*="Author"]');
    await expect(author.first()).toBeVisible();
  });
});

test.describe('Search', () => {
  test('loads search page', async ({ page }) => {
    await page.goto('/search');
    await expect(page).toHaveTitle(/Search/);
  });

  test('has search input', async ({ page }) => {
    await page.goto('/search');
    const input = page.locator('input[type="search"], input[placeholder*="earch"]');
    await expect(input.first()).toBeVisible();
  });
});

test.describe('About Page', () => {
  test('loads about page', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveTitle(/About/);
  });
});

test.describe('Contact Page', () => {
  test('loads contact page', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveTitle(/Contact/);
  });
});

test.describe('Archive Page', () => {
  test('loads archive page', async ({ page }) => {
    await page.goto('/archive');
    await expect(page).toHaveTitle(/Archive/);
  });
});

test.describe('Dark Mode', () => {
  test('theme toggle exists', async ({ page }) => {
    await page.goto('/');
    const themeToggle = page.locator(
      '[class*="theme"], [class*="Theme"], button[aria-label*="theme" i], button[aria-label*="dark" i]'
    );
    await expect(themeToggle.first()).toBeVisible();
  });
});

test.describe('Responsive Layout', () => {
  test('mobile nav toggle exists', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const menuButton = page.locator(
      'button[aria-label*="menu" i], button[aria-label*="nav" i], [class*="mobile"]'
    );
    await expect(menuButton.first()).toBeVisible();
  });
});

test.describe('RSS Feed', () => {
  test('RSS XML is valid', async ({ request }) => {
    const response = await request.get('/rss.xml');
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toContain('<rss');
    expect(body).toContain('</rss>');
  });
});

test.describe('Sitemap', () => {
  test('sitemap XML is valid', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toContain('<urlset');
    expect(body).toContain('</urlset>');
  });
});

test.describe('Robots.txt', () => {
  test('robots.txt exists', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toContain('User-agent');
  });
});

test.describe('404 Page', () => {
  test('shows 404 for non-existent routes', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    expect(response?.status()).toBe(404);
  });
});

test.describe('API Endpoints', () => {
  test('GET /api/views returns JSON', async ({ request }) => {
    const response = await request.get('/api/views?slug=test');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('POST /api/newsletter validates email', async ({ request }) => {
    const response = await request.post('/api/newsletter', {
      data: { email: 'invalid' },
    });
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  test('GET /api/bookmarks returns JSON', async ({ request }) => {
    const response = await request.get('/api/bookmarks');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('GET /api/preferences returns defaults', async ({ request }) => {
    const response = await request.get('/api/preferences');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.data.theme).toBe('system');
  });
});

test.describe('Accessibility', () => {
  test('page has lang attribute', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/blog');
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });
});
