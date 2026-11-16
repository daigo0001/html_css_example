import { writeFile } from 'node:fs/promises';
import bcd from '@mdn/browser-compat-data' with { type: 'json' };
import { cards } from '../assets/catalog.js';

const checkedAt = new Date().toISOString().slice(0, 10);
const browsers = ['chrome', 'edge', 'firefox', 'safari', 'chrome_android', 'safari_ios'];
const records = {};

for (const card of cards) {
  const feature = card.bcd.split('.').reduce((value, key) => value?.[key], bcd)?.__compat;
  if (!feature) throw new Error(`BCDのキーが見つかりません: ${card.bcd}`);
  const support = {};
  for (const browser of browsers) {
    const statements = [feature.support[browser]].flat().filter(Boolean);
    // 接頭辞・フラグ・部分対応・削除済みの実装は「対応開始」の対象にしない。
    const full = statements.find(s => s.version_added && !s.version_removed && !s.flags && !s.prefix && !s.alternative_name && !s.partial_implementation);
    const version = full?.version_added;
    const numericVersion = typeof version === 'string' ? version.replace(/^≤/, '') : null;
    const release = bcd.browsers[browser].releases[numericVersion];
    const released = release?.release_date && release.release_date <= checkedAt;
    support[browser] = {
      version: numericVersion && released ? version : null,
      date: released ? release.release_date : null,
      approximate: typeof version === 'string' && version.startsWith('≤'),
    };
  }
  const desktop = browsers.slice(0, 4).map(name => support[name]);
  const allSupported = desktop.every(browser => browser.version && browser.date);
  const since = allSupported ? desktop.map(browser => browser.date).sort().at(-1) : null;
  const cutoff = new Date(`${checkedAt}T00:00:00Z`);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - 30);
  const status = card.legacy || feature.status?.deprecated ? 'deprecated' : !allSupported ? 'limited' : new Date(since) > cutoff ? 'recent' : 'established';
  records[card.id] = {
    status, since, approximate: desktop.some(browser => browser.approximate), support,
    experimental: feature.status?.experimental ?? false,
    source: `https://github.com/mdn/browser-compat-data/blob/v${bcd.__meta.version}/${feature.source_file}`,
    spec: [feature.spec_url].flat()[0] ?? null,
  };
}

await writeFile(new URL('../assets/compatibility.json', import.meta.url), JSON.stringify({
  source: 'MDN browser-compat-data', version: bcd.__meta.version, checkedAt,
  methodology: '接頭辞・フラグ・部分対応を除き、Chrome / Edge / Firefox / Safari（デスクトップ）の対応が揃った日。30か月以上前なら安定対応。それ以降は新しく対応。公式Baselineではなく、この図鑑独自の目安。標準化・誕生の年月ではない。複合的な例の全構文の対応は保証しない。',
  cards: records,
}, null, 2) + '\n');
console.log(`${cards.length}件の互換性情報を MDN BCD ${bcd.__meta.version} から生成しました (${checkedAt})`);
