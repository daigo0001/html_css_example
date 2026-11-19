import { test, expect } from '@playwright/test';
import { cards } from '../../assets/catalog.js';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));

async function ready(page, path = './') {
  await page.goto(path);
  await expect(page.locator('#cards')).toHaveAttribute('aria-busy', 'false');
}

async function nav(page, selector) {
  if (await page.locator('#menu-toggle').isVisible()) await page.locator('#menu-toggle').click();
  await page.locator(selector).click();
}

test('サブパスから読み込め、実際のプレビューとページ送りが動く', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await ready(page);
  await expect(page).toHaveTitle(/Web Notes/);
  await expect(page.locator('.card')).toHaveCount(12);
  await expect(page.locator('#result-count')).toContainText(`${cards.length}`);
  const preview = page.frameLocator('[data-preview="html-details"]');
  await expect(preview.locator('details')).toHaveAttribute('open', '');
  await preview.locator('summary').click();
  await expect(preview.locator('details')).not.toHaveAttribute('open');
  await page.locator('#load-more').click();
  await expect(page.locator('.card')).toHaveCount(24);
  expect(errors).toEqual([]);
});

test('検索・種別・カテゴリ・対応状況を組み合わせ、URLから復元できる', async ({ page }) => {
  await ready(page);
  await page.locator('[data-type="css"]').click();
  await page.locator('#search').fill('border-radius');
  await expect(page.locator('.card')).toHaveCount(1);
  await expect(page.locator('.card-title')).toHaveText('border-radius');
  await page.reload();
  await expect(page.locator('#search')).toHaveValue('border-radius');
  await expect(page.locator('[data-type="css"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#clear-filters').click();
  await nav(page, '[data-category="layout"]');
  await expect(page.locator('#library-title')).toContainText('レイアウト');
  await page.locator('#status-filter').selectOption('deprecated');
  await expect(page.locator('.card')).toHaveCount(1);
  await expect(page.locator('.card-title')).toHaveText('<center>');
  await page.locator('#search').fill('存在しない機能123');
  await expect(page.locator('#empty-state')).toBeVisible();
  await page.locator('#empty-reset').click();
  await expect(page.locator('.card')).toHaveCount(12);
});

test('しおりは再読み込み後も残り、コレクションから外せる', async ({ page }) => {
  await ready(page);
  await page.locator('[data-save="html-details"]').click();
  await expect(page.locator('#saved-count')).toHaveText('1');
  await page.reload();
  await expect(page.locator('[data-save="html-details"]')).toHaveAttribute('aria-pressed', 'true');
  await nav(page, '[data-view="saved"]');
  await expect(page.locator('.card')).toHaveCount(1);
  await page.locator('[data-save="html-details"]').click();
  await expect(page.locator('#empty-title')).toHaveText('最初のひとつを、集めよう。');
  await expect(page.locator('#saved-count')).toHaveText('0');
});

test('コード編集がプレビューに反映され、タブ切替・幅変更・リセットが動く', async ({ page }) => {
  await ready(page, './?item=html-details');
  await expect(page.locator('#playground')).toBeVisible();
  await expect(page.locator('#browser-support .browser-cell')).toHaveCount(6);
  await expect(page.locator('#guide-seo')).toContainText('検索');
  await page.locator('#code-editor').fill('<p class="experiment">やってみた！</p>');
  const preview = page.frameLocator('#live-preview');
  await expect(preview.locator('.experiment')).toHaveText('やってみた！');
  await page.getByRole('tab', { name: 'CSS', exact: true }).click();
  await page.locator('#code-editor').fill('.experiment { color: rgb(190, 50, 60); }');
  await expect(preview.locator('.experiment')).toHaveCSS('color', 'rgb(190, 50, 60)');
  await page.locator('#preview-width').selectOption('240px');
  await expect(page.locator('#live-preview')).toHaveCSS('width', '240px');
  await page.locator('#reset-code').click();
  await expect(preview.locator('summary')).toHaveText('このアトリエについて');
  await page.locator('#close-playground').click();
  await expect(page).not.toHaveURL(/item=/);
});

test('公開用リンクとコードをコピーできる', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await ready(page, './?item=css-border-radius');
  await page.locator('#share-card').click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('/html_css_example/?item=css-border-radius');
  await page.locator('#copy-code').click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('border-radius');
});

test('貼り付けたHTMLからスクリプト・外部通信・フォーム送信が発生しない', async ({ page }) => {
  const external = [];
  page.on('request', request => { if (request.url().startsWith('https://example.com')) external.push(request.url()); });
  await ready(page, './?item=html-details');
  await page.locator('#code-editor').fill('<script>parent.document.body.dataset.compromised="yes"</script><meta http-equiv="refresh" content="0;url=https://example.com/escape"><iframe src="https://example.com/frame"></iframe><img src="https://example.com/image" onerror="alert(1)"><a href="https://example.com/link">リンク</a><form action="https://example.com/post"><button>送信</button></form><p id="safe">安全なプレビュー</p>');
  const preview = page.frameLocator('#live-preview');
  await expect(preview.locator('#safe')).toBeVisible();
  await expect(preview.locator('script,meta[http-equiv="refresh"],iframe,img[src]')).toHaveCount(0);
  await expect(preview.locator('a')).not.toHaveAttribute('href');
  await preview.getByRole('button', { name: '送信' }).click();
  expect(await page.locator('body').getAttribute('data-compromised')).toBeNull();
  expect(external).toEqual([]);
  await expect(page).toHaveURL(/item=html-details/);
});

