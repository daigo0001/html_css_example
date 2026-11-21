import { test, expect } from '@playwright/test';

test('ファイル選択で形式・サイズ・件数を検証し、削除したファイルを再選択できる', async ({ page }) => {
  await page.goto('./practice.html?group=parts');
  await page.getByRole('link', { name: /ファイルの添付と確認/ }).click();
  const input = page.getByLabel('ファイルを選ぶ', { exact: true });
  const list = page.getByRole('list', { name: '添付したファイル', exact: true });
  const pdf = { name: '申込書.pdf', mimeType: 'application/pdf', buffer: Buffer.from('sample') };
  await input.setInputFiles([
    pdf,
    { name: 'メモ.txt', mimeType: 'text/plain', buffer: Buffer.from('sample') },
    { name: '大きい写真.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(5_000_001) },
    { name: '空の画像.png', mimeType: 'image/png', buffer: Buffer.alloc(0) },
  ]);
  await expect(list.getByRole('listitem')).toHaveCount(1);
  await expect(list).toContainText('申込書.pdf');
  const errors = page.getByRole('list', { name: '添付のエラー' });
  await expect(errors.getByRole('listitem')).toHaveText([
    'メモ.txt — PNG・JPEG・PDFを選んでください。',
    '大きい写真.jpg — 1ファイルは5 MBまでです。',
    '空の画像.png — 空のファイルです。',
  ]);

  await input.setInputFiles([
    { name: '資料.pdf', mimeType: 'application/pdf', buffer: Buffer.from('sample') },
    { name: '写真.png', mimeType: 'image/png', buffer: Buffer.from('sample') },
    { name: '追加.pdf', mimeType: 'application/pdf', buffer: Buffer.from('sample') },
  ]);
  await expect(list.getByRole('listitem')).toHaveCount(3);
  await expect(errors).toContainText('追加.pdf — 添付は3件までです。');
  await list.getByRole('button', { name: '申込書.pdfを削除' }).click();
  await expect(list.getByRole('button', { name: '資料.pdfを削除' })).toBeFocused();
  await input.setInputFiles(pdf);
  await expect(list.getByRole('listitem')).toHaveCount(3);
  await expect(list).toContainText('申込書.pdf');
  await expect(errors).toBeHidden();
});

test('ドロップと重複検出、確認の中止・進捗、最後の削除後のフォーカスが機能する', async ({ page }) => {
  await page.clock.install();
  await page.goto('./practice.html?demo=attachment');
  await page.getByRole('button', { name: 'アクセシビリティ確認' }).click();
  const order = page.locator('#demo-a11y-order strong');
  const input = page.getByLabel('ファイルを選ぶ', { exact: true });
  const progress = page.getByRole('progressbar', { name: '確認の進み具合' });
  const zone = page.locator('#attachment-zone');
  const list = page.getByRole('list', { name: '添付したファイル', exact: true });
  const action = page.locator('#attachment-confirm');
  const status = page.getByRole('status');
  const requests = [];
  page.on('request', request => requests.push(request.url()));

  await expect(order).toHaveText(['ファイルを選ぶ']);
  const files = await page.evaluateHandle(() => {
    const transfer = new DataTransfer();
    transfer.items.add(new File(['sample'], '見本.png', { type: 'image/png', lastModified: 1 }));
    return transfer;
  });
  await zone.dispatchEvent('dragover', { dataTransfer: files });
  await expect(zone).toHaveClass(/is-dragging/);
  await zone.dispatchEvent('drop', { dataTransfer: files });
  await expect(zone).not.toHaveClass(/is-dragging/);
  await expect(list.getByRole('listitem')).toHaveCount(1);
  await zone.dispatchEvent('drop', { dataTransfer: files });
  await expect(page.getByRole('list', { name: '添付のエラー' })).toContainText('すでに添付されています。');
  await expect(order).toHaveText(['ファイルを選ぶ', '見本.pngを削除', '添付を確認する']);

  await action.click();
  await expect(action).toHaveText('確認を中止');
  await expect(input).toBeDisabled();
  await expect(order).toHaveText(['確認を中止']);
  await action.click();
  await page.clock.runFor(1_000);
  await expect(status).toHaveText('確認を中止しました。');
  await expect(progress).toHaveJSProperty('value', 0);

  await action.click();
  await page.clock.runFor(1_000);
  await expect(progress).toHaveJSProperty('value', 1);
  await expect(status).toHaveText('添付ファイル 1 件を確認できました。');
  await list.getByRole('button', { name: '見本.pngを削除' }).click();
  await expect(input).toBeFocused();
  await expect(action).toBeDisabled();
  await expect(order).toHaveText(['ファイルを選ぶ']);
  expect(requests).toEqual([]);
});
