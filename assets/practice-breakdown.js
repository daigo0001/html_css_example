const colors = ['var(--flow-search)', 'var(--flow-direct)', 'var(--flow-referral)'];
const formatCount = new Intl.NumberFormat('ja-JP');
const formatShare = new Intl.NumberFormat('ja-JP', { style: 'percent', maximumFractionDigits: 1 });

export function mountBreakdown(host, { inspectParts = false } = {}) {
  const template = document.querySelector('#lab-breakdown-template');
  host.append(template.content.cloneNode(true));
  const figure = host.querySelector('figure');
  const pie = figure.querySelector('.lab-pie');
  const caption = figure.querySelector('figcaption');
  const table = host.querySelector('table');
  const rows = [...table.tBodies[0].rows];
  if (inspectParts) {
    figure.dataset.practicePart = 'chart';
    table.dataset.practicePart = 'table';
  }

  return counts => {
    const total = counts.reduce((sum, count) => sum + count, 0);
    const slices = [];
    let offset = 0;
    for (const [index, count] of counts.entries()) {
      rows[index].cells[1].textContent = formatCount.format(count);
      rows[index].cells[2].textContent = total ? formatShare.format(count / total) : '—';
      if (!count) continue;
      const start = offset / total * 100;
      offset += count;
      const end = offset / total * 100;
      slices.push({ color: colors[index], range: `${start}% ${end}%` });
    }

    pie.style.backgroundImage = slices.length > 1
      ? `conic-gradient(${slices.map(({ color, range }) => `${color} ${range}`).join(', ')})`
      : '';
    pie.style.backgroundColor = slices.length === 1 ? slices[0].color : '';
    caption.textContent = total ? `合計 ${formatCount.format(total)}件` : 'データなし（0件）';
    return total;
  };
}
