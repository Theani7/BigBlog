# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> Dark Mode >> theme toggle exists
- Location: tests/e2e/homepage.spec.ts:87:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[class*="theme"], [class*="Theme"], button[aria-label*="theme" i], button[aria-label*="dark" i]').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('[class*="theme"], [class*="Theme"], button[aria-label*="theme" i], button[aria-label*="dark" i]').first()

```

```yaml
- link "Skip to main content":
  - /url: "#main-content"
- banner:
  - link "Electromech":
    - /url: /
    - img
    - text: Electromech
- main:
  - text: Powering Progress. Securing Future.
  - heading "Industrial Electrical Solutions You CanTrust" [level=1]
  - paragraph: Nepal's trusted source for premium switchgears, circuit breakers, and industrial electrical equipment from world-class brands.
  - link "Browse Products":
    - /url: /products
  - link "Contact Us":
    - /url: /contact
  - paragraph: 0+
  - paragraph: Products Available
  - paragraph: 0+
  - paragraph: Trusted Brands
  - paragraph: 0+
  - paragraph: Years Experience
  - paragraph: 0+
  - paragraph: Happy Clients
  - paragraph: Our Range
  - heading "Product Categories" [level=2]
  - link "View all categories":
    - /url: /products
  - link "Circuit Breakers Explore Circuit Breakers Explore products in this category":
    - /url: /products?categories=Circuit%20Breakers
    - img "Circuit Breakers"
    - text: Explore
    - heading "Circuit Breakers" [level=3]
    - paragraph: Explore products in this category
  - link "Industrial Components Explore Industrial Components Explore products in this category":
    - /url: /products?categories=Industrial%20Components
    - img "Industrial Components"
    - text: Explore
    - heading "Industrial Components" [level=3]
    - paragraph: Explore products in this category
  - link "Cables Explore Cables Explore products in this category":
    - /url: /products?categories=Cables
    - img "Cables"
    - text: Explore
    - heading "Cables" [level=3]
    - paragraph: Explore products in this category
  - link "Switchgears Explore Switchgears Explore products in this category":
    - /url: /products?categories=Switchgears
    - img "Switchgears"
    - text: Explore
    - heading "Switchgears" [level=3]
    - paragraph: Explore products in this category
  - link "Lighting Explore Lighting Explore products in this category":
    - /url: /products?categories=Lighting
    - img "Lighting"
    - text: Explore
    - heading "Lighting" [level=3]
    - paragraph: Explore products in this category
  - paragraph: Top Picks
  - heading "Featured Products" [level=2]
  - link "View all products":
    - /url: /products
  - link "High-Capacity Air Circuit Breaker (ACB) Schneider":
    - /url: /products/high-capacity-air-circuit-breaker
    - img "High-Capacity Air Circuit Breaker (ACB)"
    - text: Schneider
  - text: Circuit Breakers
  - link "High-Capacity Air Circuit Breaker (ACB)":
    - /url: /products/high-capacity-air-circuit-breaker
  - paragraph: Premium ACBs designed for maximum reliability in main distribution panels.
  - link "WhatsApp Inquiry":
    - /url: https://wa.me/9779806628221?text=I%20wanna%20know%20more%20about%20this%20product%3A%0A%0A*Name%3A*%20High-Capacity%20Air%20Circuit%20Breaker%20(ACB)%0A*Category%3A*%20Circuit%20Breakers%0A*Link%3A*%20https%3A%2F%2Felectromech.com%2Fproducts%2Fhigh-capacity-air-circuit-breaker
  - link "Intelligent Motor Protection Relay Siemens":
    - /url: /products/intelligent-motor-protection-relay
    - img "Intelligent Motor Protection Relay"
    - text: Siemens
  - text: Industrial Components
  - link "Intelligent Motor Protection Relay":
    - /url: /products/intelligent-motor-protection-relay
  - paragraph: Intelligent monitoring and protection for critical industrial motors.
  - link "WhatsApp Inquiry":
    - /url: https://wa.me/9779806628221?text=I%20wanna%20know%20more%20about%20this%20product%3A%0A%0A*Name%3A*%20Intelligent%20Motor%20Protection%20Relay%0A*Category%3A*%20Industrial%20Components%0A*Link%3A*%20https%3A%2F%2Felectromech.com%2Fproducts%2Fintelligent-motor-protection-relay
  - link "XLPE Insulated Armoured Cable Legrand":
    - /url: /products/xlpe-armoured-cable
    - img "XLPE Insulated Armoured Cable"
    - text: Legrand
  - text: Cables
  - link "XLPE Insulated Armoured Cable":
    - /url: /products/xlpe-armoured-cable
  - paragraph: Heavy-duty underground and exposed environment cables.
  - link "WhatsApp Inquiry":
    - /url: https://wa.me/9779806628221?text=I%20wanna%20know%20more%20about%20this%20product%3A%0A%0A*Name%3A*%20XLPE%20Insulated%20Armoured%20Cable%0A*Category%3A*%20Cables%0A*Link%3A*%20https%3A%2F%2Felectromech.com%2Fproducts%2Fxlpe-armoured-cable
  - link "Industrial Magnetic Contactor ABB":
    - /url: /products/industrial-magnetic-contactor
    - img "Industrial Magnetic Contactor"
    - text: ABB
  - text: Industrial Components
  - link "Industrial Magnetic Contactor":
    - /url: /products/industrial-magnetic-contactor
  - paragraph: Reliable switching devices for motors and lighting loads.
  - link "WhatsApp Inquiry":
    - /url: https://wa.me/9779806628221?text=I%20wanna%20know%20more%20about%20this%20product%3A%0A%0A*Name%3A*%20Industrial%20Magnetic%20Contactor%0A*Category%3A*%20Industrial%20Components%0A*Link%3A*%20https%3A%2F%2Felectromech.com%2Fproducts%2Findustrial-magnetic-contactor
  - paragraph: What We Offer
  - heading "Our Services" [level=2]
  - paragraph: End-to-end support from expert consultation to post-installation assistance.
  - heading "Expert Consultation" [level=3]
  - paragraph: Our engineering team analyzes your project requirements and provides expert recommendations on the most efficient electrical components.
  - heading "Product Sourcing" [level=3]
  - paragraph: Hard-to-find components? We leverage our global network of manufacturers to source specialized electrical equipment for your needs.
  - heading "Installation Support" [level=3]
  - paragraph: Comprehensive technical documentation and post-installation troubleshooting to ensure seamless integration into your systems.
  - paragraph: Our Promise
  - heading "Why Choose Electromech" [level=2]
  - heading "100% Genuine" [level=3]
  - paragraph: Authentic products from authorized distributors
  - heading "Expert Team" [level=3]
  - paragraph: Professional consultation & specification support
  - heading "Fast Supply" [level=3]
  - paragraph: Reliable logistics and prompt delivery
  - heading "After-Sales Support" [level=3]
  - paragraph: Technical assistance whenever you need it
  - heading "Global Brands" [level=3]
  - paragraph: Partnered with world-leading manufacturers
  - heading "Proven Track Record" [level=3]
  - paragraph: Years of excellence in electrical solutions
  - paragraph: About Us
  - heading "Electromech Switchgears Traders" [level=2]
  - paragraph: Founded on the principles of engineering excellence and customer trust, Electromech Switchgears Traders has established itself as a leading supplier of industrial electrical equipment in Nepal.
  - paragraph: Our mission is to empower industries by providing the most reliable, efficient, and technologically advanced electrical solutions — ensuring uninterrupted operations and uncompromised safety.
  - text: Pokhara Based Pan-Nepal Service
  - img "Electromech Engineering Team"
  - paragraph: Authorized Dealer
  - heading "Brands We Carry" [level=2]
  - text: Schneider Siemens Legrand ABB Eaton Philips
  - heading "Need help selecting the right electrical products?" [level=2]
  - paragraph: Our technical experts are ready to assist you with specifications, availability, and competitive pricing.
  - button "Request a Quotation"
  - link "Contact Us":
    - /url: /contact
  - paragraph: Reach Out
  - heading "Get in Touch" [level=2]
  - heading "Contact Information" [level=3]
  - paragraph: Address
  - paragraph: Pokhara, Nepal
  - paragraph: Phone
  - paragraph: +977 9806628221
  - paragraph: Email
  - paragraph: switchgears.electromech@gmail.com
  - separator
  - paragraph: Business Hours
  - paragraph: 10am – 5pm (Closed on Saturday)
  - iframe
