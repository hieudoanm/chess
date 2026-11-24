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

test('loads settings page', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
});

test('has language dropdown', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.locator('text=Language').first()).toBeVisible();
  await expect(page.locator('select').first()).toBeVisible();
});

test('has theme dropdown', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.locator('text=Theme').first()).toBeVisible();
});

test('has date format dropdown', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.locator('text=Date/Time Format').first()).toBeVisible();
});

test('has timezone dropdown', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.locator('text=Timezone').first()).toBeVisible();
});

test('has default format dropdown', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.locator('text=Default Format')).toBeVisible();
});

test('has default max participants dropdown', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.locator('text=Default Max')).toBeVisible();
});

test('has auto-save toggle', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.locator('text=Auto-save')).toBeVisible();
  await expect(page.locator('input[type="checkbox"]')).toBeVisible();
});

test('can change language', async ({ page }) => {
  await page.goto('/settings');
  await page.locator('select').first().selectOption('vi');
});

test('can change theme', async ({ page }) => {
  await page.goto('/settings');
  await page.locator('select').nth(1).selectOption('light');
});

test('can toggle auto-save', async ({ page }) => {
  await page.goto('/settings');
  await page.locator('input[type="checkbox"]').click();
  await page.locator('input[type="checkbox"]').click();
});
