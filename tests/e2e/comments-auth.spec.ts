import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'debug-login-test@test.dev';
const TEST_PASSWORD = 'Test1234!';

test.beforeAll(async ({ request }) => {
  const signup = await request.post('/api/auth/signup', {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD, name: 'Debug User' },
  });
  if (!signup.ok()) {
    await request.post('/api/auth/login', {
      data: { email: TEST_EMAIL, password: TEST_PASSWORD },
    });
  }
});

test('logged-in user sees comment form, not the sign-in gate', async ({ page }) => {
  const login = await page.request.post('/api/auth/login', {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });
  expect(login.ok()).toBeTruthy();

  await page.goto('/p/the-bif-boovs');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('#comment-form')).toBeVisible();
  await expect(page.locator('#comment-auth-gate')).toBeHidden();
  await expect(page.locator('#comment-as')).toBeVisible();
});

test('anonymous user sees sign-in gate, not the comment form', async ({ page }) => {
  await page.goto('/p/the-bif-boovs');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('#comment-auth-gate')).toBeVisible();
  await expect(page.locator('#comment-form')).toBeHidden();
});

test('empty comment state shows redesigned card with CTA for logged-in users', async ({ page }) => {
  await page.goto('/p/the-bif-boovs');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('.comment-empty')).toBeVisible();
  await expect(page.locator('.comment-empty-title')).toHaveText('No responses yet');

  const login = await page.request.post('/api/auth/login', {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });
  expect(login.ok()).toBeTruthy();
  await page.reload();
  await page.waitForLoadState('networkidle');

  await expect(page.locator('.comment-empty-cta')).toBeVisible();
  await page.locator('.comment-empty-cta').click();
  await expect(page.locator('#comment-content')).toBeFocused();
});
