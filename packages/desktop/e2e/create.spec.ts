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

test('loads create page', async ({ page }) => {
  await page.goto('/create');
  await expect(page.locator('h1:has-text("Create Tournament")')).toBeVisible();
});

test('has name input', async ({ page }) => {
  await page.goto('/create');
  await expect(
    page.locator('input[placeholder="Tournament name"]')
  ).toBeVisible();
});

test('has description textarea', async ({ page }) => {
  await page.goto('/create');
  await expect(
    page.locator('textarea[placeholder*="description"]')
  ).toBeVisible();
});

test('has format selector', async ({ page }) => {
  await page.goto('/create');
  await expect(page.locator('text=Single Elimination').first()).toBeVisible();
  await expect(page.locator('text=Round Robin').first()).toBeVisible();
  await expect(page.locator('text=Swiss System').first()).toBeVisible();
});

test('has max participants buttons', async ({ page }) => {
  await page.goto('/create');
  await expect(page.locator('button:has-text("4")').first()).toBeVisible();
  await expect(page.locator('button:has-text("8")').first()).toBeVisible();
  await expect(page.locator('button:has-text("16")').first()).toBeVisible();
  await expect(page.locator('button:has-text("32")').first()).toBeVisible();
  await expect(page.locator('button:has-text("64")').first()).toBeVisible();
});

test('has start date input', async ({ page }) => {
  await page.goto('/create');
  await expect(page.locator('input[type="date"]')).toBeVisible();
});

test('has Cancel button', async ({ page }) => {
  await page.goto('/create');
  await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
});

test('has Create button', async ({ page }) => {
  await page.goto('/create');
  await expect(page.locator('button:has-text("Create")')).toBeVisible();
});

test('can fill tournament name', async ({ page }) => {
  await page.goto('/create');
  await page
    .locator('input[placeholder="Tournament name"]')
    .fill('My Tournament');
  await expect(
    page.locator('input[placeholder="Tournament name"]')
  ).toHaveValue('My Tournament');
});

test('can fill description', async ({ page }) => {
  await page.goto('/create');
  await page
    .locator('textarea[placeholder*="description"]')
    .fill('Test description');
});

test('can select format', async ({ page }) => {
  await page.goto('/create');
  await page.locator('text=Round Robin').click();
});

test('can select max participants', async ({ page }) => {
  await page.goto('/create');
  await page.locator('button:has-text("16")').click();
});

test('can create tournament', async ({ page }) => {
  await page.goto('/create');
  await page
    .locator('input[placeholder="Tournament name"]')
    .fill('Test Tournament');
  await page.locator('button:has-text("Create")').click();
  await expect(page.locator('h1:has-text("Tourney")')).toBeVisible();
});

test('cancel navigates back', async ({ page }) => {
  await page.goto('/');
  await page.goto('/create');
  await page.locator('button:has-text("Cancel")').click();
  await expect(page.locator('h1:has-text("Tourney")')).toBeVisible();
});
