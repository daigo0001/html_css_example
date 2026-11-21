const focusable = 'a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]';
const space = value => value.replace(/\s+/g, ' ').trim();

function nameText(node, referenced = false) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (!(node instanceof Element)) return '';
  if (!referenced && node.matches('[hidden], [aria-hidden="true"], svg')) return '';
  if (node.matches('img')) return node.alt;
  return [...node.childNodes].map(child => nameText(child, referenced)).join(' ');
}

function nameOf(element) {
  const labelledBy = element.getAttribute('aria-labelledby')?.trim();
  if (labelledBy) {
    const name = space(labelledBy.split(/\s+/).map(id => {
      const label = element.ownerDocument.getElementById(id);
      return label ? nameText(label, true) : '';
    }).join(' '));
    if (name) return { name, source: 'aria-labelledby' };
  }

  const ariaLabel = space(element.getAttribute('aria-label') || '');
  if (ariaLabel) return { name: ariaLabel, source: 'aria-label' };

  if (element.labels?.length) {
    const name = space([...element.labels].map(label => nameText(label)).join(' '));
    if (name) return { name, source: 'label' };
  }

  if (element.matches('input[type="image"]') && element.alt) return { name: element.alt, source: 'alt' };
  if (element.matches('input[type="button"], input[type="submit"], input[type="reset"]') && element.value) {
    return { name: element.value, source: 'value' };
  }

  if (element.matches('a, button, summary, h1, h2, h3, h4, h5, h6, [role="button"], [role="tab"], [role="link"]')) {
    const name = space(nameText(element));
    if (name) return { name, source: 'テキスト' };
  }

  const title = space(element.getAttribute('title') || '');
  if (title) return { name: title, source: 'title' };
  const placeholder = space(element.getAttribute('placeholder') || '');
  if (placeholder && element.matches('input, textarea')) return { name: placeholder, source: 'placeholder' };

  return { name: '名前を確認できません', source: '' };
}

function isTabTarget(element) {
  if (element.matches(':disabled, input[type="hidden"]') || element.closest('[inert], [hidden]')) {
    return false;
  }
  const defaultStop = !element.hasAttribute('tabindex') && element.matches('summary, [contenteditable="true"]');
  if (element.tabIndex < 0 && !defaultStop) return false;

  if (element.matches('summary') && element.parentElement.querySelector(':scope > summary') !== element) return false;
  for (let details = element.closest('details:not([open])'); details; details = details.parentElement?.closest('details:not([open])')) {
    const summary = details.querySelector(':scope > summary');
    if (!summary?.contains(element)) return false;
  }

  return element.getClientRects().length > 0 && getComputedStyle(element).visibility === 'visible';
}

function radioStops(elements) {
  const groups = new Map();
  for (const radio of elements.filter(element => element.matches('input[type="radio"][name]') && element.name)) {
    const owner = radio.form || radio.getRootNode();
    if (!groups.has(owner)) groups.set(owner, new Map());
    const names = groups.get(owner);
    if (!names.has(radio.name)) names.set(radio.name, []);
    names.get(radio.name).push(radio);
  }

  const skipped = new Set();
  for (const names of groups.values()) {
    for (const radios of names.values()) {
      const stop = radios.find(radio => radio.checked) || radios[0];
      for (const radio of radios) if (radio !== stop) skipped.add(radio);
    }
  }
  return elements.filter(element => !skipped.has(element));
}

function getTabTargets(scope) {
  const modal = CSS.supports('selector(:modal)')
    ? [...scope.querySelectorAll('dialog:modal')].at(-1)
    : scope.querySelector('dialog[open]');
  const candidates = [...(modal || scope).querySelectorAll(focusable)].filter(isTabTarget);
  const priority = element => element.tabIndex > 0 ? element.tabIndex : Infinity;
  return radioStops(candidates).sort((a, b) => priority(a) - priority(b) || 0);
}

function describe(element) {
  const type = element.matches('input') ? `input[type=${element.type}]` : element.localName;
  return { ...nameOf(element), type };
}

function listRow(item) {
  const row = document.createElement('li');
  const name = document.createElement('strong');
  name.textContent = item.name;
  const meta = document.createElement('span');
  meta.textContent = [item.type, item.source].filter(Boolean).join(' · ');
  row.append(name, meta);
  return row;
}

