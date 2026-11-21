import { test, expect } from '@playwright/test';

test('実践デモを種類とパーツ名で絞り込み、画面から一覧に戻ると条件を復元する', async ({ page }) => {
  await page.goto('./practice.html');
  const search = page.getByRole('searchbox', { name: '実践デモを検索' });
  await expect(page.locator('#practice-count')).toHaveText('19件のデモ');
  await page.getByRole('button', { name: 'Webページ', exact: true }).click();
  await expect(page.locator('#practice-count')).toHaveText('8件のデモ');
  await expect(page.locator('#practice-parts-category')).toBeHidden();
  await page.getByRole('button', { name: 'Webパーツ', exact: true }).click();
  await expect(page.locator('#practice-count')).toHaveText('11件のデモ');
  await search.fill('カウントダウン');
  await expect(page.locator('#practice-count')).toHaveText('1件のデモ');
  await page.getByRole('link', { name: /カウントダウンタイマー/ }).click();
  await expect(page.getByRole('heading', { name: '作業タイマー' })).toBeVisible();
  await page.getByRole('link', { name: '実践デモ一覧へ' }).click();
  await expect(search).toHaveValue('カウントダウン');
  await expect(page.getByRole('button', { name: 'Webパーツ', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await search.fill('該当しない文字列');
  await expect(page.locator('#practice-count')).toHaveText('0件のデモ');
  await expect(page.locator('#practice-empty')).toBeVisible();
});

test('色のつまみを0〜100で操作すると現在値と色見本が連動する', async ({ page }) => {
  await page.goto('./practice.html?demo=color');
  const hue = page.getByRole('slider', { name: '色相' });
  await expect(hue).toHaveAttribute('min', '0');
  await expect(hue).toHaveAttribute('max', '100');
  await hue.press('End');
  await expect(page.locator('output[for="hue-range"]')).toHaveText('100');
  await expect(page.locator('#color-css')).toHaveText('hsl(360 72% 55%)');
  await page.getByRole('slider', { name: '彩度' }).press('Home');
  await expect(page.locator('#color-css')).toHaveText('hsl(360 0% 55%)');
  await expect(page.locator('#lab-swatch')).toHaveCSS('background-color', 'rgb(140, 140, 140)');
  await page.getByRole('button', { name: '色をリセット' }).click();
  await expect(hue).toHaveValue('58');
  await expect(page.locator('#color-css')).toHaveText('hsl(208.8 72% 55%)');
  await page.getByRole('button', { name: '0〜100のつまみ' }).click();
  await expect(page.locator('#practice-part-reference')).toHaveAttribute('href', './?item=html-attr-range');
});

test('プログレスバーが停止した値から再開し、完了後にリセットできる', async ({ page }) => {
  await page.clock.install();
  await page.goto('./practice.html?demo=transfer');
  const progress = page.getByRole('progressbar', { name: '処理の進行度' });
  await expect(progress).toHaveJSProperty('value', 0);
  await page.getByRole('button', { name: '処理を開始' }).click();
  await page.clock.runFor(2_100);
  await page.getByRole('button', { name: '一時停止' }).click();
  const stopped = await progress.evaluate(node => node.value);
  expect(stopped).toBeGreaterThan(0);
  expect(stopped).toBeLessThan(100);
  await page.clock.runFor(7_000);
  await expect(progress).toHaveJSProperty('value', stopped);
  await page.getByRole('button', { name: '再開' }).click();
  await page.clock.runFor(6_000);
  await expect(progress).toHaveJSProperty('value', 100);
  await expect(page.getByRole('status')).toHaveText('写真の書き出しが完了しました。');
  await page.getByRole('button', { name: 'リセット', exact: true }).click();
  await expect(progress).toHaveJSProperty('value', 0);
});

test('タイマーの残り時間を停止し、再開後に0秒で完了する', async ({ page }) => {
  await page.clock.install();
  await page.goto('./practice.html?demo=timer');
  const readout = page.getByRole('timer', { name: '残り時間' });
  const duration = page.getByRole('combobox', { name: 'タイマーの長さ' });
  await duration.selectOption('25');
  await expect(readout).toHaveText('00:25');
  await page.getByRole('button', { name: 'タイマーを開始' }).click();
  await expect(duration).toBeDisabled();
  await page.clock.runFor(4_100);
  await page.getByRole('button', { name: '一時停止' }).click();
  const stopped = await readout.textContent();
  expect(stopped).not.toBe('00:25');
  await page.clock.runFor(25_000);
  await expect(readout).toHaveText(stopped);
  await page.getByRole('button', { name: '再開' }).click();
  await page.clock.runFor(25_000);
  await expect(readout).toHaveText('00:00');
  await expect(page.getByRole('status')).toHaveText('設定した時間になりました。');
  await expect(duration).toBeEnabled();
});

test('円グラフと明細が連動し、1項目だけと合計0件を表示する', async ({ page }) => {
  await page.goto('./practice.html?demo=pie');
  const chart = page.locator('.lab-pie');
  const caption = page.locator('.lab-chart-caption');
  const table = page.getByRole('table', { name: 'アクセス元の件数と割合' });
  await expect(chart).toHaveCSS('background-image', /^conic-gradient/);
  await expect(table.getByRole('row', { name: /検索/ })).toContainText('50%');
  await page.getByRole('slider', { name: '外部リンク' }).press('Home');
  await expect(caption).toHaveText('合計 80件');
  await expect(table.getByRole('row', { name: /検索/ })).toContainText('62.5%');
  await page.getByRole('slider', { name: '直接アクセス' }).press('Home');
  await expect(chart).toHaveCSS('background-image', 'none');
  await expect(table.getByRole('row', { name: /検索/ })).toContainText('100%');
  await page.getByRole('slider', { name: '検索', exact: true }).press('Home');
  await expect(caption).toHaveText('データなし（0件）');
  await expect(table.getByRole('row', { name: /検索/ })).toContainText('—');
});

test('ローディングから失敗、再試行、成功、0件、中止へ切り替えられる', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('./practice.html?demo=loading');
  const response = page.getByRole('combobox', { name: '応答のシナリオ' });
  const action = page.locator('#loading-action');
  const result = page.getByRole('region', { name: 'お知らせの結果' });
  const status = page.getByRole('status');
  await response.selectOption('error');
  await action.click();
  await expect(result).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('#loading-spinner')).toHaveCSS('animation-name', 'none');
  await page.clock.runFor(1_500);
  await expect(status).toHaveText(/失敗しました/);
  await expect(action).toHaveText('再試行');
  await response.selectOption('success');
  await action.click();
  await page.clock.runFor(1_500);
  await expect(result).toHaveAttribute('aria-busy', 'false');
  await expect(result.getByRole('listitem')).toHaveCount(2);
  await response.selectOption('empty');
  await action.click();
  await page.clock.runFor(1_500);
  await expect(result).toContainText('新しいお知らせはありません。');
  await action.click();
  await action.click();
  await page.clock.runFor(2_000);
  await expect(status).toHaveText('読み込みを中止しました。');
  await expect(result).toHaveAttribute('aria-busy', 'false');
});

test('しおりの状態とカードの絞り込みが連動する', async ({ page }) => {
  await page.goto('./practice.html?demo=cards');
  const stage = page.locator('#practice-stage');
  const saved = stage.getByRole('checkbox', { name: 'しおりのみ' });
  const bookmark = stage.getByRole('button', { name: '余白を揃えるのしおり' });
  await expect(stage.getByRole('article')).toHaveCount(3);
  await bookmark.click();
  await expect(bookmark).toHaveAttribute('aria-pressed', 'true');
  await saved.check();
  await expect(stage.getByRole('article')).toHaveCount(1);
  await bookmark.click();
  await expect(saved).toBeFocused();
  await expect(stage.getByRole('article')).toHaveCount(0);
  await expect(page.locator('#article-card-empty')).toBeVisible();
});

test('ページネーションのリンクで移動すると現在ページと表示範囲が変わる', async ({ page }) => {
  await page.goto('./practice.html?demo=pagination');
  const links = page.getByRole('navigation', { name: '記事のページ番号' });
  await expect(links.getByRole('link', { name: '1ページ' })).toHaveAttribute('aria-current', 'page');
  await links.getByRole('link', { name: '次へ' }).click();
  await expect(page).toHaveURL(/page=2$/);
  await expect(page.locator('#pager-count')).toHaveText('6件中 3〜4件');
  await expect(links.getByRole('link', { name: '2ページ' })).toHaveAttribute('aria-current', 'page');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'CSSの単位' })).toBeVisible();
  await page.goBack();
  await expect(page.locator('#pager-count')).toHaveText('6件中 1〜2件');
});

