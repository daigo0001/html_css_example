import { test, expect } from '@playwright/test';
import { cards } from '../../assets/catalog.js';

async function open(page, id) {
  await page.goto(id ? `./?item=${id}` : './');
  await expect(page.locator('#cards')).toHaveAttribute('aria-busy', 'false');
  if (id) await expect(page.locator('#live-preview')).toHaveAttribute('aria-busy', 'false');
  return page.frameLocator('#live-preview');
}

test('ホームは検索と一覧から始まり、CSSの基本をカテゴリーで探せる', async ({ page }) => {
  await open(page);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('すべてのカード');
  await expect(page.locator('.hero, .learning-note')).toHaveCount(0);
  const search = await page.locator('#search').boundingBox();
  const card = await page.locator('.card').first().boundingBox();
  expect(search.y).toBeLessThan(240);
  expect(card.y).toBeLessThan(page.viewportSize().height);
  if (await page.locator('#menu-toggle').isVisible()) await page.locator('#menu-toggle').click();
  await page.locator('[data-category="foundations"]').click();
  await expect(page.locator('#library-title')).toContainText('CSSの基本・条件');
  await expect(page.locator('#result-count')).toContainText(String(cards.filter(card => card.category === 'foundations').length));
  await page.locator('#search').fill('キーボード');
  await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('キーボード');
  await expect(page.locator('[data-card="css-focus-visible"]')).toBeVisible();
  await page.reload();
  await expect(page.locator('#search')).toHaveValue('キーボード');
  await expect(page.locator('#library-title')).toContainText('CSSの基本・条件');
});

test('メディアクエリーはプレビュー幅に応じて3列と1列を切り替える', async ({ page }) => {
  const frame = await open(page, 'css-media');
  await page.locator('#preview-width').selectOption('320px');
  await expect.poll(async () => (await frame.locator('.boxes').evaluate(el => getComputedStyle(el).gridTemplateColumns)).split(' ').length).toBe(3);
  await page.locator('#preview-width').selectOption('240px');
  await expect.poll(async () => (await frame.locator('.boxes').evaluate(el => getComputedStyle(el).gridTemplateColumns)).split(' ').length).toBe(1);
  await page.locator('#code-editor').fill('.boxes { display: grid; grid-template-columns: 1fr 1fr; }');
  await expect.poll(async () => (await frame.locator('.boxes').evaluate(el => getComputedStyle(el).gridTemplateColumns)).split(' ').length).toBe(2);
  await page.locator('#reset-code').click();
  await expect.poll(async () => (await frame.locator('.boxes').evaluate(el => getComputedStyle(el).gridTemplateColumns)).split(' ').length).toBe(1);
});

test('条件付きCSSとカスケードレイヤーの実例を編集して比較できる', async ({ page }) => {
  let frame = await open(page, 'css-supports');
  await expect(frame.locator('.note')).toHaveCSS('display', 'grid');
  const code = await page.locator('#code-editor').inputValue();
  await page.locator('#code-editor').fill(code.replace('(display: grid)', '(display: unknown-layout)'));
  await expect(frame.locator('.note')).toHaveCSS('display', 'block');
  frame = await open(page, 'css-layer');
  await expect(frame.locator('.note')).toHaveCSS('color', 'rgb(71, 109, 48)');
  const layers = await page.locator('#code-editor').inputValue();
  await page.locator('#code-editor').fill(layers.replace('@layer base, components;', '@layer components, base;'));
  await expect(frame.locator('.note')).toHaveCSS('color', 'rgb(161, 92, 57)');
});

test('チェック状態と偶数の行をセレクターで装飾できる', async ({ page }) => {
  let frame = await open(page, 'css-checked');
  await expect(frame.locator('span')).not.toHaveCSS('font-weight', '700');
  await frame.getByRole('checkbox').check();
  await expect(frame.locator('span')).toHaveCSS('font-weight', '700');
  await frame.getByRole('checkbox').uncheck();
  await expect(frame.locator('span')).not.toHaveCSS('font-weight', '700');
  frame = await open(page, 'css-nth-child');
  await expect(frame.locator('li').nth(1)).toHaveCSS('background-color', 'rgb(226, 237, 207)');
  const code = await page.locator('#code-editor').inputValue();
  await page.locator('#code-editor').fill(code.replace('even', 'odd'));
  await expect(frame.locator('li').nth(0)).toHaveCSS('background-color', 'rgb(226, 237, 207)');
  await expect(frame.locator('li').nth(1)).not.toHaveCSS('background-color', 'rgb(226, 237, 207)');
});

test('新しいHTML属性の実例で排他的な開閉・入力・表の結合を確認できる', async ({ page }) => {
  let frame = await open(page, 'html-attr-details-name');
  const details = frame.locator('details');
  await expect(details.nth(0)).toHaveAttribute('open', '');
  await frame.locator('summary').nth(1).click();
  await expect(details.nth(1)).toHaveAttribute('open', '');
  await expect(details.nth(0)).not.toHaveAttribute('open');
  frame = await open(page, 'html-attr-list');
  await frame.getByLabel('学びたいこと').fill('候補にないこと');
  await expect(frame.getByLabel('学びたいこと')).toHaveValue('候補にないこと');
  await expect(frame.locator('datalist option')).toHaveCount(3);
  frame = await open(page, 'html-attr-colspan-rowspan');
  await expect(frame.getByRole('cell', { name: 'お昼休み' })).toHaveJSProperty('colSpan', 2);
  await expect(frame.getByRole('table')).toHaveAccessibleName('ノートの時間割');
});

test('自動グリッドは狭い幅でも内容をはみ出させず、列数を変える', async ({ page }) => {
  const frame = await open(page, 'css-minmax');
  await page.locator('#preview-width').selectOption('320px');
  await expect.poll(async () => (await frame.locator('.boxes').evaluate(el => getComputedStyle(el).gridTemplateColumns)).split(' ').length).toBe(2);
  await page.locator('#preview-width').selectOption('240px');
  await expect.poll(async () => (await frame.locator('.boxes').evaluate(el => getComputedStyle(el).gridTemplateColumns)).split(' ').length).toBe(1);
  expect(await frame.locator('html').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
});
