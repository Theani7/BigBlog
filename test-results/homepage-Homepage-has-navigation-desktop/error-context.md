# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> Homepage >> has navigation
- Location: tests/e2e/homepage.spec.ts:9:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('nav')
Expected: visible
Error: strict mode violation: locator('nav') resolved to 2 elements:
    1) <nav data-astro-cid-nen7h5rs="" class="flex items-center gap-8">…</nav> aka getByText('ProductsServices')
    2) <nav data-astro-cid-k6c7o3mi="" class="md:hidden fixed bottom-0 left-0 right-0 bg-canvas border-t border-hairline pb-safe z-50">…</nav> aka locator('nav').filter({ hasText: 'HomeProductsInquiryContact' })

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('nav')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "Electromech" [ref=e5] [cursor=pointer]:
        - /url: /
      - generic [ref=e10]:
        - navigation [ref=e11]:
          - link "Products" [ref=e12] [cursor=pointer]:
            - /url: /products
          - link "Services" [ref=e13] [cursor=pointer]:
            - /url: /#services
        - link "Contact Us" [ref=e15] [cursor=pointer]:
          - /url: /contact
  - main [ref=e16]:
    - generic [ref=e17]:
      - generic [ref=e22]:
        - generic [ref=e23]: Powering Progress. Securing Future.
        - heading "Industrial Electrical Solutions You CanTrust" [level=1] [ref=e27]
        - paragraph [ref=e28]: Nepal's trusted source for premium switchgears, circuit breakers, and industrial electrical equipment from world-class brands.
        - generic [ref=e29]:
          - link "Browse Products" [ref=e30] [cursor=pointer]:
            - /url: /products
          - link "Contact Us" [ref=e33] [cursor=pointer]:
            - /url: /contact
      - generic [ref=e34]: Scroll
    - generic [ref=e39]:
      - generic [ref=e40]:
        - paragraph [ref=e41]: 0+
        - paragraph [ref=e42]: Products Available
      - generic [ref=e43]:
        - paragraph [ref=e44]: 0+
        - paragraph [ref=e45]: Trusted Brands
      - generic [ref=e46]:
        - paragraph [ref=e47]: 0+
        - paragraph [ref=e48]: Years Experience
      - generic [ref=e49]:
        - paragraph [ref=e50]: 0+
        - paragraph [ref=e51]: Happy Clients
    - generic [ref=e52]:
      - generic [ref=e53]:
        - generic [ref=e54]:
          - paragraph [ref=e55]: Our Range
          - heading "Product Categories" [level=2] [ref=e56]
        - link "View all categories" [ref=e57] [cursor=pointer]:
          - /url: /products
      - generic [ref=e60]:
        - link [ref=e61] [cursor=pointer]:
          - /url: /products?categories=Circuit%20Breakers
          - generic [ref=e62]:
            - img "Circuit Breakers" [ref=e63]
            - generic [ref=e65]: Explore
          - generic [ref=e69]:
            - heading "Circuit Breakers" [level=3] [ref=e70]
            - paragraph [ref=e71]: Explore products in this category
        - link [ref=e72] [cursor=pointer]:
          - /url: /products?categories=Industrial%20Components
          - generic [ref=e73]:
            - img "Industrial Components" [ref=e74]
            - generic [ref=e76]: Explore
          - generic [ref=e80]:
            - heading "Industrial Components" [level=3] [ref=e81]
            - paragraph [ref=e82]: Explore products in this category
        - link [ref=e83] [cursor=pointer]:
          - /url: /products?categories=Cables
          - generic [ref=e84]:
            - img "Cables" [ref=e85]
            - generic [ref=e87]: Explore
          - generic [ref=e91]:
            - heading "Cables" [level=3] [ref=e92]
            - paragraph [ref=e93]: Explore products in this category
        - link [ref=e94] [cursor=pointer]:
          - /url: /products?categories=Switchgears
          - generic [ref=e95]:
            - img "Switchgears" [ref=e96]
            - generic [ref=e98]: Explore
          - generic [ref=e102]:
            - heading "Switchgears" [level=3] [ref=e103]
            - paragraph [ref=e104]: Explore products in this category
        - link [ref=e105] [cursor=pointer]:
          - /url: /products?categories=Lighting
          - generic [ref=e106]:
            - img "Lighting" [ref=e107]
            - generic [ref=e109]: Explore
          - generic [ref=e113]:
            - heading "Lighting" [level=3] [ref=e114]
            - paragraph [ref=e115]: Explore products in this category
    - generic [ref=e117]:
      - generic [ref=e118]:
        - generic [ref=e119]:
          - paragraph [ref=e120]: Top Picks
          - heading "Featured Products" [level=2] [ref=e121]
        - link "View all products" [ref=e122] [cursor=pointer]:
          - /url: /products
      - generic [ref=e125]:
        - generic [ref=e127]:
          - link "High-Capacity Air Circuit Breaker (ACB) Schneider" [ref=e128] [cursor=pointer]:
            - /url: /products/high-capacity-air-circuit-breaker
            - img "High-Capacity Air Circuit Breaker (ACB)" [ref=e129]
            - generic [ref=e130]: Schneider
          - generic [ref=e132]:
            - generic [ref=e133]: Circuit Breakers
            - link "High-Capacity Air Circuit Breaker (ACB)" [ref=e135] [cursor=pointer]:
              - /url: /products/high-capacity-air-circuit-breaker
            - paragraph [ref=e136]: Premium ACBs designed for maximum reliability in main distribution panels.
            - link "WhatsApp Inquiry" [ref=e138] [cursor=pointer]:
              - /url: https://wa.me/9779806628221?text=I%20wanna%20know%20more%20about%20this%20product%3A%0A%0A*Name%3A*%20High-Capacity%20Air%20Circuit%20Breaker%20(ACB)%0A*Category%3A*%20Circuit%20Breakers%0A*Link%3A*%20https%3A%2F%2Felectromech.com%2Fproducts%2Fhigh-capacity-air-circuit-breaker
        - generic [ref=e140]:
          - link "Intelligent Motor Protection Relay Siemens" [ref=e141] [cursor=pointer]:
            - /url: /products/intelligent-motor-protection-relay
            - img "Intelligent Motor Protection Relay" [ref=e142]
            - generic [ref=e143]: Siemens
          - generic [ref=e145]:
            - generic [ref=e146]: Industrial Components
            - link "Intelligent Motor Protection Relay" [ref=e148] [cursor=pointer]:
              - /url: /products/intelligent-motor-protection-relay
            - paragraph [ref=e149]: Intelligent monitoring and protection for critical industrial motors.
            - link "WhatsApp Inquiry" [ref=e151] [cursor=pointer]:
              - /url: https://wa.me/9779806628221?text=I%20wanna%20know%20more%20about%20this%20product%3A%0A%0A*Name%3A*%20Intelligent%20Motor%20Protection%20Relay%0A*Category%3A*%20Industrial%20Components%0A*Link%3A*%20https%3A%2F%2Felectromech.com%2Fproducts%2Fintelligent-motor-protection-relay
        - generic [ref=e153]:
          - link "XLPE Insulated Armoured Cable Legrand" [ref=e154] [cursor=pointer]:
            - /url: /products/xlpe-armoured-cable
            - img "XLPE Insulated Armoured Cable" [ref=e155]
            - generic [ref=e156]: Legrand
          - generic [ref=e158]:
            - generic [ref=e159]: Cables
            - link "XLPE Insulated Armoured Cable" [ref=e161] [cursor=pointer]:
              - /url: /products/xlpe-armoured-cable
            - paragraph [ref=e162]: Heavy-duty underground and exposed environment cables.
            - link "WhatsApp Inquiry" [ref=e164] [cursor=pointer]:
              - /url: https://wa.me/9779806628221?text=I%20wanna%20know%20more%20about%20this%20product%3A%0A%0A*Name%3A*%20XLPE%20Insulated%20Armoured%20Cable%0A*Category%3A*%20Cables%0A*Link%3A*%20https%3A%2F%2Felectromech.com%2Fproducts%2Fxlpe-armoured-cable
        - generic [ref=e166]:
          - link "Industrial Magnetic Contactor ABB" [ref=e167] [cursor=pointer]:
            - /url: /products/industrial-magnetic-contactor
            - img "Industrial Magnetic Contactor" [ref=e168]
            - generic [ref=e169]: ABB
          - generic [ref=e171]:
            - generic [ref=e172]: Industrial Components
            - link "Industrial Magnetic Contactor" [ref=e174] [cursor=pointer]:
              - /url: /products/industrial-magnetic-contactor
            - paragraph [ref=e175]: Reliable switching devices for motors and lighting loads.
            - link "WhatsApp Inquiry" [ref=e177] [cursor=pointer]:
              - /url: https://wa.me/9779806628221?text=I%20wanna%20know%20more%20about%20this%20product%3A%0A%0A*Name%3A*%20Industrial%20Magnetic%20Contactor%0A*Category%3A*%20Industrial%20Components%0A*Link%3A*%20https%3A%2F%2Felectromech.com%2Fproducts%2Findustrial-magnetic-contactor
    - generic [ref=e181]:
      - generic [ref=e182]:
        - paragraph [ref=e183]: What We Offer
        - heading "Our Services" [level=2] [ref=e184]
        - paragraph [ref=e185]: End-to-end support from expert consultation to post-installation assistance.
      - generic [ref=e186]:
        - generic [ref=e187]:
          - heading "Expert Consultation" [level=3] [ref=e191]
          - paragraph [ref=e192]: Our engineering team analyzes your project requirements and provides expert recommendations on the most efficient electrical components.
        - generic [ref=e193]:
          - heading "Product Sourcing" [level=3] [ref=e198]
          - paragraph [ref=e199]: Hard-to-find components? We leverage our global network of manufacturers to source specialized electrical equipment for your needs.
        - generic [ref=e200]:
          - heading "Installation Support" [level=3] [ref=e204]
          - paragraph [ref=e205]: Comprehensive technical documentation and post-installation troubleshooting to ensure seamless integration into your systems.
    - generic [ref=e206]:
      - generic [ref=e207]:
        - paragraph [ref=e208]: Our Promise
        - heading "Why Choose Electromech" [level=2] [ref=e209]
      - generic [ref=e210]:
        - generic [ref=e211]:
          - heading "100% Genuine" [level=3] [ref=e216]
          - paragraph [ref=e217]: Authentic products from authorized distributors
        - generic [ref=e218]:
          - heading "Expert Team" [level=3] [ref=e223]
          - paragraph [ref=e224]: Professional consultation & specification support
        - generic [ref=e225]:
          - heading "Fast Supply" [level=3] [ref=e232]
          - paragraph [ref=e233]: Reliable logistics and prompt delivery
        - generic [ref=e234]:
          - heading "After-Sales Support" [level=3] [ref=e238]
          - paragraph [ref=e239]: Technical assistance whenever you need it
        - generic [ref=e240]:
          - heading "Global Brands" [level=3] [ref=e245]
          - paragraph [ref=e246]: Partnered with world-leading manufacturers
        - generic [ref=e247]:
          - heading "Proven Track Record" [level=3] [ref=e251]
          - paragraph [ref=e252]: Years of excellence in electrical solutions
    - generic [ref=e255]:
      - generic [ref=e256]:
        - paragraph [ref=e257]: About Us
        - heading "Electromech Switchgears Traders" [level=2] [ref=e258]
        - paragraph [ref=e259]: Founded on the principles of engineering excellence and customer trust, Electromech Switchgears Traders has established itself as a leading supplier of industrial electrical equipment in Nepal.
        - paragraph [ref=e260]: Our mission is to empower industries by providing the most reliable, efficient, and technologically advanced electrical solutions — ensuring uninterrupted operations and uncompromised safety.
        - generic [ref=e261]:
          - generic [ref=e262]: Pokhara Based
          - generic [ref=e265]: Pan-Nepal Service
      - img "Electromech Engineering Team" [ref=e270]
    - generic [ref=e271]:
      - generic [ref=e272]:
        - paragraph [ref=e273]: Authorized Dealer
        - heading "Brands We Carry" [level=2] [ref=e274]
      - generic [ref=e275]:
        - generic [ref=e276]: Schneider
        - generic [ref=e278]: Siemens
        - generic [ref=e280]: Legrand
        - generic [ref=e282]: ABB
        - generic [ref=e284]: Eaton
        - generic [ref=e286]: Philips
    - generic [ref=e291]:
      - heading "Need help selecting the right electrical products?" [level=2] [ref=e292]
      - paragraph [ref=e293]: Our technical experts are ready to assist you with specifications, availability, and competitive pricing.
      - generic [ref=e294]:
        - button "Request a Quotation" [ref=e295]
        - link "Contact Us" [ref=e298] [cursor=pointer]:
          - /url: /contact
    - generic [ref=e299]:
      - generic [ref=e300]:
        - paragraph [ref=e301]: Reach Out
        - heading "Get in Touch" [level=2] [ref=e302]
      - generic [ref=e303]:
        - generic [ref=e304]:
          - heading "Contact Information" [level=3] [ref=e305]
          - generic [ref=e306]:
            - generic [ref=e312]:
              - paragraph [ref=e313]: Address
              - paragraph [ref=e314]: Pokhara, Nepal
            - generic [ref=e319]:
              - paragraph [ref=e320]: Phone
              - paragraph [ref=e321]: +977 9806628221
            - generic [ref=e327]:
              - paragraph [ref=e328]: Email
              - paragraph [ref=e329]: switchgears.electromech@gmail.com
            - separator [ref=e330]
            - generic [ref=e336]:
              - paragraph [ref=e337]: Business Hours
              - paragraph [ref=e338]: 10am – 5pm (Closed on Saturday)
        - iframe [ref=e340]
  - contentinfo [ref=e341]:
    - generic [ref=e342]:
      - generic [ref=e343]:
        - generic [ref=e344]:
          - heading "Support" [level=3] [ref=e345]
          - list [ref=e346]:
            - listitem [ref=e347]:
              - link "Help Center" [ref=e348] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e349]:
              - link "Product Sourcing" [ref=e350] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e351]:
              - link "Technical Assistance" [ref=e352] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e353]:
              - link "Contact Us" [ref=e354] [cursor=pointer]:
                - /url: /contact
        - generic [ref=e355]:
          - heading "Products" [level=3] [ref=e356]
          - list [ref=e357]:
            - listitem [ref=e358]:
              - link "Switchgears" [ref=e359] [cursor=pointer]:
                - /url: /products?category=Switchgears
            - listitem [ref=e360]:
              - link "Circuit Breakers" [ref=e361] [cursor=pointer]:
                - /url: /products?category=Circuit%20Breakers
            - listitem [ref=e362]:
              - link "Industrial Cables" [ref=e363] [cursor=pointer]:
                - /url: /products?category=Cables
            - listitem [ref=e364]:
              - link "Lighting Solutions" [ref=e365] [cursor=pointer]:
                - /url: /products?category=Lighting
        - generic [ref=e366]:
          - heading "Electromech Switchgears Traders" [level=3] [ref=e367]
          - list [ref=e368]:
            - listitem [ref=e369]:
              - link "About Us" [ref=e370] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e371]:
              - link "Our Services" [ref=e372] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e373]:
              - link "Careers" [ref=e374] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e375]:
              - link "Investors" [ref=e376] [cursor=pointer]:
                - /url: "#"
      - generic [ref=e378]:
        - generic [ref=e379]: © 2026 Electromech Switchgears Traders.
        - generic [ref=e380]: ·
        - link "Terms" [ref=e381] [cursor=pointer]:
          - /url: "#"
        - generic [ref=e382]: ·
        - link "Privacy" [ref=e383] [cursor=pointer]:
          - /url: "#"
        - generic [ref=e384]: ·
        - generic [ref=e385]:
          - text: Developed by
          - link "ProvixTech" [ref=e386] [cursor=pointer]:
            - /url: https://provix-tech.vercel.app/
  - generic [ref=e389]:
    - button [ref=e390]
    - button [ref=e396]
    - button [ref=e400]
    - button [ref=e408]
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
> 12  |     await expect(nav).toBeVisible();
      |                       ^ Error: expect(locator).toBeVisible() failed
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
```