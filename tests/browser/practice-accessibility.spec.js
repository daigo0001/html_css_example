import { test, expect } from '@playwright/test';

test('アクセシビリティ確認でモーダル内のTab順と、閉じた後のフォーカスを追える', async ({ page }) => {
  await page.goto('./practice.html?demo=dialog');
  const toggle = page.getByRole('button', { name: 'アクセシビリティ確認' });
  const panel = page.getByRole('region', { name: 'アクセシビリティ確認' });
  const order = page.locator('#demo-a11y-order strong');
  const current = page.locator('#demo-a11y-current');
  const open = page.getByRole('button', { name: '削除…' });

  await toggle.click();
  await expect(panel).toBeVisible();
  await expect(order).toHaveText(['削除…']);
  await panel.getByRole('button', { name: '最初のパーツへ移動' }).click();
  await expect(open).toBeFocused();
  await expect(current).toHaveText('削除…');
  await expect(open).toHaveAttribute('data-a11y-current', '');

  await open.press('Enter');
  const dialog = page.getByRole('dialog', { name: '下書きを削除しますか？' });
  await expect(dialog.getByRole('button', { name: '取り消す' })).toBeFocused();
  await expect(order).toHaveText(['取り消す', '削除する']);
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: '削除する' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(open).toBeFocused();
  await expect(order).toHaveText(['削除…']);
  await expect(page.locator('#demo-a11y-history strong')).toHaveText(['削除…', '削除する', '取り消す', '削除…']);

  await panel.getByRole('button', { name: '閉じる' }).click();
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(open).not.toHaveAttribute('data-a11y-current');
});

test('問い合わせフォームのラベルと変更されたボタン名を実際のTab移動で確認できる', async ({ page }) => {
  await page.goto('./form-demo.html');
  const toggle = page.getByRole('button', { name: 'アクセシビリティ確認' });
  const order = page.locator('#demo-a11y-order strong');
  const panel = page.getByRole('region', { name: 'アクセシビリティ確認' });
  await toggle.click();
  await expect(order.nth(0)).toHaveText('お名前の解説を表示');
  await expect(order.nth(1)).toHaveText('お名前 必須');
  const inspectorInForm = await page.locator('#demo-inspector').evaluate(node => Boolean(node.closest('form')));
  const stopCount = inspectorInForm ? 9 : 8;
  await expect(order).toHaveCount(stopCount);
  await panel.getByRole('button', { name: '最初のパーツへ移動' }).click();
  await expect(page.locator('#demo-a11y-source')).toContainText('aria-label');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('お名前 必須', { exact: true })).toBeFocused();
  await expect(page.locator('#demo-a11y-current')).toHaveText('お名前 必須');
  await expect(page.locator('#demo-a11y-source')).toHaveText('input[type=text] · label');
  await expect(order).toHaveCount(stopCount);

  await page.getByRole('button', { name: '入力検証', exact: true }).click();
  await expect(order.nth(0)).toHaveText('お名前の検証状態を表示');
});

test('タブの切り替え後にアクティブなタブとパネルだけがTab順に入る', async ({ page }) => {
  await page.goto('./practice.html?demo=tabs');
  await page.getByRole('button', { name: 'アクセシビリティ確認' }).click();
  const order = page.locator('#demo-a11y-order strong');
  await expect(order).toHaveText(['概要', '概要']);
  await page.getByRole('tab', { name: '概要' }).press('End');
  await expect(page.getByRole('tab', { name: '設定' })).toBeFocused();
  await expect(order).toHaveText(['設定', '設定', '更新情報を画面で受け取る']);
});
