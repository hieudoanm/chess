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

test('loads tournament detail', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await expect(page).toHaveURL(new RegExp(`tournament.*id=${TOURNAMENT_ID}`));
});

test('displays tournament name', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await expect(page.locator('h1').first()).toBeVisible();
});

test('has tab bar', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await expect(page.locator('button:has-text("Overview")')).toBeVisible();
  await expect(page.locator('button:has-text("Bracket")')).toBeVisible();
  await expect(page.locator('button:has-text("Standings")')).toBeVisible();
  await expect(page.locator('button:has-text("Matches")')).toBeVisible();
  await expect(page.locator('button:has-text("Participants")')).toBeVisible();
});

test('overview tab shows description', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await page.locator('button:has-text("Overview")').click();
  await expect(page.locator('text=Format').first()).toBeVisible();
});

test('can switch to bracket tab', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await page.locator('button:has-text("Bracket")').click();
});

test('can switch to standings tab', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await page.locator('button:has-text("Standings")').click();
});

test('can switch to matches tab', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await page.locator('button:has-text("Matches")').click();
});

test('can switch to participants tab', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await page.locator('button:has-text("Participants")').click();
});

test('has delete button', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await page.locator('button:has-text("Overview")').click();
  await expect(
    page.locator('button:has-text("Delete Tournament")')
  ).toBeVisible();
});

test('delete opens confirmation modal', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await page.locator('button:has-text("Overview")').click();
  await page.locator('button:has-text("Delete Tournament")').click();
  await expect(page.locator('text=Delete Tournament?')).toBeVisible();
});

test('can cancel delete', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await page.locator('button:has-text("Overview")').click();
  await page.locator('button:has-text("Delete Tournament")').click();
  await page.locator('button:has-text("Cancel")').click();
  await expect(page.locator('text=Delete Tournament?')).not.toBeVisible();
});

test('has status badge', async ({ page }) => {
  await page.goto(`/tournament?id=${TOURNAMENT_ID}`);
  await expect(page.locator('.badge').first()).toBeVisible();
});
