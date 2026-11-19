import { cards, cardById, categories } from './catalog.js';
import { icon, hydrateIcons } from './icons.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const storageKey = 'web-notes:bookmarks:v1';
const pageSize = 12;
const statusLabels = { established: '安定対応', recent: '新しく対応', limited: '一部対応・要確認', deprecated: '非推奨・廃止', untracked: '版数未収録' };
const browserLabels = { chrome: 'Chrome', edge: 'Edge', firefox: 'Firefox', safari: 'Safari', chrome_android: 'Chrome Android', safari_ios: 'Safari iOS' };
const state = { q: '', type: 'all', category: 'all', status: 'all', sort: 'recommended', view: 'all', limit: pageSize };
let compatibility;
let filtered = [];
let bookmarks = readBookmarks();
let activeCard = null;
let editing = 'html';
let draft = { html: '', css: '' };
let triggerElement;
let toastTimer;
const mobileQuery = matchMedia('(max-width: 920px)');

hydrateIcons();
setupTheme();
$('#all-count').textContent = cards.length;
$('#category-nav').innerHTML = categories.filter(category => category.id !== 'all').map(category => `<button class="category-button" data-category="${category.id}" aria-pressed="false">${icon(category.icon)}${category.label}<span class="category-count">${cards.filter(card => card.category === category.id).length}</span></button>`).join('');

function readBookmarks() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return new Set(Array.isArray(value) ? value.filter(id => cardById.has(id)) : []);
  } catch { return new Set(); }
}

function setupTheme() {
  const key = 'web-notes:theme:v1';
  const system = matchMedia('(prefers-color-scheme: dark)');
  const button = $('#theme-toggle');
  function readPreference() {
    try {
      const value = localStorage.getItem(key);
      return ['light', 'dark'].includes(value) ? value : null;
    } catch { return null; }
  }
  let preference = readPreference();
  function apply(theme) {
    const dark = theme === 'dark';
    document.documentElement.dataset.theme = theme;
    $('meta[name="theme-color"]').content = dark ? '#161618' : '#f5f5f7';
    button.setAttribute('aria-checked', dark);
    button.title = `${dark ? 'ライト' : 'ダーク'}モードに切り替える`;
    button.innerHTML = `${icon(dark ? 'moon' : 'sun')}<span class="theme-label">${dark ? 'ダーク' : 'ライト'}</span>`;
  }
  apply(document.documentElement.dataset.theme || (system.matches ? 'dark' : 'light'));
  button.addEventListener('click', () => {
    preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(preference);
    try { localStorage.setItem(key, preference); } catch { toast('テーマを切り替えましたが、ブラウザーへの保存はできませんでした。'); }
  });
  system.addEventListener('change', event => { if (!preference) apply(event.matches ? 'dark' : 'light'); });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = readPreference();
    apply(preference || (system.matches ? 'dark' : 'light'));
  });
}

function toast(message) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('visible'), 2800);
}

