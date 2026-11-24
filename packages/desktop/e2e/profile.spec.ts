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

test('displays stats cards', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.locator('text=Tournaments Created')).toBeVisible();
  await expect(page.locator('text=Matches Tracked')).toBeVisible();
});

test('displays activity list', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.locator('text=Recent Activity')).toBeVisible();
});

test('has settings link', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.locator('a:has-text("Settings")')).toBeVisible();
});

test('has version link', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.locator('a:has-text("Version")')).toBeVisible();
});
