import { test, expect } from '@playwright/test';
import path from 'path';

const TOURNAMENT_ID = 'se-001';

test.afterEach(async ({ page }, testInfo) => {
  const screenshotPath = path.join(
    __dirname,
    'images',
    `${testInfo.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.png`
  );
  await page.screenshot({ path: screenshotPath, fullPage: true });
});

test('loads bracket page', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await page.locator('button:has-text("Bracket")').click();
  await expect(page.locator('text=Bracket').first()).toBeVisible();
});

test('has back link', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await page.locator('button:has-text("Bracket")').click();
  await expect(page.locator('a:has-text("Back")')).toBeVisible();
});
