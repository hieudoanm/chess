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

test('loads participants page', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await page.locator('button:has-text("Participants")').click();
  await expect(page.locator('text=Participants').first()).toBeVisible();
});

test('has add participant input', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await page.locator('button:has-text("Participants")').click();
  await expect(page.locator('input[placeholder*="Participant"]')).toBeVisible();
});

test('has Add button', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await page.locator('button:has-text("Participants")').click();
  await expect(
    page.getByRole('button', { name: 'Add', exact: true })
  ).toBeVisible();
});

test('has Batch Add button', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await page.locator('button:has-text("Participants")').click();
  await expect(page.locator('button:has-text("Batch Add")')).toBeVisible();
});

test('can add a participant', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await page.locator('button:has-text("Participants")').click();
  await page.locator('input[placeholder*="Participant"]').fill('New Player');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
});

test('batch add shows textarea', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await page.locator('button:has-text("Participants")').click();
  await page.locator('button:has-text("Batch Add")').click();
  await expect(page.locator('textarea')).toBeVisible();
});

test('has back link', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await page.locator('button:has-text("Participants")').click();
  await expect(page.locator('a:has-text("Back")')).toBeVisible();
});
