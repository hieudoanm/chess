import { test, expect } from '@playwright/test';
import path from 'path';

test.afterEach(async ({ page }, testInfo) => {
  const screenshotPath = path.join(
    __dirname,
    'images',
    `${testInfo.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.png`
  );
  await page.screenshot({ path: screenshotPath, fullPage: true });
});

test('loads profile page', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.locator('h1:has-text("Profile")')).toBeVisible();
});

test('displays account form', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.locator('text=Manage your account details')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Full name' })).toBeVisible();
});

test('has save button', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.locator('button:has-text("Save changes")')).toBeVisible();
});

test('has sign out link', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.locator('a:has-text("Sign out")')).toBeVisible();
});

test('has version link', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.locator('a:has-text("Version")').first()).toBeVisible();
});
