const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4321/p/hi-this-is-just-test', { waitUntil: 'networkidle0' });

  const info = await page.evaluate(() => {
    const comments = document.querySelector('.comments-section');
    const article = document.querySelector('.post-container');
    const main = document.querySelector('.main-content');
    return {
      commentsParentId: comments.parentElement.className,
      articleContainsComments: article.contains(comments),
      mainContainsComments: main.contains(comments)
    };
  });
  console.log(info);
  await browser.close();
})();
