const paths = {
  code: '<path d="m8 5-7 7 7 7m8-14 7 7-7 7m-2-18-4 22"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/>',
  bookmark: '<path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4Z"/>',
  file: '<path d="M14 2H5v20h14V7Z"/><path d="M14 2v6h5M8 12h8m-8 4h6"/>',
  type: '<path d="M4 6V3h16v3M12 3v18m-4 0h8"/>',
  layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18m-11 0v12"/>',
  cursor: '<path d="m4 3 6 18 3-8 8-3Z"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m21 15-6-6-9 12"/>',
  sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4M3 19v3m-1.5-1.5h3"/>',
  'arrow-up-right': '<path d="M6 18 18 6M6 6h12v12"/>',
  'arrow-down': '<path d="M12 4v16m-6-6 6 6 6-6"/>',
  github: '<path d="M9 19c-4 1-4-2-6-2m12 5v-4a3.5 3.5 0 0 0-1-2.5c3.3-.4 6.7-1.6 6.7-7a5.5 5.5 0 0 0-1.5-3.8 5.3 5.3 0 0 0-.1-3.7S17.9.6 15 2.5a13.5 13.5 0 0 0-6 0C6.1.6 4.9 1 4.9 1a5.3 5.3 0 0 0-.1 3.7 5.5 5.5 0 0 0-1.5 3.8c0 5.4 3.4 6.6 6.7 7A3.5 3.5 0 0 0 9 18v4"/>',
  book: '<path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v15"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 1 1 4.4 1.9c-1 .7-1.9 1.3-1.9 2.6M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  search: '<circle cx="10.8" cy="10.8" r="7.3"/><path d="m16 16 5 5"/>',
  shuffle: '<path d="m18 3 3 3-3 3M3 6h3c6 0 6 12 12 12h3m-3-3 3 3-3 3M3 18h3c2.5 0 3.8-2 5-5m2-3c1.2-2.5 2.5-4 5-4h3"/>',
  sliders: '<path d="M4 7h6m4 0h6M4 17h10m4 0h2"/><circle cx="12" cy="7" r="2"/><circle cx="16" cy="17" r="2"/>',
  x: '<path d="m6 6 12 12M6 18 18 6"/>',
  sprout: '<path d="M12 22V12m0 4C3 16 2 9 2 9s10-2 10 7Zm0-4C12 3 21 2 21 2s1 10-9 10Z"/>',
  link: '<path d="m10 13 4-4m-7 5-2 2a4 4 0 0 0 6 6l4-4a4 4 0 0 0 0-6m2-2 2-2a4 4 0 0 0-6-6L9 6a4 4 0 0 0 0 6" transform="translate(0 -1)"/>',
  reset: '<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  shield: '<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Zm-4 9 3 3 5-5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon: '<path d="M20.5 13.3A9 9 0 0 1 10.7 3.5a9 9 0 1 0 9.8 9.8Z"/>',
};

export function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.code}</svg>`;
}

export function hydrateIcons(root = document) {
  for (const node of root.querySelectorAll('[data-icon]')) {
    const markup = icon(node.dataset.icon);
    if (node.className) {
      node.innerHTML = markup;
      node.removeAttribute('data-icon');
    } else node.replaceWith(document.createRange().createContextualFragment(markup));
  }
}
