export function collectionParams(params) {
  const filters = new URLSearchParams();
  const group = params.get('group');
  const query = params.get('find')?.trim();
  if (group === 'parts' || group === 'pages') filters.set('group', group);
  if (query) filters.set('find', query);
  return filters;
}

export function collectionHref(params) {
  const filters = collectionParams(params).toString();
  return filters ? `./practice.html?${filters}` : './practice.html';
}

export function routeHref(params, key, value) {
  const next = new URLSearchParams(params);
  next.set(key, value);
  return `?${next}`;
}
