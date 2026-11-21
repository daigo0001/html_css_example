import { hydrateIcons, icon } from './icons.js';
import { practiceExamples } from './practice-data.js';
import { mountPartsList, partTag } from './practice-parts.js';
import { setupComponents } from './practice-components.js';
import { setupPages } from './practice-pages.js';
import { collectionHref, collectionParams } from './practice-navigation.js';

const $ = selector => document.querySelector(selector);
const params = new URLSearchParams(location.search);
const example = practiceExamples.find(item => item.id === params.get('demo') && !item.href);

function renderCollection() {
  const browser = $('#practice-browser');
  const groups = [...browser.querySelectorAll('[data-practice-group]')];
  const search = $('#practice-search-input');
  const categories = {
    parts: $('#practice-parts-category'),
    pages: $('#practice-pages-category'),
  };
  const results = $('#practice-count');
  const empty = $('#practice-empty');
  const normalize = value => value.normalize('NFKC').toLowerCase();
  let group = collectionParams(params).get('group') || 'all';
  search.value = params.get('find') || '';

  const entries = practiceExamples.map(item => {
    const entry = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'practice-card';

    const cover = document.createElement('div');
    cover.className = 'practice-card-top';
    cover.innerHTML = `<span class="practice-card-icon">${icon(item.icon)}</span>${icon('arrow-right')}`;
    const title = document.createElement('h3');
    title.textContent = item.title;
    const description = document.createElement('p');
    description.textContent = item.description;
    const tags = document.createElement('div');
    tags.className = 'practice-tags';
    const partTags = Object.values(item.parts).map(part => part.tags);
    const topics = [...new Set([...partTags.map(([tag]) => tag), ...partTags.flat()])];
    tags.append(...topics.slice(0, 4).map(partTag));
    link.append(cover, title, description, tags);
    entry.append(link);
    categories[item.group].querySelector('ul').append(entry);
    const content = normalize([item.title, item.description, ...topics].join(' '));
    return { item, entry, link, content };
  });

  function update() {
    const filters = new URLSearchParams({ group, find: search.value });
    const query = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    const totals = { parts: 0, pages: 0 };
    for (const control of groups) {
      control.setAttribute('aria-pressed', String(control.dataset.practiceGroup === group));
    }
    for (const { item, entry, link, content } of entries) {
      entry.hidden = (group !== 'all' && group !== item.group) || !query.every(term => content.includes(term));
      if (entry.hidden) continue;

      const href = new URL(item.href || `./practice.html?demo=${item.id}`, location.href);
      for (const [key, value] of collectionParams(filters)) href.searchParams.set(key, value);
      link.href = href.href;
      totals[item.group]++;
    }
    for (const [key, category] of Object.entries(categories)) category.hidden = totals[key] === 0;
    const total = totals.parts + totals.pages;
    results.textContent = `${total}件のデモ`;
    empty.hidden = total !== 0;
    const current = new URL(collectionHref(filters), location.href);
    if (current.href !== location.href) history.replaceState(null, '', current);
  }

  search.addEventListener('input', update);
  for (const control of groups) {
    control.addEventListener('click', () => {
      group = control.dataset.practiceGroup;
      update();
    });
  }
  browser.hidden = false;
  update();
}

