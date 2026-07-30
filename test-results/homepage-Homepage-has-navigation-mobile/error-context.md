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
    2) <nav data-astro-cid-k6c7o3mi="" class="md:hidden fixed bottom-0 left-0 right-0 bg-canvas border-t border-hairline pb-safe z-50">…</nav> aka getByRole('navigation')

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
    - link "Electromech" [ref=e5] [cursor=pointer]:
      - /url: /
  - main [ref=e10]:
    - generic [ref=e16]:
      - generic [ref=e17]: Powering Progress. Securing Future.
      - heading "Industrial Electrical Solutions You CanTrust" [level=1] [ref=e21]
      - paragraph [ref=e22]: Nepal's trusted source for premium switchgears, circuit breakers, and industrial electrical equipment from world-class brands.
      - generic [ref=e23]:
        - link "Browse Products" [ref=e24] [cursor=pointer]:
          - /url: /products
        - link "Contact Us" [ref=e27] [cursor=pointer]:
          - /url: /contact
    - generic [ref=e30]:
      - generic [ref=e31]:
        - paragraph [ref=e32]: 0+
        - paragraph [ref=e33]: Products Available
      - generic [ref=e34]:
        - paragraph [ref=e35]: 0+
        - paragraph [ref=e36]: Trusted Brands
      - generic [ref=e37]:
        - paragraph [ref=e38]: 0+
        - paragraph [ref=e39]: Years Experience
      - generic [ref=e40]:
        - paragraph [ref=e41]: 0+
        - paragraph [ref=e42]: Happy Clients
    - generic [ref=e43]:
      - generic [ref=e44]:
        - generic [ref=e45]:
          - paragraph [ref=e46]: Our Range
          - heading "Product Categories" [level=2] [ref=e47]
        - link "View all categories" [ref=e48] [cursor=pointer]:
          - /url: /products
      - generic [ref=e51]:
        - link [ref=e52] [cursor=pointer]:
          - /url: /products?categories=Circuit%20Breakers
          - generic [ref=e53]:
            - img "Circuit Breakers" [ref=e54]
            - generic [ref=e56]: Explore
          - generic [ref=e60]:
            - heading "Circuit Breakers" [level=3] [ref=e61]
            - paragraph [ref=e62]: Explore products in this category
        - link [ref=e63] [cursor=pointer]:
          - /url: /products?categories=Industrial%20Components
          - generic [ref=e64]:
            - img "Industrial Components" [ref=e65]
            - generic [ref=e67]: Explore
          - generic [ref=e71]:
            - heading "Industrial Components" [level=3] [ref=e72]
            - paragraph [ref=e73]: Explore products in this category
        - link [ref=e74] [cursor=pointer]:
          - /url: /products?categories=Cables
          - generic [ref=e75]:
            - img "Cables" [ref=e76]
            - generic [ref=e78]: Explore
          - generic [ref=e82]:
            - heading "Cables" [level=3] [ref=e83]
            - paragraph [ref=e84]: Explore products in this category
        - link [ref=e85] [cursor=pointer]:
          - /url: /products?categories=Switchgears
          - generic [ref=e86]:
            - img "Switchgears" [ref=e87]
            - generic [ref=e89]: Explore
          - generic [ref=e93]:
            - heading "Switchgears" [level=3] [ref=e94]
            - paragraph [ref=e95]: Explore products in this category
        - link [ref=e96] [cursor=pointer]:
          - /url: /products?categories=Lighting
          - generic [ref=e97]:
            - img "Lighting" [ref=e98]
            - generic [ref=e100]: Explore
          - generic [ref=e104]:
            - heading "Lighting" [level=3] [ref=e105]
            - paragraph [ref=e106]: Explore products in this category
    - generic [ref=e108]:
      - generic [ref=e109]:
        - generic [ref=e110]:
          - paragraph [ref=e111]: Top Picks
          - heading "Featured Products" [level=2] [ref=e112]
        - link "View all products" [ref=e113] [cursor=pointer]:
          - /url: /products
      - generic [ref=e116]:
        - generic [ref=e118]:
          - link "High-Capacity Air Circuit Breaker (ACB) Schneider" [ref=e119] [cursor=pointer]:
            - /url: /products/high-capacity-air-circuit-breaker
            - img "High-Capacity Air Circuit Breaker (ACB)" [ref=e120]
            - generic [ref=e121]: Schneider
          - generic [ref=e123]:
            - generic [ref=e124]: Circuit Breakers
            - link "High-Capacity Air Circuit Breaker (ACB)" [ref=e126] [cursor=pointer]:
              - /url: /products/high-capacity-air-circuit-breaker
            - paragraph [ref=e127]: Premium ACBs designed for maximum reliability in main distribution panels.
            - link "WhatsApp Inquiry" [ref=e129] [cursor=pointer]:
              - /url: https://wa.me/9779806628221?text=I%20wanna%20know%20more%20about%20this%20product%3A%0A%0A*Name%3A*%20High-Capacity%20Air%20Circuit%20Breaker%20(ACB)%0A*Category%3A*%20Circuit%20Breakers%0A*Link%3A*%20https%3A%2F%2Felectromech.com%2Fproducts%2Fhigh-capacity-air-circuit-breaker
        - generic [ref=e131]:
          - link "Intelligent Motor Protection Relay Siemens" [ref=e132] [cursor=pointer]:
            - /url: /products/intelligent-motor-protection-relay
            - img "Intelligent Motor Protection Relay" [ref=e133]
            - generic [ref=e134]: Siemens
          - generic [ref=e136]:
            - generic [ref=e137]: Industrial Components
            - link "Intelligent Motor Protection Relay" [ref=e139] [cursor=pointer]:
              - /url: /products/intelligent-motor-protection-relay
            - paragraph [ref=e140]: Intelligent monitoring and protection for critical industrial motors.
            - link "WhatsApp Inquiry" [ref=e142] [cursor=pointer]:
              - /url: https://wa.me/9779806628221?text=I%20wanna%20know%20more%20about%20this%20product%3A%0A%0A*Name%3A*%20Intelligent%20Motor%20Protection%20Relay%0A*Category%3A*%20Industrial%20Components%0A*Link%3A*%20https%3A%2F%2Felectromech.com%2Fproducts%2Fintelligent-motor-protection-relay
        - generic [ref=e144]:
          - link "XLPE Insulated Armoured Cable Legrand" [ref=e145] [cursor=pointer]:
            - /url: /products/xlpe-armoured-cable
            - img "XLPE Insulated Armoured Cable" [ref=e146]
            - generic [ref=e147]: Legrand
          - generic [ref=e149]:
            - generic [ref=e150]: Cables
            - link "XLPE Insulated Armoured Cable" [ref=e152] [cursor=pointer]:
              - /url: /products/xlpe-armoured-cable
            - paragraph [ref=e153]: Heavy-duty underground and exposed environment cables.
            - link "WhatsApp Inquiry" [ref=e155] [cursor=pointer]:
              - /url: https://wa.me/9779806628221?text=I%20wanna%20know%20more%20about%20this%20product%3A%0A%0A*Name%3A*%20XLPE%20Insulated%20Armoured%20Cable%0A*Category%3A*%20Cables%0A*Link%3A*%20https%3A%2F%2Felectromech.com%2Fproducts%2Fxlpe-armoured-cable
        - generic [ref=e157]:
          - link "Industrial Magnetic Contactor ABB" [ref=e158] [cursor=pointer]:
            - /url: /products/industrial-magnetic-contactor
            - img "Industrial Magnetic Contactor" [ref=e159]
            - generic [ref=e160]: ABB
          - generic [ref=e162]:
            - generic [ref=e163]: Industrial Components
            - link "Industrial Magnetic Contactor" [ref=e165] [cursor=pointer]:
              - /url: /products/industrial-magnetic-contactor
            - paragraph [ref=e166]: Reliable switching devices for motors and lighting loads.
            - link "WhatsApp Inquiry" [ref=e168] [cursor=pointer]:
              - /url: https://wa.me/9779806628221?text=I%20wanna%20know%20more%20about%20this%20product%3A%0A%0A*Name%3A*%20Industrial%20Magnetic%20Contactor%0A*Category%3A*%20Industrial%20Components%0A*Link%3A*%20https%3A%2F%2Felectromech.com%2Fproducts%2Findustrial-magnetic-contactor
    - generic [ref=e172]:
      - generic [ref=e173]:
        - paragraph [ref=e174]: What We Offer
        - heading "Our Services" [level=2] [ref=e175]
        - paragraph [ref=e176]: End-to-end support from expert consultation to post-installation assistance.
      - generic [ref=e177]:
        - generic [ref=e178]:
          - heading "Expert Consultation" [level=3] [ref=e182]
          - paragraph [ref=e183]: Our engineering team analyzes your project requirements and provides expert recommendations on the most efficient electrical components.
        - generic [ref=e184]:
          - heading "Product Sourcing" [level=3] [ref=e189]
          - paragraph [ref=e190]: Hard-to-find components? We leverage our global network of manufacturers to source specialized electrical equipment for your needs.
        - generic [ref=e191]:
          - heading "Installation Support" [level=3] [ref=e195]
          - paragraph [ref=e196]: Comprehensive technical documentation and post-installation troubleshooting to ensure seamless integration into your systems.
    - generic [ref=e197]:
      - generic [ref=e198]:
        - paragraph [ref=e199]: Our Promise
        - heading "Why Choose Electromech" [level=2] [ref=e200]
      - generic [ref=e201]:
        - generic [ref=e202]:
          - heading "100% Genuine" [level=3] [ref=e207]
          - paragraph [ref=e208]: Authentic products from authorized distributors
        - generic [ref=e209]:
          - heading "Expert Team" [level=3] [ref=e214]
          - paragraph [ref=e215]: Professional consultation & specification support
        - generic [ref=e216]:
          - heading "Fast Supply" [level=3] [ref=e223]
          - paragraph [ref=e224]: Reliable logistics and prompt delivery
        - generic [ref=e225]:
          - heading "After-Sales Support" [level=3] [ref=e229]
          - paragraph [ref=e230]: Technical assistance whenever you need it
        - generic [ref=e231]:
          - heading "Global Brands" [level=3] [ref=e236]
          - paragraph [ref=e237]: Partnered with world-leading manufacturers
        - generic [ref=e238]:
          - heading "Proven Track Record" [level=3] [ref=e242]
          - paragraph [ref=e243]: Years of excellence in electrical solutions
    - generic [ref=e246]:
      - generic [ref=e247]:
        - paragraph [ref=e248]: About Us
        - heading "Electromech Switchgears Traders" [level=2] [ref=e249]
        - paragraph [ref=e250]: Founded on the principles of engineering excellence and customer trust, Electromech Switchgears Traders has established itself as a leading supplier of industrial electrical equipment in Nepal.
        - paragraph [ref=e251]: Our mission is to empower industries by providing the most reliable, efficient, and technologically advanced electrical solutions — ensuring uninterrupted operations and uncompromised safety.
        - generic [ref=e252]:
          - generic [ref=e253]: Pokhara Based
          - generic [ref=e256]: Pan-Nepal Service
      - img "Electromech Engineering Team" [ref=e261]
    - generic [ref=e262]:
      - generic [ref=e263]:
        - paragraph [ref=e264]: Authorized Dealer
        - heading "Brands We Carry" [level=2] [ref=e265]
      - generic [ref=e266]:
        - generic [ref=e267]: Schneider
        - generic [ref=e269]: Siemens
        - generic [ref=e271]: Legrand
        - generic [ref=e273]: ABB
        - generic [ref=e275]: Eaton
        - generic [ref=e277]: Philips
    - generic [ref=e282]:
      - heading "Need help selecting the right electrical products?" [level=2] [ref=e283]
      - paragraph [ref=e284]: Our technical experts are ready to assist you with specifications, availability, and competitive pricing.
      - generic [ref=e285]:
        - button "Request a Quotation" [ref=e286]
        - link "Contact Us" [ref=e289] [cursor=pointer]:
          - /url: /contact
    - generic [ref=e290]:
      - generic [ref=e291]:
        - paragraph [ref=e292]: Reach Out
        - heading "Get in Touch" [level=2] [ref=e293]
      - generic [ref=e294]:
        - generic [ref=e295]:
          - heading "Contact Information" [level=3] [ref=e296]
          - generic [ref=e297]:
            - generic [ref=e303]:
              - paragraph [ref=e304]: Address
              - paragraph [ref=e305]: Pokhara, Nepal
            - generic [ref=e310]:
              - paragraph [ref=e311]: Phone
              - paragraph [ref=e312]: +977 9806628221
            - generic [ref=e318]:
              - paragraph [ref=e319]: Email
              - paragraph [ref=e320]: switchgears.electromech@gmail.com
            - separator [ref=e321]
            - generic [ref=e327]:
              - paragraph [ref=e328]: Business Hours
              - paragraph [ref=e329]: 10am – 5pm (Closed on Saturday)
        - iframe [ref=e331]
  - contentinfo [ref=e332]:
    - generic [ref=e333]:
      - generic [ref=e334]:
        - generic [ref=e335]:
          - heading "Support" [level=3] [ref=e336]
          - list [ref=e337]:
            - listitem [ref=e338]:
              - link "Help Center" [ref=e339] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e340]:
              - link "Product Sourcing" [ref=e341] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e342]:
              - link "Technical Assistance" [ref=e343] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e344]:
              - link "Contact Us" [ref=e345] [cursor=pointer]:
                - /url: /contact
        - generic [ref=e346]:
          - heading "Products" [level=3] [ref=e347]
          - list [ref=e348]:
            - listitem [ref=e349]:
              - link "Switchgears" [ref=e350] [cursor=pointer]:
                - /url: /products?category=Switchgears
            - listitem [ref=e351]:
              - link "Circuit Breakers" [ref=e352] [cursor=pointer]:
                - /url: /products?category=Circuit%20Breakers
            - listitem [ref=e353]:
              - link "Industrial Cables" [ref=e354] [cursor=pointer]:
                - /url: /products?category=Cables
            - listitem [ref=e355]:
              - link "Lighting Solutions" [ref=e356] [cursor=pointer]:
                - /url: /products?category=Lighting
        - generic [ref=e357]:
          - heading "Electromech Switchgears Traders" [level=3] [ref=e358]
          - list [ref=e359]:
            - listitem [ref=e360]:
              - link "About Us" [ref=e361] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e362]:
              - link "Our Services" [ref=e363] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e364]:
              - link "Careers" [ref=e365] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e366]:
              - link "Investors" [ref=e367] [cursor=pointer]:
                - /url: "#"
      - generic [ref=e369]:
        - generic [ref=e370]: © 2026 Electromech Switchgears Traders.
        - link "Terms" [ref=e371] [cursor=pointer]:
          - /url: "#"
        - link "Privacy" [ref=e372] [cursor=pointer]:
          - /url: "#"
        - generic [ref=e373]:
          - text: Developed by
          - link "ProvixTech" [ref=e374] [cursor=pointer]:
            - /url: https://provix-tech.vercel.app/
  - navigation [ref=e375]:
    - generic [ref=e376]:
      - link "Home" [ref=e377] [cursor=pointer]:
        - /url: /
      - link "Products" [ref=e382] [cursor=pointer]:
        - /url: /products
      - button "Inquiry" [ref=e388]
      - link "Contact" [ref=e392] [cursor=pointer]:
        - /url: /contact
  - generic [ref=e400]:
    - button [ref=e401]
    - button [ref=e407]
    - button [ref=e411]
    - button [ref=e419]
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