function syncUrl() {
  const url = new URL(location.href);
  for (const [key, value] of Object.entries(state)) {
    if (key === 'limit') continue;
    if (!value || value === 'all' || (key === 'sort' && value === 'recommended')) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  history.replaceState(null, '', url);
}

function readUrl() {
  const params = new URL(location.href).searchParams;
  state.q = params.get('q') || '';
  state.type = ['html', 'css', 'attribute'].includes(params.get('type')) ? params.get('type') : 'all';
  state.category = categories.some(category => category.id === params.get('category')) ? params.get('category') : 'all';
  state.status = Object.hasOwn(statusLabels, params.get('status')) ? params.get('status') : 'all';
  state.sort = ['name', 'newest'].includes(params.get('sort')) ? params.get('sort') : 'recommended';
  state.view = params.get('view') === 'saved' ? 'saved' : 'all';
  $('#search').value = state.q;
  $('#status-filter').value = state.status;
  $('#sort').value = state.sort;
}

const normalize = text => text.normalize('NFKC').toLocaleLowerCase('ja').replace(/[<>]/g, '');
export function matchingCards() {
  const terms = normalize(state.q).trim().split(/\s+/).filter(Boolean);
  return cards.filter(card => {
    const content = normalize([card.name, card.id, card.description, card.usage, card.seo, card.note, card.type, card.js || '', card.kind === 'attribute' ? '属性' : '', categories.find(category => category.id === card.category)?.label].join(' '));
    const filterType = card.kind === 'attribute' ? 'attribute' : card.type;
    return (state.type === 'all' || filterType === state.type)
      && (state.category === 'all' || card.category === state.category)
      && (state.status === 'all' || compatibility.cards[card.id].status === state.status)
      && (state.view === 'all' || bookmarks.has(card.id))
      && terms.every(term => content.includes(term));
  }).sort((a, b) => state.sort === 'name' ? a.name.localeCompare(b.name, 'ja') : state.sort === 'newest' ? (compatibility.cards[b.id].since || '').localeCompare(compatibility.cards[a.id].since || '') : 0);
}

function highlight(code, type) {
  if (type === 'html') return escape(code).replace(/(&lt;\/?)([a-z][a-z0-9-]*)/gi, '$1<span class="syntax-tag">$2</span>').replace(/([\w-]+)=(&quot;.*?&quot;)/g, '<span class="syntax-attr">$1</span>=<span class="syntax-string">$2</span>');
  return escape(code).replace(/([\w-]+)(\s*:)(?!\/)/g, '<span class="syntax-prop">$1</span>$2');
}

function statusMarkup(card) {
  const info = compatibility.cards[card.id];
  return `<span class="status-label ${info.status}" title="${escape(info.supportNote || compatibility.methodology)}">${statusLabels[info.status]}</span><span class="since" title="標準化や誕生の年ではなく、主要4デスクトップブラウザーで対応が揃った時期">${info.since ? `${info.approximate ? '〜' : ''}${info.since.slice(0, 7).replace('-', '.')}${info.approximate ? 'までに' : '〜'}` : info.status === 'untracked' ? '支援技術で確認' : '詳細を確認'}${info.status === 'deprecated' ? ' / 使用非推奨' : ''}</span>`;
}

function cardMarkup(card) {
  const saved = bookmarks.has(card.id);
  const code = card.type === 'html' ? card.html : card.css;
  return `<article class="card" data-card="${card.id}"><div class="card-header"><div class="card-meta"><span class="language-label ${card.type}">${card.kind === 'attribute' ? 'HTML属性' : card.type.toUpperCase()}</span><span class="card-category">${categories.find(category => category.id === card.category).label}</span><button class="save-card" data-save="${card.id}" aria-label="${escape(card.name)}を${saved ? 'コレクションから外す' : 'コレクションに保存'}" aria-pressed="${saved}">${icon('bookmark')}</button></div><h3 class="card-title"><button data-open="${card.id}">${escape(card.name)}</button></h3><p class="card-description">${escape(card.description)}</p></div><div class="card-preview"><iframe title="${escape(card.name)}の実際の表示" loading="lazy" sandbox="allow-forms" referrerpolicy="no-referrer" data-preview="${card.id}"></iframe></div><div class="card-code"><pre><code>${highlight(code, card.type)}</code></pre></div><div class="card-info">${statusMarkup(card)}</div><div class="card-footer"><button class="try-button" data-open="${card.id}">${icon('code')}コードを試す</button><button class="details-button" data-open="${card.id}" aria-label="${escape(card.name)}の説明と対応情報">${icon('arrow-up-right')}</button></div></article>`;
}

// template 内は不活性。貼り付けたHTMLをアプリのDOMに実行可能な状態で挿入しない。
function sanitizePreview(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  template.content.querySelectorAll('script, iframe, frame, frameset, object, embed, link, meta, base, portal, fencedframe, template').forEach(element => element.remove());
  const sampleImage = new URL('./assets/landscape.svg', location.href).href;
  for (const element of template.content.querySelectorAll('*')) {
    for (const attr of [...element.attributes]) {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on') || ['srcdoc', 'action', 'formaction', 'ping', 'target', 'autofocus', 'is', 'nonce'].includes(name)) element.removeAttribute(attr.name);
      if (['src', 'srcset', 'poster', 'href', 'xlink:href', 'data', 'background'].includes(name)) {
        if (name === 'href' && attr.value.startsWith('#')) continue;
        try {
          const url = new URL(attr.value, location.href);
          if (url.href !== sampleImage || !['src', 'srcset', 'poster'].includes(name)) element.removeAttribute(attr.name);
          else element.setAttribute(attr.name, sampleImage);
        } catch { element.removeAttribute(attr.name); }
      }
    }
  }
  return template.innerHTML;
}

function makePreview(html, css, compact = false) {
  const imagePath = new URL('./assets/', location.href).href;
  const safeCss = css.replace(/<\/style/gi, '<\\/style');
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src ${escape(imagePath)}; form-action 'none'; base-uri 'none'"><style>*{box-sizing:border-box}html{height:100%}body{margin:0;min-height:100%;display:grid;align-content:center;padding:${compact ? '27px 17px 17px' : '24px'};font:14px/1.65 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#40533b;background:${compact ? '#fafbf6' : '#fff'}}button{font:inherit;cursor:pointer;padding:8px 14px;border:1px solid #bdcfac;border-radius:6px;background:#e6efda;color:#426039;font-size:12px}button:disabled{opacity:.5}a{color:#638345}input,select{font:inherit;max-width:100%}p{margin:8px 0}h2{font-size:20px;margin:8px 0}img,video{max-width:100%}pre{font-size:12px;background:#edf3e5;padding:12px;border-radius:6px}summary{cursor:pointer}:focus-visible{outline:2px solid #769653;outline-offset:3px}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}marquee{display:none}}${safeCss}</style></head><body>${sanitizePreview(html)}</body></html>`;
}

function updateChrome() {
  const currentCategory = categories.find(category => category.id === state.category);
  const title = state.view === 'saved' ? 'マイコレクション' : state.category === 'all' ? 'すべてのカード' : currentCategory.label;
  $('#library-title').textContent = title;
  $('#saved-count').textContent = bookmarks.size;
  for (const button of $$('[data-type]')) {
    button.classList.toggle('active', button.dataset.type === state.type);
    button.setAttribute('aria-pressed', button.dataset.type === state.type);
  }
  for (const button of $$('[data-view]')) {
    const selected = button.dataset.view === state.view;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', selected);
  }
  for (const button of $$('[data-category]')) {
    const selected = button.dataset.category === state.category;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', selected);
  }
}

function render({ append = false } = {}) {
  const grid = $('#cards');
  filtered = matchingCards();
  updateChrome();
  const previous = append ? grid.children.length : 0;
  if (!append) grid.replaceChildren();
  grid.insertAdjacentHTML('beforeend', filtered.slice(previous, state.limit).map(cardMarkup).join(''));
  for (const frame of grid.querySelectorAll('iframe:not([srcdoc])')) {
    const card = cardById.get(frame.dataset.preview);
    frame.srcdoc = makePreview(card.html, card.css, true);
  }
  grid.setAttribute('aria-busy', 'false');
  $('#empty-state').hidden = filtered.length > 0;
  const emptyCollection = state.view === 'saved' && !bookmarks.size;
  $('#empty-title').textContent = emptyCollection ? '最初のひとつを、集めよう。' : 'まだ見つかりませんでした。';
  $('#empty-description').textContent = emptyCollection ? 'カード右上のしおりを押すと、ここに保存できます。' : '別の言葉やカテゴリーで探してみましょう。';
  $('#result-count').innerHTML = `<strong>${filtered.length}</strong> 件のカード${state.q ? ` <span>· 「${escape(state.q)}」</span>` : ''}`;
  $('#clear-filters').hidden = !state.q && state.type === 'all' && state.category === 'all' && state.status === 'all';
  $('#load-more').hidden = state.limit >= filtered.length;
  $('#load-progress').textContent = filtered.length ? `${Math.min(state.limit, filtered.length)} / ${filtered.length} cards` : '';
  syncUrl();
}

function resetFilters() {
  Object.assign(state, { q: '', type: 'all', category: 'all', status: 'all', sort: 'recommended', view: 'all', limit: pageSize });
  $('#search').value = '';
  $('#status-filter').value = 'all';
  $('#sort').value = 'recommended';
  render();
}

function setFilter(key, value) {
  state[key] = value;
  state.limit = pageSize;
  render();
}

function updatePreview() {
  const preview = $('#live-preview');
  preview.inert = true;
  preview.setAttribute('aria-busy', 'true');
  preview.addEventListener('load', () => {
    preview.inert = false;
    preview.setAttribute('aria-busy', 'false');
  }, { once: true });
  preview.srcdoc = makePreview(draft.html, draft.css);
}

function setEditor(type) {
  editing = type;
  for (const tab of $$('[data-editor]')) {
    tab.setAttribute('aria-selected', tab.dataset.editor === type);
    tab.tabIndex = tab.dataset.editor === type ? 0 : -1;
  }
  $('#editor-panel').setAttribute('aria-labelledby', `${type}-tab`);
  $('label[for="code-editor"]').textContent = `${type.toUpperCase()}コードを編集`;
  $('#code-editor').value = draft[type];
}

function openCard(id, trigger = document.activeElement) {
  const card = cardById.get(id);
  if (!card) return;
  activeCard = card;
  triggerElement = trigger;
  draft = { html: card.html, css: card.css };
  $('#playground-title').textContent = card.name;
  $('#dialog-type').textContent = card.kind === 'attribute' ? 'HTML属性' : card.type.toUpperCase();
  $('#dialog-type').className = `language-label ${card.type}`;
  $('#guide-usage').textContent = card.usage;
  $('#guide-js').textContent = card.js || '';
  $('#guide-js-wrap').hidden = !card.js;
  $('#guide-seo').textContent = card.seo;
  $('#guide-note').textContent = card.note;
  $('#guide-note-wrap').hidden = !card.note;
  $('#mdn-link').href = card.mdn;
  $('#guide-status').innerHTML = statusMarkup(card);
  const info = compatibility.cards[card.id];
  $('#browser-support').hidden = info.tracked === false;
  $('#support-note').textContent = info.supportNote || '接頭辞・フラグ・部分対応を除いた開始版。サブ機能や古いOSには差があります。';
  $('#browser-support').innerHTML = Object.entries(info.support).map(([name, value]) => `<div class="browser-cell ${value.version ? '' : 'unknown'}"><span>${browserLabels[name]}</span><strong>${value.version ? `${escape(value.version)}+` : '要確認'}</strong></div>`).join('');
  $('#compat-source').href = info.source;
  $('#compat-source').innerHTML = `${info.tracked === false ? 'MDNで属性の仕様を確認' : 'MDNの対応データ'} ${icon('arrow-up-right')}`;
  $('#preview-width').value = '100%';
  $('#live-preview').style.width = '100%';
  setEditor(card.type);
  updatePreview();
  const url = new URL(location.href);
  url.searchParams.set('item', card.id);
  history.replaceState(null, '', url);
  if (!$('#playground').open) $('#playground').showModal();
  document.body.style.overflow = 'hidden';
  $('#close-playground').focus({ preventScroll: true });
}

async function copy(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    toast(successMessage);
  } catch {
    toast('コピーできませんでした。コードやURLを選択してコピーしてください。');
  }
}