function setupSearch() {
  const query = $('#product-query');
  const category = $('#product-category');
  const products = [...$('#product-list').children];
  const count = $('#product-count');
  const empty = $('#product-empty');
  const clear = $('#clear-products');

  function render() {
    const term = query.value.trim().normalize('NFKC').toLowerCase();
    const visible = products.filter(product => {
      const name = product.querySelector('strong').textContent.normalize('NFKC').toLowerCase();
      product.hidden = !name.includes(term) || (category.value !== 'all' && category.value !== product.dataset.product);
      return !product.hidden;
    });
    count.textContent = `${visible.length}件の商品`;
    empty.hidden = visible.length > 0;
    clear.hidden = !query.value && category.value === 'all';

    const url = new URL(location.href);
    if (term) url.searchParams.set('q', query.value.trim());
    else url.searchParams.delete('q');
    if (category.value === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', category.value);
    if (url.href !== location.href) history.replaceState(null, '', url);
  }

  query.value = params.get('q') || '';
  const categoryParam = params.get('category');
  category.value = [...category.options].some(option => option.value === categoryParam) ? categoryParam : 'all';
  query.addEventListener('input', render);
  category.addEventListener('change', render);
  clear.addEventListener('click', () => {
    query.value = '';
    category.value = 'all';
    render();
    query.focus();
  });
  render();
}

function setupDialog() {
  const dialog = $('#confirm-delete');
  const trigger = $('#open-confirmation');
  const article = $('#article-draft');
  const status = $('#draft-status');
  const restore = $('#restore-draft');

  trigger.addEventListener('click', () => {
    dialog.returnValue = '';
    dialog.showModal();
  });
  dialog.addEventListener('close', () => {
    if (dialog.returnValue === 'delete') {
      article.hidden = true;
      restore.hidden = false;
      status.textContent = '下書きを削除しました。';
      restore.focus();
    } else {
      status.textContent = '削除を取り消しました。';
      trigger.focus();
    }
  });
  restore.addEventListener('click', () => {
    article.hidden = false;
    restore.hidden = true;
    status.textContent = '下書きを復元しました。';
    trigger.focus();
  });
}

function setupFaq() {
  const exclusive = $('#faq-exclusive');
  const questions = [...document.querySelectorAll('.practice-faq-list details')];

  exclusive.addEventListener('change', () => {
    if (exclusive.checked) {
      const open = questions.filter(question => question.open);
      for (const question of open.slice(1)) question.open = false;
      for (const question of questions) question.name = 'questions';
    } else {
      for (const question of questions) question.removeAttribute('name');
    }
  });
}

function setupLayout() {
  const size = $('.practice-preview-size');
  const grid = $('.practice-articles');
  const scroll = $('.practice-preview-scroll');
  const output = $('#article-layout-status');
  const hint = $('#article-layout-hint');
  const widthButtons = [...document.querySelectorAll('[data-preview-width]')];

  function showColumns() {
    const columns = getComputedStyle(grid).gridTemplateColumns.split(/\s+/).length;
    hint.hidden = scroll.scrollWidth <= scroll.clientWidth;
    output.textContent = `表示幅 ${size.offsetWidth}px・${columns}列`;
  }

  for (const button of widthButtons) {
    button.addEventListener('click', () => {
      size.style.width = `${button.dataset.previewWidth}px`;
      scroll.scrollLeft = 0;
      for (const control of widthButtons) control.setAttribute('aria-pressed', String(control === button));
    });
  }

  const observer = new ResizeObserver(showColumns);
  observer.observe(grid);
  observer.observe(scroll);
  showColumns();
}

function setupProgress() {
  const checks = [...document.querySelectorAll('.practice-task-group input')];
  const progress = $('#publish-progress');
  const output = $('#publish-status');

  function render() {
    const done = checks.filter(check => check.checked).length;
    progress.max = checks.length;
    progress.value = done;
    output.textContent = `${checks.length}件中${done}件が完了`;
  }

  $('.practice-task-group').addEventListener('change', render);
  $('#reset-tasks').addEventListener('click', () => {
    for (const check of checks) check.checked = false;
    render();
  });
  render();
}

const setupExample = {
  search: setupSearch,
  dialog: setupDialog,
  faq: setupFaq,
  layout: setupLayout,
  progress: setupProgress,
  ...setupComponents,
  ...setupPages,
};

function renderExample(item) {
  document.title = `${item.title} — Web Notes`;
  $('#practice-back').href = collectionHref(params);
  $('#practice-back-label').textContent = '実践デモ一覧へ';
  $('#example-title').textContent = item.title;
  $('#example-description').textContent = item.description;
  const stage = $('#practice-stage');
  stage.append($(`#practice-${item.id}`).content.cloneNode(true));
  $('#practice-collection').hidden = true;
  $('#practice-example').hidden = false;
  setupExample[item.id](stage, params);

  const targets = [...stage.querySelectorAll('[data-practice-part]')];
  const title = $('#practice-part-title');
  const description = $('#practice-part-description');
  const code = $('#practice-part-code');
  const reference = $('#practice-part-reference');

  function selectPart(key) {
    const part = item.parts[key];
    updatePartButtons(key);
    for (const target of targets) target.classList.toggle('practice-selected', target.dataset.practicePart === key);
    title.textContent = part.label;
    description.textContent = part.description;
    code.textContent = part.code;
    reference.href = `./?item=${part.card}`;
  }

  const updatePartButtons = mountPartsList($('#practice-parts'), item.parts, selectPart);
  function selectFromPreview(event) {
    const target = event.target.closest('[data-practice-part]');
    if (target) selectPart(target.dataset.practicePart);
  }
  stage.addEventListener('click', selectFromPreview);
  stage.addEventListener('focusin', selectFromPreview);
  stage.addEventListener('change', selectFromPreview);
  selectPart(Object.keys(item.parts)[0]);
}

if (example) renderExample(example);
else renderCollection();
hydrateIcons();
