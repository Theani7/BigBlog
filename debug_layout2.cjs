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
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        id: el.id,
        className: el.className,
        rect: { top: rect.top, bottom: rect.bottom, height: rect.height, left: rect.left, right: rect.right },
        display: style.display,
        position: style.position,
        float: style.float,
        zIndex: style.zIndex,
        marginTop: style.marginTop,
        height: style.height,
        minHeight: style.minHeight,
        overflow: style.overflow,
        html: el.innerHTML.slice(0, 50) + "..."
      };
    }, selector);
  };

  console.log("BODY:", await getStyle('body'));
  console.log("MAIN:", await getStyle('main'));
  console.log("READ-LAYOUT:", await getStyle('.read-layout'));
  console.log("POST-CONTAINER:", await getStyle('.post-container'));
  console.log("COMMENTS-SECTION:", await getStyle('.comments-section'));
  console.log("FOOTER:", await getStyle('footer'));
  
  await browser.close();
})();
