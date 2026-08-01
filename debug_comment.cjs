const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  // Set fake auth cookie
  await page.setCookie({ name: 'auth_token', value: 'fake_token', domain: 'localhost' });
  
  await page.goto('http://localhost:4321/p/hi-this-is-just-test', { waitUntil: 'networkidle0' });

  // Type comment
  await page.type('#comment-content', 'This is a test comment from puppeteer!');
  
  // Intercept the API request to see what it returns
  page.on('response', async (response) => {
    if (response.url().includes('api/comments')) {
      console.log('API Response:', response.url(), await response.json());
    }
  });

  // Click submit
  await page.click('#comment-submit');
  
  // Wait a bit for DOM to update
  await new Promise(r => setTimeout(r, 2000));
  
  // Check if comment exists in DOM
  const commentCount = await page.evaluate(() => {
    return document.querySelectorAll('.comment-item').length;
  });
  
  console.log('Comment count in DOM:', commentCount);
  
  const commentText = await page.evaluate(() => {
    const el = document.querySelector('.comment-item .comment-body');
    return el ? el.textContent : null;
  });
  
  console.log('First comment text:', commentText);

  await browser.close();
})();
