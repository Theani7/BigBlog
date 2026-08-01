const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:4321/p/hi-this-is-just-test', { waitUntil: 'networkidle0' });
  const getRect = async (sel) => await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return { y: r.y, height: r.height, pos: style.position, float: style.float, d: style.display, h: style.height };
  }, sel);
  console.log("main:", await getRect('main'));
  console.log("read-layout:", await getRect('.read-layout'));
  console.log("sidebar:", await getRect('.sidebar'));
  console.log("post-container:", await getRect('.post-container'));
  console.log("post-content:", await getRect('.post-content'));
  console.log("comments-section:", await getRect('.comments-section'));
  console.log("footer:", await getRect('.site-footer'));
  await browser.close();
})();