function toggleSidebar(open) {
  const sidebar = $('#sidebar');
  const menu = $('#menu-toggle');
  const restoreFocus = !open && mobileQuery.matches && sidebar.classList.contains('open');
  open = mobileQuery.matches && open;
  sidebar.classList.toggle('open', open);
  sidebar.inert = mobileQuery.matches && !open;
  $('.workspace').inert = open;
  $('.skip-link').inert = open;
  $('#sidebar-shade').hidden = !open;
  menu.setAttribute('aria-expanded', open);
  if (open) $('#close-sidebar').focus();
  if (restoreFocus) menu.focus({ preventScroll: true });
}

function openAbout() {
  $('#about-dialog').showModal();
  document.body.style.overflow = 'hidden';
  $('#close-about').focus();
}

function setupEvents() {
  toggleSidebar(false);
  mobileQuery.addEventListener('change', () => toggleSidebar(false));
  let searchTimer;
  $('#search').addEventListener('input', event => {
    state.q = event.target.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => setFilter('q', $('#search').value), 130);
  });
  for (const button of $$('[data-type]')) button.addEventListener('click', () => setFilter('type', button.dataset.type));
  for (const button of $$('[data-category]')) button.addEventListener('click', () => {
    setFilter('category', button.dataset.category);
    toggleSidebar(false);
  });
  for (const button of $$('[data-view]')) button.addEventListener('click', () => {
    state.category = 'all';
    setFilter('view', button.dataset.view);
    toggleSidebar(false);
  });
  $('#status-filter').addEventListener('change', event => setFilter('status', event.target.value));
  $('#sort').addEventListener('change', event => setFilter('sort', event.target.value));
  $('#clear-filters').addEventListener('click', resetFilters);
  $('#empty-reset').addEventListener('click', resetFilters);
  $('#load-more').addEventListener('click', () => {
    const firstNewId = filtered[state.limit]?.id;
    state.limit += pageSize;
    render({ append: true });
    if (firstNewId) $(`[data-card="${firstNewId}"] .card-title button`).focus({ preventScroll: true });
  });
  $('#cards').addEventListener('click', event => {
    const open = event.target.closest('[data-open]');
    if (open) openCard(open.dataset.open, open);
    const save = event.target.closest('[data-save]');
    if (!save) return;
    const id = save.dataset.save;
    const saved = !bookmarks.has(id);
    if (saved) bookmarks.add(id); else bookmarks.delete(id);
    let persisted = true;
    try { localStorage.setItem(storageKey, JSON.stringify([...bookmarks])); } catch { persisted = false; }
    toast(persisted ? saved ? 'マイコレクションに保存しました。' : 'コレクションから外しました。' : 'この画面では保存しましたが、ブラウザーへの保存ができませんでした。');
    if (state.view === 'saved') render();
    else {
      save.setAttribute('aria-pressed', saved);
      save.setAttribute('aria-label', `${cardById.get(id).name}を${saved ? 'コレクションから外す' : 'コレクションに保存'}`);
      $('#saved-count').textContent = bookmarks.size;
    }
  });
  for (const id of ['random-card', 'shuffle-button']) $(`#${id}`).addEventListener('click', () => {
    const pool = filtered.length ? filtered : cards;
    openCard(pool[Math.floor(Math.random() * pool.length)].id);
    toggleSidebar(false);
  });
  $('#close-playground').addEventListener('click', () => $('#playground').close());
  $('#playground').addEventListener('close', () => {
    activeCard = null;
    $('#live-preview').removeAttribute('srcdoc');
    document.body.style.overflow = '';
    const url = new URL(location.href);
    url.searchParams.delete('item');
    history.replaceState(null, '', url);
    triggerElement?.isConnected && triggerElement.focus({ preventScroll: true });
  });
  let editorTimer;
  $('#code-editor').addEventListener('input', event => {
    draft[editing] = event.target.value;
    clearTimeout(editorTimer);
    editorTimer = setTimeout(updatePreview, 200);
  });
  $('#code-editor').addEventListener('keydown', event => {
    if (event.key === 'Tab' && !event.shiftKey && event.altKey) {
      event.preventDefault();
      const editor = event.target;
      editor.setRangeText('  ', editor.selectionStart, editor.selectionEnd, 'end');
      editor.dispatchEvent(new Event('input'));
    }
  });
  for (const tab of $$('[data-editor]')) {
    tab.addEventListener('click', () => setEditor(tab.dataset.editor));
    tab.addEventListener('keydown', event => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const type = event.key === 'Home' ? 'html' : event.key === 'End' ? 'css' : editing === 'html' ? 'css' : 'html';
        setEditor(type);
        $(`#${type}-tab`).focus();
      }
    });
  }
  $('#reset-code').addEventListener('click', () => {
    draft = { html: activeCard.html, css: activeCard.css };
    setEditor(editing);
    updatePreview();
    toast('最初のコードに戻しました。');
  });
  $('#copy-code').addEventListener('click', () => copy(draft[editing], `${editing.toUpperCase()}をコピーしました。`));
  $('#copy-reference').addEventListener('click', () => copy(activeCard.js, '参考JavaScriptをコピーしました。'));
  $('#share-card').addEventListener('click', () => {
    const url = new URL('./', location.href);
    url.searchParams.set('item', activeCard.id);
    copy(url.href, 'このカードへのリンクをコピーしました。');
  });
  $('#preview-width').addEventListener('change', event => { $('#live-preview').style.width = event.target.value; });
  for (const id of ['about-button', 'compat-info']) $(`#${id}`).addEventListener('click', openAbout);
  $('#close-about').addEventListener('click', () => $('#about-dialog').close());
  $('#about-dialog').addEventListener('close', () => { document.body.style.overflow = ''; });
  for (const dialog of $$('dialog')) dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  $('#menu-toggle').addEventListener('click', () => toggleSidebar(true));
  $('#close-sidebar').addEventListener('click', () => toggleSidebar(false));
  $('#sidebar-shade').addEventListener('click', () => toggleSidebar(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && $('#sidebar').classList.contains('open')) {
      toggleSidebar(false);
      return;
    }
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !$$('dialog[open], .sidebar.open').length) {
      event.preventDefault();
      $('#search').focus();
    }
  });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey) return;
    bookmarks = readBookmarks();
    render();
  });
  window.addEventListener('popstate', () => {
    readUrl();
    render();
    const item = new URL(location.href).searchParams.get('item');
    if (item) openCard(item);
    else if ($('#playground').open) $('#playground').close();
  });
}

