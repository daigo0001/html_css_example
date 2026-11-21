const allowedFormats = new Map([
  ['png', 'image/png'],
  ['jpg', 'image/jpeg'],
  ['jpeg', 'image/jpeg'],
  ['pdf', 'application/pdf'],
]);
const maxFileSize = 5_000_000;
const maxFiles = 3;
const reviewDelay = 450;
const formatSize = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 1 });

function sizeLabel(size) {
  if (size < 1_000) return `${size} B`;
  if (size < 1_000_000) return `${formatSize.format(size / 1_000)} KB`;
  return `${formatSize.format(size / 1_000_000)} MB`;
}

function validFormat(file) {
  const extension = /\.([^.]+)$/.exec(file.name)?.[1].toLowerCase();
  const mime = allowedFormats.get(extension);
  const detected = file.type.toLowerCase();
  return Boolean(mime && (!detected || detected === 'application/octet-stream' || detected === mime));
}

function sameFile(first, second) {
  return first.name === second.name && first.size === second.size && first.lastModified === second.lastModified;
}

export function setupAttachment(stage) {
  const zone = stage.querySelector('#attachment-zone');
  const input = stage.querySelector('#attachment-files');
  const status = stage.querySelector('#attachment-status');
  const errors = stage.querySelector('#attachment-errors');
  const list = stage.querySelector('#attachment-list');
  const empty = stage.querySelector('#attachment-empty');
  const progress = stage.querySelector('#attachment-progress');
  const review = stage.querySelector('#attachment-review');
  const action = stage.querySelector('#attachment-confirm');
  const files = [];
  let scheduled = null;

  function drawSelection() {
    const rows = files.map((file, index) => {
      const row = document.createElement('li');
      const info = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = file.name;
      const size = document.createElement('span');
      size.textContent = sizeLabel(file.size);
      info.append(name, size);
      const button = document.createElement('button');
      button.className = 'outline-button';
      button.type = 'button';
      button.textContent = '削除';
      button.setAttribute('aria-label', file.name + 'を削除');
      button.addEventListener('click', () => {
        files.splice(index, 1);
        drawSelection();
        showErrors([]);
        status.textContent = `${file.name} を削除しました。添付は ${files.length} 件です。`;
        const nextButton = list.querySelectorAll('button')[Math.min(index, files.length - 1)];
        (nextButton || input).focus();
      });
      row.append(info, button);
      return row;
    });

    list.replaceChildren(...rows);
    list.hidden = files.length === 0;
    empty.hidden = files.length > 0;
    action.disabled = !files.length;
    progress.max = files.length || 1;
    progress.value = 0;
  }

  function showErrors(reasons) {
    errors.replaceChildren(...reasons.map(reason => {
      const row = document.createElement('li');
      row.textContent = reason;
      return row;
    }));
    errors.hidden = reasons.length === 0;
  }

  function addFiles(selection) {
    const rejected = [];
    let added = 0;
    for (const file of selection) {
      let reason;
      if (!validFormat(file)) reason = 'PNG・JPEG・PDFを選んでください。';
      else if (file.size === 0) reason = '空のファイルです。';
      else if (file.size > maxFileSize) reason = '1ファイルは5 MBまでです。';
      else if (files.some(existing => sameFile(existing, file))) reason = 'すでに添付されています。';
      else if (files.length >= maxFiles) reason = '添付は3件までです。';

      if (reason) rejected.push(`${file.name} — ${reason}`);
      else {
        files.push(file);
        added++;
      }
    }
    if (added) drawSelection();
    showErrors(rejected);
    status.textContent = rejected.length
      ? `${added} 件追加しました。${rejected.length} 件のエラーを確認してください。`
      : `${added} 件追加しました。添付は ${files.length} 件です。`;
  }

  function setReviewing(reviewing) {
    input.disabled = reviewing;
    for (const button of list.querySelectorAll('button')) button.disabled = reviewing;
    review.setAttribute('aria-busy', String(reviewing));
    action.textContent = reviewing ? '確認を中止' : '添付を確認する';
  }

  function checkNext(index) {
    progress.value = index;
    if (index === files.length) {
      scheduled = null;
      setReviewing(false);
      status.textContent = `添付ファイル ${files.length} 件を確認できました。`;
      return;
    }
    scheduled = setTimeout(() => checkNext(index + 1), reviewDelay);
  }

  input.addEventListener('change', () => {
    if (scheduled === null && input.files.length) addFiles(input.files);
    input.value = '';
  });

  window.addEventListener('dragover', event => {
    if (!event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    const acceptsDrop = scheduled === null && zone.contains(event.target);
    zone.classList.toggle('is-dragging', acceptsDrop);
    event.dataTransfer.dropEffect = acceptsDrop ? 'copy' : 'none';
  });
  zone.addEventListener('dragleave', event => {
    if (!(event.relatedTarget instanceof Node) || !zone.contains(event.relatedTarget)) zone.classList.remove('is-dragging');
  });
  window.addEventListener('drop', event => {
    if (!event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    zone.classList.remove('is-dragging');
    if (scheduled === null && zone.contains(event.target) && event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
  });

  action.addEventListener('click', () => {
    if (scheduled !== null) {
      clearTimeout(scheduled);
      scheduled = null;
      progress.value = 0;
      setReviewing(false);
      status.textContent = '確認を中止しました。';
      return;
    }
    setReviewing(true);
    showErrors([]);
    status.textContent = '添付ファイルを順番に確認しています…';
    checkNext(0);
  });

  drawSelection();
}
