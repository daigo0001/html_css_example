import { hydrateIcons } from './icons.js';

const commitBase = 'https://github.com/daigo0001/html_css_example/commit/';
const dateFormat = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'long', timeZone: 'Asia/Tokyo' });
const list = document.querySelector('#release-list');
const status = document.querySelector('#release-status');
const template = document.querySelector('#release-entry');

hydrateIcons();

function renderNote(note) {
  const entry = template.content.cloneNode(true);
  const date = entry.querySelector('[data-date]');
  date.dateTime = note.date;
  date.textContent = dateFormat.format(new Date(note.date));
  entry.querySelector('[data-version]').textContent = `v${note.version}`;
  entry.querySelector('[data-changes]').textContent = note.changes;
  entry.querySelector('[data-commit]').textContent = note.commit;
  entry.querySelector('[data-commit-link]').href = commitBase + encodeURIComponent(note.commit);
  return entry;
}

async function loadNotes() {
  status.hidden = false;
  status.textContent = '更新履歴を読み込んでいます…';
  try {
    const response = await fetch('./assets/release-notes.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const notes = await response.json();
    if (!notes.length) {
      status.textContent = '表示できる更新履歴はありません。';
      return;
    }

    list.append(...notes.map(renderNote));
    list.hidden = false;
    status.hidden = true;
  } catch {
    status.textContent = '更新履歴を読み込めませんでした。ページを再読み込みしてください。';
  }
}

loadNotes();