- contentinfo:
  - heading "Support" [level=3]
  - list:
    - listitem:
      - link "Help Center":
        - /url: "#"
    - listitem:
      - link "Product Sourcing":
        - /url: "#"
    - listitem:
      - link "Technical Assistance":
        - /url: "#"
    - listitem:
      - link "Contact Us":
        - /url: /contact
  - heading "Products" [level=3]
  - list:
    - listitem:
      - link "Switchgears":
        - /url: /products?category=Switchgears
    - listitem:
      - link "Circuit Breakers":
        - /url: /products?category=Circuit%20Breakers
    - listitem:
      - link "Industrial Cables":
        - /url: /products?category=Cables
    - listitem:
      - link "Lighting Solutions":
        - /url: /products?category=Lighting
  - heading "Electromech Switchgears Traders" [level=3]
  - list:
    - listitem:
      - link "About Us":
        - /url: "#"
    - listitem:
      - link "Our Services":
        - /url: "#"
    - listitem:
      - link "Careers":
        - /url: "#"
    - listitem:
      - link "Investors":
        - /url: "#"
  - text: © 2026 Electromech Switchgears Traders.
  - link "Terms":
    - /url: "#"
  - link "Privacy":
    - /url: "#"
  - text: Developed by
  - link "ProvixTech":
    - /url: https://provix-tech.vercel.app/
- navigation:
  - link "Home":
    - /url: /
  - link "Products":
    - /url: /products
  - button "Inquiry"
  - link "Contact":
    - /url: /contact
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
> 90  |     await expect(themeToggle.first()).toBeVisible();
      |                                       ^ Error: expect(locator).toBeVisible() failed
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