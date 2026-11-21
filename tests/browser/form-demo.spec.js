import { test, expect } from '@playwright/test';

test('図鑑から実践デモを開き、選んだパーツの解説と関連カードを読める', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: '実践デモ' }).click();
  await expect(page.locator('.practice-card')).toHaveCount(6);
  await page.getByRole('link', { name: /問い合わせフォーム/ }).click();
  await expect(page).toHaveURL(/\/html_css_example\/form-demo\.html$/);

  const inspector = page.locator('#demo-inspector');
  await page.getByText('この画面のパーツ一覧', { exact: true }).click();
  const inventory = page.locator('#contact-parts');
  await expect(inventory.getByRole('button')).toHaveCount(4);
  await inventory.getByRole('button', { name: 'お名前', exact: true }).press('Enter');
  await expect(inspector.getByRole('heading')).toHaveText('お名前');
  await expect(inventory.getByRole('button', { name: 'お名前', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(inspector.locator('pre')).toContainText('for="contact-name"');

  const email = page.getByLabel('メールアドレス 必須', { exact: true });
  await email.click();
  await expect(inspector.getByRole('heading')).toHaveText('メールアドレス');
  await email.fill('name@example.com');
  await page.getByRole('button', { name: '送信を試す' }).click();
  await expect(inspector.getByRole('heading')).toHaveText('送信ボタン');
  await expect(page.getByRole('status')).toBeEmpty();

  await page.getByRole('button', { name: '入力検証' }).click();
  await expect(email).toHaveValue('name@example.com');
  await expect(inspector).toContainText('現在の入力は有効です。');
  await inspector.getByRole('link', { name: '図鑑カードで詳しく見る' }).click();
  await expect(page.locator('#playground')).toBeVisible();
  await expect(page.locator('#playground-title')).toHaveText('type="email" / required');
});

test('標準メッセージと欄ごとのエラーを切り替え、ValidityState の変化を確認できる', async ({ page }) => {
  await page.goto('./form-demo.html');
  await page.getByRole('button', { name: '入力検証' }).click();

  const form = page.locator('#contact-demo');
  const email = page.getByLabel('メールアドレス 必須', { exact: true });
  const message = page.getByLabel('お問い合わせ内容 必須', { exact: true });
  const submit = page.getByRole('button', { name: '送信を試す' });
  const flag = name => page.locator('.demo-flag').filter({ has: page.getByText(name, { exact: true }) }).locator('dd');

  await expect(form).toHaveJSProperty('noValidate', false);
  await expect(flag('valueMissing')).toHaveText('true');
  await email.fill('abc');
  await expect(flag('valueMissing')).toHaveText('false');
  await expect(flag('typeMismatch')).toHaveText('true');
  await expect(page.locator('#demo-validation-message')).not.toContainText('空文字');
  await submit.click();
  await expect(page.getByRole('status')).toHaveText('入力内容を確認してください。');
  await expect(page.locator('#contact-email-error')).toBeHidden();

  await page.getByRole('radio', { name: '入力欄の下に表示' }).check();
  await expect(form).toHaveJSProperty('noValidate', true);
  await expect(email).toHaveValue('abc');
  await submit.click();
  await expect(page.locator('#contact-name')).toBeFocused();
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await expect(email).toHaveAccessibleDescription(/name@example.com/);
  await expect(message).toHaveAccessibleDescription(/10〜300文字.*入力してください/);

  await page.locator('#contact-name').fill('山田 花子');
  await email.fill('name@example.com');
  await expect(email).not.toHaveAttribute('aria-invalid');
  await expect(flag('valid')).toHaveText('true');
  await message.pressSequentially('short');
  await expect(flag('tooShort')).toHaveText('true');
  await expect(message).toHaveAccessibleDescription(/10文字以上/);
  await message.fill('資料の公開時期について教えてください。');
  await expect(message).toHaveAccessibleDescription('10〜300文字');
  await submit.click();
  await expect(page.getByRole('status')).toHaveText('入力内容を確認できました。デモの操作は完了です。');
  await expect(page).toHaveURL(/\/html_css_example\/form-demo\.html$/);

  await page.getByRole('button', { name: '入力をリセット' }).click();
  await expect(email).toHaveValue('');
  await expect(page.getByRole('status')).toBeEmpty();
  await expect(flag('valueMissing')).toHaveText('true');
});