test('タブを矢印キーとHomeで切り替えるとフォーカスとパネルが連動する', async ({ page }) => {
  await page.goto('./practice.html?demo=tabs');
  const intro = page.getByRole('tab', { name: '概要' });
  const history = page.getByRole('tab', { name: '履歴' });
  await intro.press('ArrowRight');
  await expect(history).toBeFocused();
  await expect(history).toHaveAttribute('aria-selected', 'true');
  await expect(intro).toHaveAttribute('tabindex', '-1');
  await expect(page.getByRole('tabpanel', { name: '履歴' })).toBeVisible();
  await history.press('Home');
  await expect(intro).toBeFocused();
  await expect(page.getByRole('tabpanel', { name: '概要' })).toBeVisible();
});

test('表の在庫数を昇順と降順に並べ替えて現在の方向を伝える', async ({ page }) => {
  await page.goto('./practice.html?demo=sorting');
  const table = page.getByRole('table', { name: '文具の在庫一覧' });
  const stock = table.getByRole('button', { name: '在庫数' });
  const heading = table.getByRole('columnheader', { name: '在庫数' });
  await stock.click();
  await expect(heading).toHaveAttribute('aria-sort', 'ascending');
  await expect(table.locator('tbody td:last-child')).toHaveText(['5', '18', '42']);
  await stock.click();
  await expect(heading).toHaveAttribute('aria-sort', 'descending');
  await expect(table.locator('tbody td:last-child')).toHaveText(['42', '18', '5']);
});