async function init() {
  try {
    const response = await fetch('./assets/compatibility.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    compatibility = await response.json();
    for (const card of cards) if (!compatibility.cards[card.id]) throw new Error(`Missing compatibility: ${card.id}`);
    readUrl();
    render();
    setupEvents();
    $('#compat-methodology').textContent = compatibility.methodology;
    $('#data-version').textContent = `出典：${compatibility.source} v${compatibility.version} / データ生成日：${compatibility.checkedAt}。常に最新のブラウザーやすべての関連構文を保証する情報ではありません。`;
    const initialItem = new URL(location.href).searchParams.get('item');
    if (initialItem && cardById.has(initialItem)) openCard(initialItem);
    else if (initialItem) {
      const url = new URL(location.href);
      url.searchParams.delete('item');
      history.replaceState(null, '', url);
      toast('このカードは見つかりませんでした。');
    }
  } catch (error) {
    console.error('カードの読み込みに失敗しました', error);
    $('#cards').setAttribute('aria-busy', 'false');
    $('#result-count').textContent = 'カードを読み込めませんでした。ページを再読み込みしてください。';
    $('#cards').innerHTML = '<p class="notice">HTTPサーバー経由で開いてください。ファイルを直接開くとデータを取得できません。接続を確認して再読み込みしてください。</p>';
  }
}

init();
