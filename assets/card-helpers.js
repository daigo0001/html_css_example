export const h = (id, name, category, description, html, options = {}) => ({
  id: `html-${id}`, name: `<${name}>`, type: 'html', kind: 'element', category, description,
  html, css: '', bcd: `html.elements.${id}`, mdn: `https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/${id}`,
  usage: description,
  seo: 'この要素だけで検索順位が上がるわけではありません。内容に合った要素を選び、読み手と支援技術に意味を伝えましょう。',
  note: '', ...options,
});

export const c = (id, name, category, description, html, css, options = {}) => ({
  id: `css-${id}`, name, type: 'css', kind: 'property', category, description, html, css,
  bcd: `css.properties.${id}`, mdn: `https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Properties/${id}`,
  usage: description,
  seo: 'CSSの指定そのものに直接の検索順位向上効果はありません。読みやすさ、操作性、レイアウトの安定性に配慮しましょう。',
  note: '', ...options,
});

export const a = (id, name, description, html, options = {}) => ({
  id: `html-attr-${id}`, name, type: 'html', kind: 'attribute', category: 'attributes', description,
  html, css: 'label { display: block; margin-bottom: 7px; font-size: 12px; }\ninput:not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, select { max-width: 100%; padding: 8px; border: 1px solid #c2d1b2; border-radius: 6px; font: inherit; background: white; color: #40533b; }\nsmall { display: block; margin-top: 6px; font-size: 11px; }', bcd: `html.global_attributes.${id}`, mdn: `https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Global_attributes/${id}`,
  usage: description,
  seo: '属性の存在だけで検索順位が上がるわけではありません。内容や操作の意味を正しく伝え、利用しやすいページにしましょう。',
  note: '', ...options,
});
