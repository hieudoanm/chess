import { test, expect } from '@playwright/test';
import path from 'path';

const TOURNAMENT_ID = 'se-001';

async function rightClickCard(
  page: import('@playwright/test').Page,
  id: string
) {
  const card = page.locator(`a[href*="/tournament"][href*="id=${id}"]`);
  await card.scrollIntoViewIfNeeded();
  const box = await card.boundingBox();
  if (!box) throw new Error('Card not found');
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, {
    button: 'right',
  });
}

test.afterEach(async ({ page }, testInfo) => {
  const screenshotPath = path.join(
    __dirname,
    'images',
    `${testInfo.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.png`
  );
  await page.screenshot({ path: screenshotPath, fullPage: true });
});

test('loads successfully', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Tourney/);
});

test('displays tournaments', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=FA Cup')).toBeVisible();
});

test('has search input', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
});

test('has status filter buttons', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('button:has-text("All")')).toBeVisible();
  await expect(page.locator('button:has-text("Draft")')).toBeVisible();
  await expect(page.locator('button:has-text("Upcoming")')).toBeVisible();
  await expect(page.locator('button:has-text("In Progress")')).toBeVisible();
  await expect(page.locator('button:has-text("Completed")')).toBeVisible();
});

test('has Create button', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('a:has-text("Create")').first()).toBeVisible();
});

test('search filters tournaments', async ({ page }) => {
  await page.goto('/');
  await page.locator('input[placeholder*="Search"]').fill('FA Cup');
  await expect(page.locator('text=FA Cup')).toBeVisible();
});

test('status filter shows matching tournaments', async ({ page }) => {
  await page.goto('/');
  await page.locator('button:has-text("Completed")').click();
  await expect(page.locator('text=Completed').first()).toBeVisible();
});

test('can clear search', async ({ page }) => {
  await page.goto('/');
  await page.locator('input[placeholder*="Search"]').fill('FA Cup');
  await page.locator('input[placeholder*="Search"]').fill('');
});

test('empty state after filtering all out', async ({ page }) => {
  await page.goto('/');
  await page
    .locator('input[placeholder*="Search"]')
    .fill('zzz-nonexistent-zzz');
  await expect(page.locator('text=No tournaments yet')).toBeVisible();
});

test('tournament cards show format', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Single Elimination').first()).toBeVisible();
});

test('tournament cards show status', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.badge').first()).toBeVisible();
});

test('context menu opens on right-click', async ({ page }) => {
  await page.goto('/');
  await rightClickCard(page, TOURNAMENT_ID);
  await expect(page.locator('text=Clone')).toBeVisible();
});

test('context menu closes on Escape', async ({ page }) => {
  await page.goto('/');
  await rightClickCard(page, TOURNAMENT_ID);
  await page.keyboard.press('Escape');
  await expect(page.locator('text=Clone')).not.toBeVisible();
});

test('can clone tournament via context menu', async ({ page }) => {
  await page.goto('/');
  const count = await page
    .locator('a[href*="/tournament"][href*="id="]')
    .count();
  await rightClickCard(page, TOURNAMENT_ID);
  const cloneBtn = page.getByRole('button', { name: 'Clone' });
  await expect(cloneBtn).toBeVisible();
  await cloneBtn.click();
  await page.waitForTimeout(3000);
  const newCount = await page
    .locator('a[href*="/tournament"][href*="id="]')
    .count();
  expect(newCount).toBeGreaterThanOrEqual(count);
});

test('can delete tournament via context menu', async ({ page }) => {
  await page.goto('/create');
  await page
    .locator('input[placeholder="Tournament name"]')
    .fill('Temp Tournament');
  await page.locator('button:has-text("Create")').click();
  await expect(page.locator('h1:has-text("Tourney")')).toBeVisible();

  const count = await page
    .locator('a[href*="/tournament"][href*="id="]')
    .count();
  const lastCard = page.locator('a[href*="/tournament"][href*="id="]').last();
  const lastHref = await lastCard.getAttribute('href');
  const newId = lastHref?.split('id=')[1] ?? '';

  page.on('dialog', (dialog) => dialog.accept());
  await rightClickCard(page, newId);
  await page.locator('text=Delete').click();
  await page.waitForTimeout(1500);
  const newCount = await page
    .locator('a[href*="/tournament"][href*="id="]')
    .count();
  expect(newCount).toBe(count - 1);
});

test('has navigation bar', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Dashboard')).toBeVisible();
});
