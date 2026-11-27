const BlikBlog = (() => {
  let posts = [];

  async function load() {
    const host = document.getElementById('blogGrid');
    if (!host) return;
    try {
      if (typeof BlikDB !== 'undefined' && BlikDB.isConfigured()) {
        const sb = BlikDB.getClient();
        if (sb) {
          const { data, error } = await sb
            .from('posts')
            .select('id,title,slug,body,cover_url,locale,sort_order')
            .eq('published', true)
            .order('sort_order', { ascending: true });
          if (!error && data) posts = data;
        }
      }
    } catch (e) {}
    render();
  }

  function render() {
    const host = document.getElementById('blogGrid');
    const section = document.getElementById('blog');
    if (!host) return;
    if (!posts.length) {
      if (section) section.hidden = true;
      return;
    }
    if (section) section.hidden = false;
    host.innerHTML = '';
    posts.forEach(p => {
      const card = document.createElement('article');
      card.className = 'terminal-window blog-card';
      const cover = p.cover_url
        ? '<img class="proj-cover" src="' + p.cover_url + '" alt="">'
        : '';
      const excerpt = (p.body || '').slice(0, 160) + ((p.body || '').length > 160 ? '…' : '');
      card.innerHTML =
        '<div class="term-bar"><div class="left" style="color:var(--cyan);">./' + (p.slug || 'post') + '</div></div>' +
        '<div class="term-body">' + cover +
        '<h3 style="margin:0 0 8px;font-family:Orbitron,sans-serif;font-size:14px;">' + escapeHtml(p.title) + '</h3>' +
        '<p style="font-size:12.5px;color:#9fd;line-height:1.55;margin:0;">' + escapeHtml(excerpt) + '</p></div>';
      card.tabIndex = 0;
      card.addEventListener('click', () => openPost(p));
      host.appendChild(card);
    });
  }

  function escapeHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function openPost(p) {
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalBody = document.getElementById('modalBody');
    if (!modalBackdrop || !modalBody) return;
    const cover = p.cover_url
      ? '<img src="' + p.cover_url + '" alt="" style="width:100%;max-height:200px;object-fit:cover;border-radius:6px;margin:10px 0;">'
      : '';
    modalBody.innerHTML =
      '<div class="prompt-line">BLIK@SYSTEM:~$ cat posts/' + escapeHtml(p.slug) + '.md</div>' +
      cover +
      '<h3 style="color:var(--cyan);">' + escapeHtml(p.title) + '</h3>' +
      '<div style="font-size:13px;color:#a8f0b6;line-height:1.7;white-space:pre-wrap;">' + escapeHtml(p.body) + '</div>';
    modalBackdrop.classList.add('open');
  }

  function init() { load(); }
  return { init, reload: load };
})();
