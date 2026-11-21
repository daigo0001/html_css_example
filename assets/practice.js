import { hydrateIcons, icon } from './icons.js';
import { practiceExamples } from './practice-data.js';
import { mountPartsList, partTag } from './practice-parts.js';

const $ = selector => document.querySelector(selector);
const params = new URLSearchParams(location.search);
const example = practiceExamples.find(item => item.id === params.get('demo') && !item.href);

function renderCollection() {
  const cards = $('#practice-cards');
  for (const item of practiceExamples) {
    const entry = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'practice-card';
    link.href = item.href || `./practice.html?demo=${item.id}`;

    const cover = document.createElement('div');
    cover.className = 'practice-card-top';
    cover.innerHTML = `<span class="practice-card-icon">${icon(item.icon)}</span>${icon('arrow-right')}`;
    const title = document.createElement('h2');
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
    cards.append(entry);
  }
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
};

function renderExample(item) {
  document.title = `${item.title} — Web Notes`;
  $('#practice-back').href = './practice.html';
  $('#practice-back-label').textContent = '実践デモ一覧へ';
  $('#example-title').textContent = item.title;
  $('#example-description').textContent = item.description;
  const stage = $('#practice-stage');
  stage.append($(`#practice-${item.id}`).content.cloneNode(true));
  $('#practice-collection').hidden = true;
  $('#practice-example').hidden = false;

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
  setupExample[item.id]();
}

if (example) renderExample(example);
else renderCollection();
hydrateIcons();
