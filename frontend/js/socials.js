// Renders active social links from Supabase (or keeps static fallbacks).
const BlikSocials = (() => {
  const ICONS = {
    github: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.67.42.36.79 1.08.79 2.18 0 1.57-.01 2.84-.01 3.23 0 .31.21.68.8.56A10.53 10.53 0 0 0 23.5 12C23.5 5.74 18.27.5 12 .5z"/></svg>',
    linkedin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4V8.5zM8.5 8.5h3.8v2h.05c.53-1 1.82-2.05 3.75-2.05 4 0 4.75 2.63 4.75 6.05V23h-4v-6.6c0-1.57-.03-3.6-2.2-3.6-2.2 0-2.54 1.72-2.54 3.5V23h-4V8.5z"/></svg>',
    x: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.57l-5.15-6.73L5.2 22H1.94l8.03-9.17L1.5 2h6.74l4.66 6.18L18.244 2zm-1.15 18h1.82L7.02 3.94H5.07L17.09 20z"/></svg>',
    email: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z"/></svg>',
  };

  const FALLBACK = [
    { network: 'github', label: 'GitHub', url: 'https://github.com/Blikvibes1' },
  ];

  function render(list) {
    const row = document.querySelector('.social-row');
    if (!row) return;
    row.innerHTML = '';
    (list || []).forEach(s => {
      if (!s.url) return;
      const a = document.createElement('a');
      a.className = 'social-btn';
      a.href = s.url;
      a.target = s.url.startsWith('mailto:') ? '_self' : '_blank';
      a.rel = 'noopener';
      a.setAttribute('aria-label', s.label || s.network);
      a.title = s.label || s.network;
      a.innerHTML = ICONS[s.network] || s.label || s.network;
      row.appendChild(a);
    });
  }

  async function load() {
    let list = FALLBACK;
    try {
      if (typeof BlikDB !== 'undefined' && BlikDB.isConfigured()) {
        const remote = await BlikDB.fetchActiveSocials();
        if (remote && remote.length) list = remote;
      }
    } catch (e) {
      console.warn('[BLIK] socials fallback', e);
    }
    render(list);
  }

  function init() { load(); }
  return { init };
})();
