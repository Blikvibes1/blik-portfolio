// projects.js — remote/fallback grid, modal, tags filter, AI open hook
const BlikProjects = (() => {
  const FALLBACK = [
    { name: 'cyberpunk-os', desc: 'Immersive neural-interface OS: multi-window terminals, R3F 3D, multi-AI oracle.', tags: ['React', 'Three.js / R3F', 'TypeScript', 'Zustand'], demo: 'https://github.com/Blikvibes1/cyberpunk-os', repo: 'https://github.com/Blikvibes1/cyberpunk-os' },
    { name: 'datavibes-gh', desc: 'Ghana data-bundle commerce: Next.js, Prisma, Paystack, Datamart.', tags: ['Next.js', 'Prisma', 'Paystack', 'Supabase'], demo: '#', repo: '#' },
    { name: 'datavibes-runbook', desc: 'Interactive launch checklist for Datavibes GH.', tags: ['HTML/CSS/JS', 'Ops docs', 'UX'], demo: 'https://github.com/Blikvibes1/datavibes-gh-runbook', repo: 'https://github.com/Blikvibes1/datavibes-gh-runbook' },
    { name: 'atelier-systems', desc: '30 advanced creative systems — generative canvas tools.', tags: ['Canvas', 'Vanilla JS', 'Generative'], demo: 'https://github.com/Blikvibes1/freelancer-development-roadmap/tree/main/advanced-creative-systems', repo: 'https://github.com/Blikvibes1/freelancer-development-roadmap' },
    { name: 'freelancer-roadmap', desc: 'Week-by-week frontend skill builds.', tags: ['HTML', 'CSS', 'JavaScript'], demo: 'https://github.com/Blikvibes1/freelancer-development-roadmap', repo: 'https://github.com/Blikvibes1/freelancer-development-roadmap' },
    { name: 'blikmovies', desc: 'Movie discovery / search in TypeScript.', tags: ['TypeScript', 'Frontend'], demo: 'https://github.com/Blikvibes1/blikmovies', repo: 'https://github.com/Blikvibes1/blikmovies' },
    { name: 'nexus-auth', desc: 'Auth-focused TypeScript session patterns.', tags: ['TypeScript', 'Auth'], demo: 'https://github.com/Blikvibes1/nexus-auth', repo: 'https://github.com/Blikvibes1/nexus-auth' },
    { name: 'luxe-accessories', desc: 'Accessories brand frontend polish.', tags: ['TypeScript', 'UI'], demo: 'https://github.com/Blikvibes1/luxe-accessories', repo: 'https://github.com/Blikvibes1/luxe-accessories' }
  ];

  let projects = FALLBACK.slice();
  let activeTag = 'all';
  const openListeners = [];

  function onOpen(fn) { openListeners.push(fn); }

  function openModal(p) {
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.getElementById('modalClose');
    const tags = (p.tags || []).map(t => '<span class="tag">' + t + '</span>').join('');
    const cover = p.cover
      ? '<img src="' + p.cover + '" alt="" style="width:100%;max-height:180px;object-fit:cover;border-radius:6px;margin:10px 0;border:1px solid rgba(0,255,255,.25);">'
      : '';
    modalBody.innerHTML =
      '<div class="prompt-line">BLIK@SYSTEM:~$ cat ' + p.name + '/README.md</div>' +
      cover +
      '<p style="font-size:13px; color:#a8f0b6; line-height:1.7;">' + p.desc + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '<div class="proj-links" style="margin-top:16px;">' +
      '<a href="' + (p.demo || '#') + '" target="_blank" rel="noopener">./run --demo</a> ' +
      '<a href="' + (p.repo || '#') + '" target="_blank" rel="noopener">./git clone</a></div>';
    modalBackdrop.classList.add('open');
    if (modalClose) modalClose.focus();
    openListeners.forEach(fn => { try { fn(p); } catch (e) {} });
    if (typeof BlikAIGuide !== 'undefined' && BlikAIGuide.onProjectOpen) {
      BlikAIGuide.onProjectOpen(p);
    }
  }

  function closeModal() {
    const modalBackdrop = document.getElementById('modalBackdrop');
    if (modalBackdrop) modalBackdrop.classList.remove('open');
  }

  function allTags() {
    const set = new Set();
    projects.forEach(p => (p.tags || []).forEach(t => set.add(t)));
    return Array.from(set).sort();
  }

  function renderFilters() {
    const host = document.getElementById('tagFilters');
    if (!host) return;
    const labelAll = (typeof BlikI18n !== 'undefined') ? BlikI18n.t('filter_all') : 'All';
    host.innerHTML = '';
    const make = (id, label) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tag-filter' + (activeTag === id ? ' active' : '');
      b.textContent = label;
      b.addEventListener('click', () => { activeTag = id; renderFilters(); renderGrid(); });
      host.appendChild(b);
    };
    make('all', labelAll);
    allTags().forEach(t => make(t, t));
  }

  function renderGrid() {
    const projGrid = document.getElementById('projGrid');
    if (!projGrid) return;
    projGrid.innerHTML = '';
    const list = activeTag === 'all'
      ? projects
      : projects.filter(p => (p.tags || []).includes(activeTag));
    list.forEach(p => {
      const card = document.createElement('div');
      card.className = 'terminal-window proj-card';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      const snippet = (p.desc || '').slice(0, 140) + ((p.desc || '').length > 140 ? '…' : '');
      const tags = (p.tags || []).map(t => '<span class="tag">' + t + '</span>').join('');
      const cover = p.cover
        ? '<img class="proj-cover" src="' + p.cover + '" alt="">'
        : '';
      card.innerHTML =
        '<div class="term-bar"><div class="left" style="color:var(--green);">./' + p.name + '</div>' +
        '<div class="term-dots"><span class="r"></span><span class="y"></span><span class="g"></span></div></div>' +
        '<div class="term-body">' + cover +
        '<p style="font-size:12.5px; color:#9fd; line-height:1.55; margin:0 0 10px;">' + snippet + '</p>' +
        '<div class="tag-row">' + tags + '</div></div>';
      card.addEventListener('click', () => openModal(p));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(p); }
      });
      projGrid.appendChild(card);
    });
  }

  async function load() {
    try {
      if (typeof BlikDB !== 'undefined' && BlikDB.isConfigured()) {
        const remote = await BlikDB.fetchPublishedProjects();
        if (remote && remote.length) projects = remote;
      }
    } catch (e) {}
    renderFilters();
    renderGrid();
  }

  function init() {
    load();
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalClose = document.getElementById('modalClose');
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', e => {
      if (e.target === modalBackdrop) closeModal();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  }

  return {
    init,
    onOpen,
    get projects() { return projects; },
    reload: load,
  };
})();
