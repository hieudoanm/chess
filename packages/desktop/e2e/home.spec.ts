import { test, expect } from '@playwright/test';
import path from 'path';

test('loads dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByPlaceholder(/Search tournaments/)).toBeVisible();
});

test('captures marketing screenshot (1280x720)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await expect(page.getByPlaceholder(/Search tournaments/)).toBeVisible();
  await page.screenshot({
    path: path.join(__dirname, 'screenshots', 'home.png'),
  });
});
