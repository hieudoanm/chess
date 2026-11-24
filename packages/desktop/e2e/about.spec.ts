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

test('loads about page', async ({ page }) => {
  await page.goto('/about');
  await expect(page.locator('text=About').first()).toBeVisible();
});

test('displays app name', async ({ page }) => {
  await page.goto('/about');
  await expect(page.locator('h1:has-text("Chess")')).toBeVisible();
});

test('displays app description', async ({ page }) => {
  await page.goto('/about');
  await expect(page.locator('text=Tournament management')).toBeVisible();
});

test('displays version', async ({ page }) => {
  await page.goto('/about');
  await expect(
    page.getByText(/\d{4}\.\d{2}\.\d{2}\.\d{2}\.\d{2}\.\d{2}/)
  ).toBeVisible();
});

test('displays tech stack', async ({ page }) => {
  await page.goto('/about');
  await expect(page.locator('text=Framework')).toBeVisible();
  await expect(page.locator('text=Next.js')).toBeVisible();
});

test('displays Stable badge', async ({ page }) => {
  await page.goto('/about');
  await expect(page.locator('.badge:has-text("Stable")')).toBeVisible();
});
