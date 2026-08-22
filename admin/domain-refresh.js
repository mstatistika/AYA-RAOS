(() => {
  'use strict';
  const liveDomains = new Set(['products','b2b','finance']);
  const button = document.getElementById('refreshBtn');
  if (!button) return;
  button.addEventListener('click', () => {
    const active = document.querySelector('.page.active')?.dataset.page;
    if (!liveDomains.has(active)) return;
    window.setTimeout(() => document.querySelector(`[data-go="${active}"]`)?.click(), 120);
  });
})();