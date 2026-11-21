import { mountBreakdown } from './practice-breakdown.js';
import { routeHref } from './practice-navigation.js';

function setupColor(stage) {
  const controls = stage.querySelector('#color-controls');
  const ranges = [...controls.querySelectorAll('input')];
  const outputs = [...controls.querySelectorAll('output')];
  const swatch = stage.querySelector('#lab-swatch');
  const readout = stage.querySelector('#color-css');

  function render() {
    const [hue, saturation, lightness] = ranges.map(input => input.valueAsNumber);
    const angle = Number((hue * 3.6).toFixed(1));
    const color = `hsl(${angle} ${saturation}% ${lightness}%)`;
    for (const [index, output] of outputs.entries()) output.value = ranges[index].value;
    swatch.style.backgroundColor = color;
    readout.textContent = color;
  }

  controls.addEventListener('input', render);
  stage.querySelector('#color-reset').addEventListener('click', () => {
    for (const input of ranges) input.value = input.defaultValue;
    render();
  });
  render();
}

function mountClock(stage, { duration, render, startLabel, messages }) {
  const toggle = stage.querySelector('[data-clock-toggle]');
  const reset = stage.querySelector('[data-clock-reset]');
  const status = stage.querySelector('[data-clock-status]');
  const preset = stage.querySelector('[data-clock-duration]');
  const labels = { idle: startLabel, running: '一時停止', paused: '再開', complete: 'もう一度開始' };
  let state;
  let limit;
  let elapsed;
  let startedAt;
  let intervalId;

  function setState(next) {
    state = next;
    toggle.textContent = labels[next];
    status.textContent = messages[next];
    if (preset) preset.disabled = next === 'running' || next === 'paused';
  }

  function currentElapsed() {
    return Math.min(limit, elapsed + performance.now() - startedAt);
  }

  function stop() {
    clearInterval(intervalId);
  }

  function tick() {
    const current = currentElapsed();
    render(current, limit);
    if (current >= limit) {
      elapsed = limit;
      stop();
      setState('complete');
    }
  }

  function restart() {
    stop();
    elapsed = 0;
    limit = duration();
    render(elapsed, limit);
    setState('idle');
  }

  toggle.addEventListener('click', () => {
    if (state === 'running') {
      elapsed = currentElapsed();
      stop();
      render(elapsed, limit);
      setState(elapsed >= limit ? 'complete' : 'paused');
      return;
    }

    if (state === 'complete') elapsed = 0;
    startedAt = performance.now();
    setState('running');
    intervalId = setInterval(tick, 80);
    tick();
  });
  reset.addEventListener('click', restart);
  preset?.addEventListener('change', restart);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state === 'running') tick();
  });
  restart();
}

function setupTransfer(stage) {
  const progress = stage.querySelector('#transfer-progress');
  const readout = stage.querySelector('#transfer-percent');
  mountClock(stage, {
    duration: () => 6_000,
    startLabel: '処理を開始',
    messages: {
      idle: '開始できます。',
      running: '写真の書き出しを処理中です。',
      paused: '一時停止しました。',
      complete: '写真の書き出しが完了しました。',
    },
    render(elapsed, limit) {
      const percent = Math.floor(elapsed * 100 / limit);
      progress.value = percent;
      readout.textContent = `${percent}%`;
    },
  });
}

function setupTimer(stage) {
  const preset = stage.querySelector('#timer-duration');
  const readout = stage.querySelector('#timer-display');
  mountClock(stage, {
    duration: () => Number(preset.value) * 1_000,
    startLabel: 'タイマーを開始',
    messages: {
      idle: '時間を選んで開始できます。',
      running: 'タイマーが進行中です。',
      paused: '一時停止しました。',
      complete: '設定した時間になりました。',
    },
    render(elapsed, limit) {
      const remaining = Math.ceil((limit - elapsed) / 1_000);
      const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
      const seconds = String(remaining % 60).padStart(2, '0');
      readout.textContent = `${minutes}:${seconds}`;
    },
  });
}

function setupPie(stage) {
  const controls = stage.querySelector('#pie-controls');
  const ranges = [...controls.querySelectorAll('input')];
  const outputs = [...controls.querySelectorAll('output')];
  const updateBreakdown = mountBreakdown(stage.querySelector('#pie-breakdown'), { inspectParts: true });

  function render() {
    for (const [index, output] of outputs.entries()) output.value = ranges[index].value;
    updateBreakdown(ranges.map(input => input.valueAsNumber));
  }

  controls.addEventListener('input', render);
  render();
}