export function mountAccessibilityCheck(scope, toggle, position) {
  const panel = document.createElement('section');
  panel.id = 'demo-a11y-panel';
  panel.className = 'a11y-inspector practice-inventory';
  panel.hidden = true;
  panel.setAttribute('aria-labelledby', 'demo-a11y-title');
  panel.innerHTML = `
    <div class="a11y-inspector-heading">
      <h2 id="demo-a11y-title">アクセシビリティ確認</h2>
      <button class="text-button" type="button" data-a11y-close>閉じる</button>
    </div>
    <p class="a11y-explanation">デモ内のTab移動順と、ラベルなどから分かる名前の目安を表示します。フォーカスの履歴には、実際に移動した場所が残ります。</p>
    <div class="a11y-current">
      <p>現在のフォーカス</p>
      <strong id="demo-a11y-current"></strong>
      <span id="demo-a11y-source"></span>
    </div>
    <button class="outline-button" type="button" data-a11y-start>最初のパーツへ移動</button>
    <details open>
      <summary>Tabの移動順 <span id="demo-a11y-count"></span></summary>
      <ol id="demo-a11y-order" class="a11y-list"></ol>
    </details>
    <details open>
      <summary>フォーカスの履歴（新しい順）</summary>
      <p id="demo-a11y-empty" class="a11y-explanation">デモ内で操作すると履歴が表示されます。</p>
      <ol id="demo-a11y-history" class="a11y-list"></ol>
    </details>
  `;
  position.prepend(panel);
  toggle.setAttribute('aria-controls', panel.id);
  toggle.setAttribute('aria-expanded', 'false');
  toggle.hidden = false;

  const currentLabel = panel.querySelector('#demo-a11y-current');
  const currentSource = panel.querySelector('#demo-a11y-source');
  const count = panel.querySelector('#demo-a11y-count');
  const order = panel.querySelector('#demo-a11y-order');
  const history = panel.querySelector('#demo-a11y-history');
  const empty = panel.querySelector('#demo-a11y-empty');
  const start = panel.querySelector('[data-a11y-start]');
  let focused = null;
  let frame;
  let signature = '';

  function inScope(element) {
    return element instanceof HTMLElement && scope.contains(element);
  }

  function update() {
    const targets = getTabTargets(scope);
    const active = inScope(document.activeElement) ? document.activeElement : null;
    if (focused !== active) {
      focused?.removeAttribute('data-a11y-current');
      active?.setAttribute('data-a11y-current', '');
      focused = active;
    }

    const current = active ? describe(active) : null;
    currentLabel.textContent = current?.name || 'デモ内のパーツを選んでください';
    currentSource.textContent = current ? [current.type, current.source].filter(Boolean).join(' · ') : '';
    start.disabled = targets.length === 0;
    count.textContent = `${targets.length}件`;
    const entries = targets.map(target => ({ ...describe(target), active: target === active }));
    const nextSignature = JSON.stringify(entries);
    if (signature !== nextSignature) {
      signature = nextSignature;
      order.replaceChildren(...entries.map(item => {
        const row = listRow(item);
        if (item.active) row.setAttribute('aria-current', 'true');
        return row;
      }));
    }
  }

  function scheduleUpdate() {
    if (panel.hidden || frame !== undefined) return;
    frame = requestAnimationFrame(() => {
      frame = undefined;
      update();
    });
  }

  function trackFocus(event) {
    if (panel.hidden) return;
    if (inScope(event.target)) {
      history.prepend(listRow(describe(event.target)));
      if (history.children.length > 10) history.lastElementChild.remove();
      empty.hidden = true;
    }
    scheduleUpdate();
  }

  const observer = new MutationObserver(scheduleUpdate);
  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      observer.observe(scope, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['hidden', 'disabled', 'open', 'tabindex', 'inert', 'aria-label', 'aria-labelledby', 'checked', 'style', 'class', 'href', 'title'],
      });
      update();
      panel.scrollIntoView({ block: 'nearest' });
    } else {
      observer.disconnect();
      cancelAnimationFrame(frame);
      frame = undefined;
      focused?.removeAttribute('data-a11y-current');
      focused = null;
    }
  }

  toggle.addEventListener('click', () => setOpen(panel.hidden));
  panel.querySelector('[data-a11y-close]').addEventListener('click', () => {
    setOpen(false);
    toggle.focus();
  });
  start.addEventListener('click', () => getTabTargets(scope)[0]?.focus());
  document.addEventListener('focusin', trackFocus);
  document.addEventListener('focusout', scheduleUpdate);
  scope.addEventListener('change', scheduleUpdate);
  window.addEventListener('resize', scheduleUpdate);
}
