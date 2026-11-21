import { mountBreakdown } from './practice-breakdown.js';
import { routeHref } from './practice-navigation.js';

function setupSite(stage, params) {
  const pages = {
    home: { title: 'トップ', next: 'hours', label: '利用案内を見る' },
    hours: { title: '利用案内', next: 'access', label: 'アクセスを見る' },
    access: { title: 'アクセス', next: 'home', label: 'トップへ戻る' },
  };
  const requested = params.get('view');
  const current = Object.hasOwn(pages, requested) ? requested : 'home';
  for (const section of stage.querySelectorAll('[data-site-view]')) {
    section.hidden = section.dataset.siteView !== current;
  }
  for (const link of stage.querySelectorAll('[data-site-link]')) {
    const view = link.dataset.siteLink;
    link.href = routeHref(params, 'view', view);
    if (view === current) link.setAttribute('aria-current', 'page');
  }
  const link = stage.querySelector('#site-next');
  link.href = routeHref(params, 'view', pages[current].next);
  link.textContent = pages[current].label;
  document.title = `${pages[current].title}｜まちの図書室 — Web Notes`;
}

function setupBooking(stage) {
  const form = stage.querySelector('#booking-form');
  const sections = [...form.querySelectorAll('[data-booking-step]')];
  const steps = [...stage.querySelectorAll('.lab-booking-steps li')];
  const progress = stage.querySelector('#booking-progress');
  const back = form.querySelector('#booking-back');
  const next = form.querySelector('#booking-next');
  const restart = form.querySelector('#booking-restart');
  const status = form.querySelector('#booking-status');
  let current = 0;

  function fillReview() {
    form.querySelector('#booking-review-slot').textContent = form.querySelector('[name="slot"]:checked').value;
    form.querySelector('#booking-review-guests').textContent = `${form.querySelector('#booking-guests').value}人`;
    form.querySelector('#booking-review-name').textContent = form.querySelector('#booking-name').value;
    form.querySelector('#booking-review-email').textContent = form.querySelector('#booking-email').value;
  }

  function moveTo(position) {
    current = position;
    for (const [index, section] of sections.entries()) {
      section.hidden = index !== current;
      const fieldset = section.querySelector('fieldset');
      if (fieldset) fieldset.disabled = section.hidden;
      if (index === current) steps[index].setAttribute('aria-current', 'step');
      else steps[index].removeAttribute('aria-current');
    }
    const reviewing = current === sections.length - 1;
    if (reviewing) fillReview();
    progress.value = current + 1;
    back.hidden = current === 0;
    next.hidden = false;
    next.textContent = reviewing ? '予約する' : '次へ';
    restart.hidden = true;
    status.textContent = '';
    sections[current].querySelector('h3').focus();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (current < sections.length - 1) {
      moveTo(current + 1);
      return;
    }

    back.hidden = true;
    next.hidden = true;
    restart.hidden = false;
    status.textContent = '予約内容を確認できました。デモはここで完了です。';
    restart.focus();
  });
  back.addEventListener('click', () => moveTo(current - 1));
  restart.addEventListener('click', () => {
    form.reset();
    moveTo(0);
  });
}

function setupDashboard(stage) {
  const period = stage.querySelector('#dashboard-period');
  const total = stage.querySelector('#dashboard-total');
  const leading = stage.querySelector('#dashboard-leading');
  const status = stage.querySelector('#dashboard-status');
  const showBreakdown = mountBreakdown(stage.querySelector('#dashboard-breakdown'));
  const reports = { week: [72, 31, 17], month: [238, 301, 81] };
  const sources = ['検索', '直接アクセス', '外部リンク'];

  function render() {
    const counts = reports[period.value];
    const count = showBreakdown(counts);
    total.textContent = `${count.toLocaleString('ja-JP')}件`;
    leading.textContent = sources[counts.indexOf(Math.max(...counts))];
    status.textContent = `${period.selectedOptions[0].textContent}の集計に切り替えました。`;
  }

  period.addEventListener('change', render);
  render();
}

function setupTheme(stage) {
  const scheme = stage.querySelector('#theme-scheme');
  const accent = stage.querySelector('#theme-accent');
  const scale = stage.querySelector('#theme-scale');
  const preview = stage.querySelector('#themed-article');
  const output = stage.querySelector('output[for="theme-scale"]');

  function render() {
    preview.dataset.scheme = scheme.querySelector(':checked').value;
    preview.dataset.accent = accent.value;
    preview.style.fontSize = `${scale.value}%`;
    output.value = `${scale.value}%`;
  }

  scheme.addEventListener('change', render);
  accent.addEventListener('change', render);
  scale.addEventListener('input', render);
  render();
}

export const setupPages = {
  site: setupSite,
  booking: setupBooking,
  dashboard: setupDashboard,
  theme: setupTheme,
};