function setupLoading(stage) {
  const response = stage.querySelector('#loading-response');
  const action = stage.querySelector('#loading-action');
  const spinner = stage.querySelector('#loading-spinner');
  const status = stage.querySelector('#loading-status');
  const result = stage.querySelector('#loading-result');
  const skeleton = stage.querySelector('#loading-skeleton');
  const items = stage.querySelector('#loading-items');
  const empty = stage.querySelector('#loading-empty');
  const messages = {
    idle: '読み込みを始められます。',
    loading: '読み込み中…',
    success: 'お知らせを2件読み込みました。',
    empty: '読み込みが完了しました。お知らせは0件です。',
    error: '読み込みに失敗しました。再試行できます。',
    cancelled: '読み込みを中止しました。',
  };
  const labels = {
    idle: '読み込む',
    loading: '読み込みを中止',
    success: '再読み込み',
    empty: '再読み込み',
    error: '再試行',
    cancelled: 'もう一度読み込む',
  };
  let task = null;

  function render(state) {
    const loading = state === 'loading';
    action.textContent = labels[state];
    response.disabled = loading;
    result.setAttribute('aria-busy', String(loading));
    spinner.hidden = !loading;
    skeleton.hidden = !loading;
    items.hidden = state !== 'success';
    empty.hidden = state !== 'empty';
    status.dataset.state = state;
    status.textContent = messages[state];
  }

  action.addEventListener('click', () => {
    if (task !== null) {
      clearTimeout(task);
      task = null;
      render('cancelled');
      return;
    }

    const scenario = response.value;
    render('loading');
    task = setTimeout(() => {
      task = null;
      render(scenario);
    }, 1_500);
  });
  render('idle');
}

function setupCards(stage) {
  const filter = stage.querySelector('#article-saved-only');
  const count = stage.querySelector('#article-card-count');
  const empty = stage.querySelector('#article-card-empty');
  const buttons = [...stage.querySelectorAll('.lab-bookmark')];

  function render() {
    let visible = 0;
    for (const button of buttons) {
      const saved = button.getAttribute('aria-pressed') === 'true';
      const card = button.closest('article');
      card.hidden = filter.checked && !saved;
      if (!card.hidden) visible++;
    }
    count.textContent = `${visible}件の記事`;
    empty.hidden = visible > 0;
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const saved = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(saved));
      button.querySelector('.lab-save-label').textContent = saved ? 'しおり済み' : 'しおり';
      render();
      if (filter.checked && !saved) filter.focus();
    });
  }
  filter.addEventListener('change', render);
  render();
}

function setupPagination(stage, params) {
  const entries = stage.querySelector('#pager-entries');
  const rows = [...entries.children];
  const links = [...stage.querySelectorAll('[data-page-number]')];
  const perPage = 2;
  const requested = params.get('page');
  const page = links.some(link => link.dataset.pageNumber === requested) ? Number(requested) : 1;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  entries.start = start + 1;
  entries.replaceChildren(...rows.slice(start, end));
  stage.querySelector('#pager-count').textContent = `${rows.length}件中 ${start + 1}〜${end}件`;

  for (const link of links) {
    link.href = routeHref(params, 'page', link.dataset.pageNumber);
    if (Number(link.dataset.pageNumber) === page) link.setAttribute('aria-current', 'page');
  }
  const previous = stage.querySelector('#pager-prev');
  const next = stage.querySelector('#pager-next');
  previous.hidden = page === 1;
  next.hidden = page === links.length;
  if (!previous.hidden) previous.href = routeHref(params, 'page', page - 1);
  if (!next.hidden) next.href = routeHref(params, 'page', page + 1);
  document.title = `ページネーション（${page}ページ） — Web Notes`;
}

function setupTabs(stage) {
  const tabList = stage.querySelector('[role="tablist"]');
  const tabs = [...tabList.querySelectorAll('[role="tab"]')];
  const panels = tabs.map(tab => stage.querySelector(`#${tab.getAttribute('aria-controls')}`));

  function activate(index) {
    for (const [position, tab] of tabs.entries()) {
      const active = position === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[position].hidden = !active;
    }
  }

  for (const [index, tab] of tabs.entries()) tab.addEventListener('click', () => activate(index));
  tabList.addEventListener('keydown', event => {
    const index = tabs.indexOf(event.target);
    if (index === -1) return;
    const positions = {
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      ArrowRight: (index + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!Object.hasOwn(positions, event.key)) return;
    event.preventDefault();
    const next = positions[event.key];
    activate(next);
    tabs[next].focus();
  });
}

function setupSorting(stage) {
  const table = stage.querySelector('#stock-table');
  const body = table.tBodies[0];
  const rows = [...body.rows];
  const status = stage.querySelector('#stock-sort-status');
  const buttons = [...table.querySelectorAll('[data-sort-key]')];
  const collator = new Intl.Collator('ja');

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const heading = button.closest('th');
      const ascending = heading.getAttribute('aria-sort') !== 'ascending';
      const ordered = [...rows].sort((first, second) => {
        const diff = button.dataset.sortKey === 'stock'
          ? Number(first.cells[2].textContent) - Number(second.cells[2].textContent)
          : collator.compare(first.cells[0].textContent, second.cells[0].textContent);
        return ascending ? diff : -diff;
      });
      for (const control of buttons) {
        control.closest('th').removeAttribute('aria-sort');
        control.querySelector('span').textContent = '↕';
      }
      heading.setAttribute('aria-sort', ascending ? 'ascending' : 'descending');
      button.querySelector('span').textContent = ascending ? '↑' : '↓';
      body.append(...ordered);
      const name = button.dataset.sortKey === 'stock' ? '在庫数' : '品目';
      status.textContent = `${name}の${ascending ? '昇順' : '降順'}に並び替えました。`;
    });
  }
}

export const setupComponents = {
  color: setupColor,
  transfer: setupTransfer,
  timer: setupTimer,
  pie: setupPie,
  loading: setupLoading,
  cards: setupCards,
  pagination: setupPagination,
  tabs: setupTabs,
  sorting: setupSorting,
};