test('図書室の3ページをリンクとブラウザーの戻るボタンで移動できる', async ({ page }) => {
  await page.goto('./practice.html?demo=site');
  const nav = page.getByRole('navigation', { name: '図書室のページ' });
  await expect(nav.getByRole('link', { name: 'トップ' })).toHaveAttribute('aria-current', 'page');
  await nav.getByRole('link', { name: '利用案内' }).click();
  await expect(page).toHaveURL(/view=hours$/);
  await expect(page.getByRole('heading', { name: '開室時間と利用方法' })).toBeVisible();
  await page.getByRole('link', { name: 'アクセスを見る' }).click();
  await expect(page).toHaveURL(/view=access$/);
  await expect(nav.getByRole('link', { name: 'アクセス' })).toHaveAttribute('aria-current', 'page');
  await page.goBack();
  await expect(page.getByRole('heading', { name: '開室時間と利用方法' })).toBeVisible();
});

test('3ステップ予約の検証、戻る操作での入力保持、確認と初期化が動く', async ({ page }) => {
  await page.goto('./practice.html?demo=booking');
  const next = page.getByRole('button', { name: '次へ' });
  await next.click();
  await expect(page.getByRole('heading', { name: '参加枠を選ぶ' })).toBeVisible();
  await page.getByRole('radio', { name: '土曜 10:00' }).check();
  await next.click();
  await expect(page.getByRole('heading', { name: '連絡先を入力する' })).toBeFocused();
  const email = page.getByRole('textbox', { name: 'メールアドレス' });
  await page.getByRole('textbox', { name: 'お名前' }).fill('山田 花子');
  await email.fill('abc');
  await next.click();
  await expect(email).toBeVisible();
  await email.fill('name@example.com');
  await next.click();
  await expect(page.locator('#booking-review-email')).toHaveText('name@example.com');
  await page.getByRole('button', { name: '戻る', exact: true }).click();
  await expect(email).toHaveValue('name@example.com');
  await next.click();
  await page.getByRole('button', { name: '予約する', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('デモはここで完了');
  await page.getByRole('button', { name: '最初から試す' }).click();
  await expect(page.getByRole('radio', { name: '土曜 10:00' })).not.toBeChecked();
});

test('集計期間を変えるとアクセスの指標、円グラフ、明細が同時に変わる', async ({ page }) => {
  await page.goto('./practice.html?demo=dashboard');
  const chart = page.locator('.lab-pie');
  await expect(page.locator('#dashboard-total')).toHaveText('120件');
  await expect(page.locator('#dashboard-leading')).toHaveText('検索');
  const before = await chart.evaluate(node => getComputedStyle(node).backgroundImage);
  await page.getByRole('combobox', { name: '集計期間' }).selectOption('month');
  await expect(page.locator('#dashboard-total')).toHaveText('620件');
  await expect(page.locator('#dashboard-leading')).toHaveText('直接アクセス');
  await expect(page.getByRole('row', { name: /直接アクセス/ })).toContainText('301');
  await expect(chart).not.toHaveCSS('background-image', before);
});

test('配色と文字サイズが記事プレビューに反映される', async ({ page }) => {
  await page.goto('./practice.html?demo=theme');
  const article = page.getByRole('article', { name: '朝の散歩をノートに残す' });
  await expect(article).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await page.getByRole('radio', { name: 'ダーク' }).check();
  await expect(article).toHaveCSS('background-color', 'rgb(36, 36, 42)');
  await page.getByRole('combobox', { name: 'アクセント色' }).selectOption('green');
  await expect(article.locator('.lab-article-topic')).toHaveCSS('color', 'rgb(142, 219, 185)');
  await page.getByRole('slider', { name: '文字サイズ' }).press('End');
  await expect(page.locator('output[for="theme-scale"]')).toHaveText('130%');
  await expect(article).toHaveCSS('font-size', '20.8px');
});
