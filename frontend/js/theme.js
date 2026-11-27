// Theme packs (background + type tokens) + light/dark preference.
const BlikTheme = (() => {
  const PACKS = {
    'classic-matrix': {
      label: 'Classic Matrix',
      effect: 'matrix',
      vars: {
        '--green': '#39ff14',
        '--cyan': '#00f0ff',
        '--magenta': '#ff00aa',
      },
    },
    'grid-ops': {
      label: 'Grid Ops',
      effect: 'grid',
      vars: {
        '--green': '#5cffb0',
        '--cyan': '#4db8ff',
        '--magenta': '#a78bfa',
      },
    },
    'crt-terminal': {
      label: 'CRT Terminal',
      effect: 'scan',
      vars: {
        '--green': '#33ff66',
        '--cyan': '#66ff99',
        '--magenta': '#22cc55',
      },
    },
    'particle-dust': {
      label: 'Particle Dust',
      effect: 'particles',
      vars: { '--green': '#b8ff66', '--cyan': '#66e0ff', '--magenta': '#ff66cc' },
    },
    'aurora-field': {
      label: 'Aurora Field',
      effect: 'aurora',
      vars: { '--green': '#6dffb0', '--cyan': '#7ab8ff', '--magenta': '#d4a1ff' },
    },
    'blueprint': {
      label: 'Blueprint',
      effect: 'grid',
      vars: { '--green': '#4fc3f7', '--cyan': '#29b6f6', '--magenta': '#81d4fa' },
    },
    'minimal-dark': {
      label: 'Minimal Dark',
      effect: 'none',
      vars: {
        '--green': '#7CFFB2',
        '--cyan': '#9AE6FF',
        '--magenta': '#E9A8FF',
      },
    },
  };

  function applyPack(id) {
    const pack = PACKS[id] || PACKS['classic-matrix'];
    const root = document.documentElement;
    Object.entries(pack.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.setAttribute('data-fx', pack.effect);
    root.setAttribute('data-theme-pack', id);
    try { localStorage.setItem('blik-theme-pack', id); } catch (e) {}
    // Notify matrix module if present
    if (typeof BlikMatrix !== 'undefined' && BlikMatrix.setEnabled) {
      BlikMatrix.setEnabled(pack.effect === 'matrix');
    }
    const sel = document.getElementById('themePackSelect');
    if (sel && sel.value !== id) sel.value = id;
  }

  function applyColorMode(mode) {
    document.documentElement.setAttribute('data-color-mode', mode);
    try { localStorage.setItem('blik-color-mode', mode); } catch (e) {}
    const btn = document.getElementById('colorModeBtn');
    if (btn) btn.textContent = mode === 'light' ? '☀' : '☾';
  }

  function toggleColorMode() {
    const cur = document.documentElement.getAttribute('data-color-mode') || 'dark';
    applyColorMode(cur === 'dark' ? 'light' : 'dark');
  }

  async function loadRemoteDefault() {
    try {
      if (typeof BlikDB !== 'undefined' && BlikDB.isConfigured()) {
        const copy = await BlikDB.fetchSiteCopy();
        if (copy && copy.theme_pack && PACKS[copy.theme_pack]) {
          return copy.theme_pack;
        }
      }
    } catch (e) {}
    return null;
  }

  async function init() {
    let pack = null;
    try { pack = localStorage.getItem('blik-theme-pack'); } catch (e) {}
    const remote = await loadRemoteDefault();
    applyPack(pack || remote || 'classic-matrix');

    let mode = null;
    try { mode = localStorage.getItem('blik-color-mode'); } catch (e) {}
    if (!mode && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      mode = 'light';
    }
    applyColorMode(mode || 'dark');

    const btn = document.getElementById('colorModeBtn');
    if (btn) btn.addEventListener('click', toggleColorMode);

    const sel = document.getElementById('themePackSelect');
    if (sel) {
      Object.entries(PACKS).forEach(([id, p]) => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = p.label;
        sel.appendChild(opt);
      });
      sel.value = document.documentElement.getAttribute('data-theme-pack') || 'classic-matrix';
      sel.addEventListener('change', () => applyPack(sel.value));
    }
  }

  return { init, applyPack, PACKS };
})();
