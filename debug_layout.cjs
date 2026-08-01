const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:4321/p/hi-this-is-just-test', { waitUntil: 'networkidle2' });

  const getRect = async (selector) => {
    return await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, display: window.getComputedStyle(el).display, visibility: window.getComputedStyle(el).visibility };
    }, selector);
  };

  console.log("main:", await getRect('main'));
  console.log(".read-layout:", await getRect('.read-layout'));
  console.log(".post-container:", await getRect('.post-container'));
  console.log(".post-content:", await getRect('.post-content'));
  console.log(".comments-section:", await getRect('.comments-section'));
  console.log(".site-footer:", await getRect('.site-footer'));
  
  await browser.close();
})();
