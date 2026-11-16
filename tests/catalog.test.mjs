import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import bcd from '@mdn/browser-compat-data' with { type: 'json' };
import { cards, categories } from '../assets/catalog.js';

const compatibility = JSON.parse(await readFile(new URL('../assets/compatibility.json', import.meta.url)));

test('全カードに一意のID、分類、説明、実行例と一次資料がある', () => {
  assert.equal(new Set(cards.map(card => card.id)).size, cards.length);
  assert.ok(cards.length >= 60);
  for (const card of cards) {
    assert.match(card.id, /^(html|css)-[a-z0-9_-]+$/);
    assert.ok(categories.some(category => category.id === card.category), card.id);
    for (const key of ['name', 'description', 'usage', 'seo', 'html', 'bcd']) assert.ok(card[key], `${card.id}: ${key}`);
    assert.ok(['html', 'css'].includes(card.type));
    assert.equal(new URL(card.mdn).hostname, 'developer.mozilla.org');
    const feature = card.bcd.split('.').reduce((value, key) => value?.[key], bcd)?.__compat;
    assert.ok(feature, `無効なBCDキー: ${card.bcd}`);
    if (card.type === 'css') assert.ok(card.css);
  }
});

test('互換性データは現行カタログとMDNデータに対応し、将来の対応を誤表示しない', () => {
  assert.equal(compatibility.version, bcd.__meta.version, 'MDN更新後は npm run compat:update を実行してください');
  assert.deepEqual(Object.keys(compatibility.cards).sort(), cards.map(card => card.id).sort());
  for (const card of cards) {
    const info = compatibility.cards[card.id];
    assert.ok(['established', 'recent', 'limited', 'deprecated'].includes(info.status));
    assert.ok(info.source.startsWith('https://github.com/mdn/browser-compat-data/blob/'));
    assert.ok(!info.source.endsWith('undefined'));
    assert.ok(!info.since || info.since <= compatibility.checkedAt);
    if (card.legacy) assert.equal(info.status, 'deprecated');
    for (const support of Object.values(info.support)) {
      if (support.version) assert.ok(support.date && support.date <= compatibility.checkedAt);
    }
  }
  assert.equal(compatibility.cards['css-float'].status, 'established', 'float は廃止機能ではない');
});

test('実行例には外部依存やスクリプトがなく、ローカル画像が存在する', async () => {
  for (const card of cards) {
    assert.doesNotMatch(card.html, /<script\b|\son\w+\s*=/i);
    for (const match of card.html.matchAll(/(?:src|poster|srcset)="([^"]+)"/g)) {
      assert.ok(match[1].startsWith('./assets/'), card.id);
      await readFile(new URL(`../${match[1]}`, import.meta.url));
    }
    assert.doesNotMatch(card.css, /@import|url\(\s*["']?https?:/i);
  }
});
