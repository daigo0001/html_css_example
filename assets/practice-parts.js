export function partTag(tag) {
  const code = document.createElement('code');
  code.className = 'practice-tag';
  code.textContent = tag;
  return code;
}

export function mountPartsList(list, parts, selectPart) {
  const buttons = new Map();
  for (const [key, part] of Object.entries(parts)) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    const tags = document.createElement('span');
    button.type = 'button';
    button.className = 'practice-part-button';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', part.label);
    button.addEventListener('click', () => selectPart(key));
    tags.className = 'practice-tags';
    tags.append(...part.tags.map(partTag));
    button.append(part.label, tags);
    item.append(button);
    list.append(item);
    buttons.set(key, button);
  }

  return key => {
    for (const [partKey, button] of buttons) button.setAttribute('aria-pressed', String(partKey === key));
  };
}