test('キーボードで検索・タブ切替・モーダル終了を操作できる', async ({ page }) => {
  await ready(page);
  await page.keyboard.press('/');
  await expect(page.locator('#search')).toBeFocused();
  const open = page.locator('[data-card="html-details"] .try-button');
  await open.click();
  await page.getByRole('tab', { name: 'HTML', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'CSS', exact: true })).toBeFocused();
  await expect(page.getByRole('tab', { name: 'CSS', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('#playground')).not.toBeVisible();
  await expect(open).toBeFocused();
});

test('カタログを最後まで読み込め、重複や欠落がない', async ({ page }) => {
  // 通常の12枚表示とは異なり、全カードの独立したプレビューを順に開く。
  test.setTimeout(60_000);
  await ready(page);
  while (await page.locator('#load-more').isVisible()) await page.locator('#load-more').click();
  await expect(page.locator('.card')).toHaveCount(cards.length);
  const visibleIds = await page.locator('.card').evaluateAll(nodes => nodes.map(node => node.dataset.card));
  expect(visibleIds.sort()).toEqual(cards.map(card => card.id).sort());
  await expect(page.locator('#load-progress')).toHaveText(`${cards.length} / ${cards.length} cards`);
});

test('並び替え・説明・不正な保存データに対応する', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('web-notes:bookmarks:v1', '{broken json'));
  await ready(page);
  await page.locator('#sort').selectOption('newest');
  await expect(page.locator('.card').first().locator('.status-label')).not.toHaveClass(/deprecated/);
  await page.locator('#about-button').click();
  await expect(page.locator('#compat-methodology')).toContainText('30か月');
  await expect(page.locator('#data-version')).toContainText('MDN');
  await page.locator('#close-about').click();
});

test('画面幅に収まり、メニューとダイアログが表示できる', async ({ page }, testInfo) => {
  await ready(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const menu = page.getByRole('button', { name: 'メニューを開く' });
  if (testInfo.project.name === 'mobile') {
    await menu.focus();
    await menu.press('Enter');
    await expect(page.getByRole('button', { name: 'メニューを閉じる' })).toBeFocused();
    await expect(page.locator('.workspace')).toHaveJSProperty('inert', true);
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();
  }
  await nav(page, '[data-category="forms"]');
  if (testInfo.project.name === 'mobile') {
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#sidebar-shade')).toBeHidden();
  }
  const tryButton = page.locator('.try-button').first();
  expect((await tryButton.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await tryButton.click();
  const bounds = await page.locator('#playground').boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize().width);
  await page.locator('#close-playground').click();
  await page.screenshot({ path: testInfo.outputPath('library.png'), fullPage: true });
});

test('標準のdialogとpopoverをプレビュー内で操作できる', async ({ page }) => {
  await ready(page, './?item=html-dialog');
  const preview = page.frameLocator('#live-preview');
  await expect(preview.locator('dialog')).toBeVisible();
  await preview.getByRole('button', { name: '閉じる', exact: true }).click();
  await expect(preview.locator('dialog')).not.toBeVisible();
  await page.locator('#close-playground').click();
  await ready(page, './?item=html-popover');
  await preview.getByRole('button', { name: 'ヒントを見る' }).click();
  await expect(preview.locator('[popover]')).toBeVisible();
  await expect(preview.locator('[popover]')).toContainText('小さく試す');
});

test('OSのテーマに追従し、手動選択は再読み込みとOS変更の後も優先される', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await ready(page);
  const theme = page.getByRole('switch', { name: 'ダークモード', exact: true });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(theme).toHaveAttribute('aria-checked', 'true');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await theme.click();
  await expect(page.locator('.card').first()).toHaveCSS('background-color', 'rgb(36, 36, 38)');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'dark' });
  await theme.click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(theme).toHaveAttribute('aria-checked', 'false');
  await expect(page.locator('.card').first()).toHaveCSS('background-color', 'rgb(255, 255, 255)');
});

