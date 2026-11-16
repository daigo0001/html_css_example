import { test, expect } from '@playwright/test';
import { cards } from '../../assets/catalog.js';

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

test('全カードを表示でき、並び替え・説明・不正な保存データにも対応する', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('web-notes:bookmarks:v1', '{broken json'));
  await ready(page);
  while (await page.locator('#load-more').isVisible()) await page.locator('#load-more').click();
  await expect(page.locator('.card')).toHaveCount(cards.length);
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
  await nav(page, '[data-category="forms"]');
  if (testInfo.project.name === 'mobile') {
    await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#sidebar-shade')).toBeHidden();
  }
  await page.locator('.try-button').first().click();
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
