const BlikVisits = (() => {
  function init() {
    try {
      const key = 'blik-visit-bumped';
      const today = new Date().toISOString().slice(0, 10);
      const prev = sessionStorage.getItem(key);
      if (prev === today) return;
      sessionStorage.setItem(key, today);
      if (typeof BlikDB !== 'undefined' && BlikDB.isConfigured()) {
        BlikDB.bumpVisit();
      }
    } catch (e) {}
  }
  return { init };
})();
