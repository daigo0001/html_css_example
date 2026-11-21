import { test, expect } from '@playwright/test';

test('図鑑からリリースノートを開き、登録日・更新内容・バージョン・コミットを確認できる', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: /リリースノート/ }).click();
  await expect(page).toHaveURL(/\/html_css_example\/release-notes\.html$/);
  await expect(page.getByRole('heading', { name: 'リリースノート' })).toBeVisible();

  const commit = 'f541e4869a4a1d98c72d1a3d4b1bd03bf8cb2959';
  const link = page.getByRole('link', { name: commit, exact: true });
  const entry = page.locator('.release-entry').filter({ has: link });
  await expect(entry.locator('[data-version]')).toHaveText('v1.2.0');
  await expect(entry.locator('[data-date]')).toHaveText('2026年11月20日');
  await expect(entry.locator('[data-date]')).toHaveAttribute('datetime', '2026-11-19T20:56:57Z');
  await expect(entry.locator('[data-changes]')).toContainText('ブラウザー標準の入力検証');
  await expect(link).toHaveAttribute('href', `https://github.com/daigo0001/html_css_example/commit/${commit}`);
  await expect(page.locator('.release-entry').last().locator('[data-version]')).toHaveText('v1.0.0');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize().width);

  await page.getByRole('link', { name: 'カード図鑑に戻る' }).click();
  await expect(page.getByRole('heading', { name: 'すべてのカード' })).toBeVisible();
});
