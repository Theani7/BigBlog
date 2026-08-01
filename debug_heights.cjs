const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:4321/p/hi-this-is-just-test', { waitUntil: 'networkidle0' });

  const getStyle = async (selector) => {
    return await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      return el.getBoundingClientRect().height;
    }, selector);
  };
  
  console.log("read-layout:", await getStyle('.read-layout'));
  console.log("sidebar:", await getStyle('.sidebar'));
  console.log("post-container:", await getStyle('.post-container'));
  console.log("post-content:", await getStyle('.post-content'));
  console.log("comments-section:", await getStyle('.comments-section'));
  
  await browser.close();
})();
