const BlikI18n = (() => {
  const FALLBACK = {
    en: {
      nav_home: 'Home', nav_projects: 'Projects', nav_contact: 'Contact',
      filter_all: 'All', ai_guide_title: 'AI Tour Guide', ai_guide_start: 'Start tour',
      ai_boundary: "I can chat about that briefly — I'm mainly your guide to Joseph's work here. Want to continue the tour?",
    },
    tw: {
      nav_home: 'Fie', nav_projects: 'Nnwuma', nav_contact: 'Kasa',
      filter_all: 'Nyinaa', ai_guide_title: 'AI Akwantuo', ai_guide_start: 'Fi ase',
      ai_boundary: 'Metumi akasa kakra — me yɛ Joseph nnwuma akwankyerɛfo. Yɛn toa so?',
    },
  };

  let locale = 'en';
  let strings = Object.assign({}, FALLBACK.en);

  function t(key) {
    return strings[key] || FALLBACK.en[key] || key;
  }

  function applyDom() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      if (k) el.textContent = t(k);
    });
    const sel = document.getElementById('localeSelect');
    if (sel) sel.value = locale;
  }

  async function setLocale(next) {
    locale = next || 'en';
    strings = Object.assign({}, FALLBACK.en, FALLBACK[locale] || {});
    try {
      if (typeof BlikDB !== 'undefined' && BlikDB.isConfigured()) {
        const remote = await BlikDB.fetchI18n(locale);
        if (remote && Object.keys(remote).length) strings = Object.assign(strings, remote);
      }
    } catch (e) {}
    try { localStorage.setItem('blik-locale', locale); } catch (e) {}
    document.documentElement.setAttribute('lang', locale === 'tw' ? 'ak' : locale);
    applyDom();
  }

  async function init() {
    let start = 'en';
    try { start = localStorage.getItem('blik-locale') || 'en'; } catch (e) {}
    await setLocale(start);
    const sel = document.getElementById('localeSelect');
    if (sel) sel.addEventListener('change', () => setLocale(sel.value));
  }

  return { init, t, setLocale, get locale() { return locale; } };
})();
