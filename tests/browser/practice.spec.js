import { test, expect } from '@playwright/test';

test('商品名とカテゴリーで検索し、再読み込み後もURLから条件を復元する', async ({ page }) => {
  await page.goto('./practice.html');
  await page.getByRole('link', { name: /商品一覧の検索・絞り込み/ }).click();
  const stage = page.locator('#practice-stage');
  const query = stage.getByRole('searchbox', { name: '商品名' });
  const category = stage.getByRole('combobox', { name: 'カテゴリー' });
  await expect(stage.getByRole('status')).toHaveText('4件の商品');
  await query.fill('ノート');
  await category.selectOption('paper');
  await expect(stage.getByRole('status')).toHaveText('2件の商品');
  await expect(page.getByRole('button', { name: 'カテゴリー選択' })).toHaveAttribute('aria-pressed', 'true');

  await page.reload();
  await expect(query).toHaveValue('ノート');
  await expect(category).toHaveValue('paper');
  await expect(stage.getByRole('status')).toHaveText('2件の商品');
  await category.selectOption('pens');
  await expect(stage.getByRole('status')).toHaveText('0件の商品');
  await expect(page.locator('#product-empty')).toBeVisible();
  await stage.getByRole('button', { name: '絞り込みを解除' }).click();
  await expect(query).toBeFocused();
  await expect(stage.getByRole('status')).toHaveText('4件の商品');
  expect(new URL(page.url()).search).toBe('?demo=search');

  await page.getByRole('button', { name: '件数と商品リスト' }).click();
  const inspector = page.locator('#practice-inspector');
  await expect(inspector.getByRole('heading', { level: 3 })).toHaveText('件数と商品リスト');
  await expect(inspector.locator('pre')).toContainText('<li hidden>');
  await expect(page.locator('.practice-results')).toHaveClass(/practice-selected/);
  await inspector.getByRole('link', { name: '図鑑カードで詳しく見る' }).click();
  await expect(page.locator('#playground-title')).toHaveText('hidden');
});

test('削除確認は取消とEscで閉じられ、削除と復元後は次の操作にフォーカスが移る', async ({ page }) => {
  await page.goto('./practice.html?demo=dialog');
  const open = page.getByRole('button', { name: '削除…' });
  const dialog = page.getByRole('dialog', { name: '下書きを削除しますか？' });
  await open.click();
  await expect(dialog.getByRole('button', { name: '取り消す' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(open).toBeFocused();

  await open.click();
  await dialog.getByRole('button', { name: '取り消す' }).click();
  await expect(open).toBeFocused();

  await open.click();
  await dialog.getByRole('button', { name: '削除する' }).click();
  const restore = page.getByRole('button', { name: '下書きを復元' });
  await expect(restore).toBeFocused();
  await expect(page.locator('#article-draft')).toBeHidden();
  await expect(page.getByRole('status')).toHaveText('下書きを削除しました。');
  await restore.click();
  await expect(open).toBeFocused();
  await expect(page.locator('#article-draft')).toBeVisible();
});

test('FAQで回答を一つずつ開く設定と複数を開ける設定を切り替える', async ({ page }) => {
  await page.goto('./practice.html?demo=faq');
  const answers = page.locator('.practice-faq-list details');
  await expect(answers.nth(0)).toHaveJSProperty('open', true);
  await answers.nth(1).locator('summary').press('Enter');
  await expect(answers.nth(0)).toHaveJSProperty('open', false);
  await expect(answers.nth(1)).toHaveJSProperty('open', true);
  await expect(page.locator('#practice-part-title')).toHaveText('質問の見出し');

  const exclusive = page.getByRole('checkbox', { name: '回答を一つずつ開く' });
  await exclusive.uncheck();
  await answers.nth(2).locator('summary').click();
  await expect(page.locator('.practice-faq-list details[open]')).toHaveCount(2);
  await exclusive.check();
  await expect(page.locator('.practice-faq-list details[open]')).toHaveCount(1);
  await expect(answers.nth(1)).toHaveJSProperty('open', true);
});

test('プレビュー幅に合わせて記事が1列・2列・3列に変わる', async ({ page }) => {
  await page.goto('./practice.html?demo=layout');
  const status = page.getByRole('status');
  await expect(status).toHaveText('表示幅 260px・1列');
  await page.getByRole('button', { name: '440px' }).click();
  await expect(status).toHaveText('表示幅 440px・2列');
  await page.getByRole('button', { name: '620px' }).click();
  await expect(status).toHaveText('表示幅 620px・3列');
  await expect(page.locator('.practice-articles article')).toHaveCount(3);
  const widths = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  expect(widths[0]).toBe(widths[1]);

  await page.getByRole('link', { name: 'パーツ一覧へ' }).click();
  await page.getByRole('button', { name: '列が変わるグリッド' }).click();
  await expect(page.locator('#practice-part-code')).toContainText('repeat(auto-fit, minmax(');
});

test('チェック項目の変更とリセットが進捗バーに反映される', async ({ page }) => {
  await page.goto('./practice.html?demo=progress');
  const progress = page.getByRole('progressbar', { name: '公開準備の進捗' });
  await expect(progress).toHaveJSProperty('value', 0);
  const checks = page.getByRole('group', { name: '公開前の確認' }).getByRole('checkbox');
  for (const check of await checks.all()) await check.check();
  await expect(progress).toHaveJSProperty('value', 3);
  await expect(page.getByRole('status')).toHaveText('3件中3件が完了');
  await expect(page.locator('#practice-part-title')).toHaveText('チェックボックス');
  await page.getByRole('button', { name: 'チェックをリセット' }).click();
  await expect(progress).toHaveJSProperty('value', 0);
  await expect(page.getByRole('status')).toHaveText('3件中0件が完了');
  await expect(page.locator('.practice-task-group :checked')).toHaveCount(0);
});