test('テーマ変更後も検索とコード編集が動き、利用者向けリンクとバージョンが整理されている', async ({ page }) => {
  await ready(page);
  await page.locator('#theme-toggle').click();
  await page.locator('#search').fill('border-radius');
  await expect(page.locator('.card')).toHaveCount(1);
  await page.locator('.try-button').click();
  await expect(page.locator('#code-editor')).toHaveCSS('background-color', 'rgb(36, 36, 38)');
  await page.getByRole('tab', { name: 'HTML', exact: true }).click();
  await page.locator('#code-editor').fill('<p>テーマを変えて実験</p>');
  await expect(page.frameLocator('#live-preview').locator('p')).toHaveText('テーマを変えて実験');
  await page.locator('#close-playground').click();
  await expect(page.locator('#search')).toHaveValue('border-radius');
  await expect(page.locator('a[href*="github.com/daigo0001"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'リリースノート' })).toHaveCount(0);
  await expect(page.locator('footer #app-version')).toHaveText(`v${version}`);
  await expect(page.locator('footer #app-version')).toBeVisible();
});

test('ブラウザーへの保存が禁止されていてもテーマ切り替えを使える', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage blocked', 'SecurityError'); } });
  });
  await ready(page);
  await page.locator('#theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#toast')).toContainText('保存はできませんでした');
  expect(errors).toEqual([]);
});

test('HTML属性を絞り込んで共有でき、data-*の編集と参考コードの確認ができる', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await ready(page);
  await page.locator('[data-type="attribute"]').click();
  await expect(page.locator('#result-count')).toContainText(String(cards.filter(card => card.kind === 'attribute').length));
  await page.locator('#search').fill('data-product-id');
  await expect(page.locator('.card')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('[data-type="attribute"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.card-title')).toHaveText('data-*');
  await page.locator('.try-button').click();
  await expect(page.locator('#dialog-type')).toHaveText('HTML属性');
  await expect(page.locator('#guide-js')).toContainText('dataset.productId');
  const product = page.frameLocator('#live-preview').locator('.product');
  await expect(product).toHaveAttribute('data-state', 'ready');
  await page.locator('#code-editor').fill('<article class="product" data-product-id="note-77" data-state="busy">編集中のノート</article>');
  await expect(product).toHaveCSS('background-color', 'rgb(245, 230, 207)');
  expect(await product.evaluate(el => getComputedStyle(el, '::after').content)).toContain('note-77');
  await page.locator('#copy-reference').click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('dataset.productId');
});

test('真偽値・読み取り専用・ラベル関連付け・patternはブラウザー標準で動く', async ({ page }) => {
  await ready(page, './?item=html-attr-disabled');
  await expect(page.frameLocator('#live-preview').getByRole('button', { name: 'これも無効' })).toBeDisabled();
  await ready(page, './?item=html-attr-readonly');
  await expect(page.frameLocator('#live-preview').getByLabel('受付番号')).not.toBeEditable();
  await ready(page, './?item=html-attr-for');
  await page.frameLocator('#live-preview').getByText('この文章もクリックできます').click();
  await expect(page.frameLocator('#live-preview').getByRole('checkbox')).toBeChecked();
  await ready(page, './?item=html-attr-pattern');
  const input = page.frameLocator('#live-preview').getByLabel('商品コード（英大文字2字＋数字3桁）');
  await input.fill('abc');
  expect(await input.evaluate(el => el.checkValidity())).toBe(false);
  await input.fill('AB123');
  expect(await input.evaluate(el => el.checkValidity())).toBe(true);
});

test('ARIAのアクセシブルな名前を確認でき、未収録の導入版を未対応と誤表示しない', async ({ page }) => {
  await ready(page, './?item=html-attr-aria-label');
  await expect(page.frameLocator('#live-preview').getByRole('button', { name: '検索', exact: true })).toHaveText('⌕');
  await expect(page.locator('#guide-status')).toContainText('版数未収録');
  await expect(page.locator('#browser-support')).toBeHidden();
  await expect(page.locator('#support-note')).toContainText('反映API');
  await page.locator('#close-playground').click();
  await page.locator('[data-type="attribute"]').click();
  await page.locator('#status-filter').selectOption('untracked');
  await expect(page.locator('.card')).toHaveCount(cards.filter(card => card.bcd === null).length);
  await page.locator('.card').first().locator('.try-button').click();
  await expect(page.locator('#compat-source')).toHaveAttribute('href', /developer\.mozilla\.org/);
});

test('追加したdata要素・fieldset・contenteditableの実例を操作できる', async ({ page }) => {
  await ready(page, './?item=html-data');
  await expect(page.locator('#dialog-type')).toHaveText('HTML');
  const data = page.frameLocator('#live-preview').locator('data');
  await expect(data).toHaveText('森のノート');
  expect(await data.evaluate(el => el.value)).toBe('SKU-042');
  await ready(page, './?item=html-fieldset');
  const frame = page.frameLocator('#live-preview');
  await frame.getByRole('radio', { name: '小さめ' }).check();
  await expect(frame.getByRole('radio', { name: '広め' })).not.toBeChecked();
  await ready(page, './?item=html-attr-contenteditable');
  await frame.getByLabel('編集できるメモ').fill('小さな発見を追加！');
  await expect(frame.getByLabel('編集できるメモ')).toHaveText('小さな発見を追加！');
});
