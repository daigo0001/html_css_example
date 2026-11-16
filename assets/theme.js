// CSSより先に適用し、保存済みテーマと異なる色が一瞬表示されるのを防ぐ。
(() => {
  let preference;
  try { preference = localStorage.getItem('web-notes:theme:v1'); } catch { /* 保存禁止でもOS設定を使える。 */ }
  const theme = ['light', 'dark'].includes(preference)
    ? preference : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#111a16' : '#f7f8f4';
})();
