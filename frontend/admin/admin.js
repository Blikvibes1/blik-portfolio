(() => {
  const statusLine = document.getElementById('statusLine');
  const loginView = document.getElementById('loginView');
  const appView = document.getElementById('appView');
  const loginError = document.getElementById('loginError');
  const editError = document.getElementById('editError');
  const dialog = document.getElementById('editDialog');
  let sb = null;
  let cache = { projects: [], skills: [], timeline: [], socials: [], posts: [] };

  function cfgOk() {
    const c = window.BLIK_CONFIG || {};
    return Boolean(c.supabaseUrl && c.supabaseAnonKey);
  }

  function client() {
    if (sb) return sb;
    if (!cfgOk() || !window.supabase) return null;
    sb = window.supabase.createClient(window.BLIK_CONFIG.supabaseUrl, window.BLIK_CONFIG.supabaseAnonKey);
    return sb;
  }

  function setStatus(msg) { statusLine.textContent = msg || ''; }

  function showApp(on) {
    loginView.hidden = on;
    appView.hidden = !on;
    document.getElementById('btnLogout').hidden = !on;
  }

  function escapeHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function slugify(name) {
    return String(name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'project';
  }

  function switchTab(name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.tab-panel').forEach(p => { p.hidden = p.id !== 'panel-' + name; });
  }

  document.getElementById('tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (btn) switchTab(btn.dataset.tab);
  });

  async function loadAll() {
    const c = client();
    setStatus('Loading…');
    const [p, s, t, soc, postsRes, copy] = await Promise.all([
      c.from('projects').select('*').order('sort_order'),
      c.from('skills').select('*').order('sort_order'),
      c.from('timeline').select('*').order('sort_order'),
      c.from('social_links').select('*').order('sort_order'),
      c.from('posts').select('*').order('sort_order'),
      c.from('site_copy').select('key,value'),
    ]);
    if (p.error || s.error || t.error || (soc && soc.error) || (postsRes && postsRes.error)) {
      setStatus('Error: ' + (p.error || s.error || t.error || (soc && soc.error) || postsRes.error).message);
      return;
    }
    cache.projects = p.data || [];
    cache.skills = s.data || [];
    cache.timeline = t.data || [];
    cache.socials = (soc && soc.data) || [];
    cache.posts = (postsRes && postsRes.data) || [];
    setStatus(cache.projects.length + ' projects · ' + cache.skills.length + ' skills · ' + cache.timeline.length + ' timeline · ' + cache.socials.length + ' socials');
    renderProjects();
    renderSkills();
    renderTimeline();
    renderSocials();
    renderPosts();
    const map = {};
    (copy.data || []).forEach(r => { map[r.key] = r.value; });
    document.getElementById('copyHero').value = map.hero_tagline || '';
    document.getElementById('copyAbout').value = map.about_bio || '';
    document.getElementById('copyFooter').value = map.footer_text || '';
    const photo = document.getElementById('copyPhoto');
    if (photo) photo.value = map.profile_photo_url || '';
    const st = document.getElementById('copySeoTitle');
    if (st) st.value = map.seo_title || '';
    const sd = document.getElementById('copySeoDesc');
    if (sd) sd.value = map.seo_description || '';
    const th = document.getElementById('copyTheme');
    if (th) th.value = map.theme_pack || 'classic-matrix';
    const ge = document.getElementById('gateEnabled');
    if (ge) ge.checked = map.admin_gate_enabled === 'true';
  }

  function renderPosts() {
    const tbody = document.getElementById('postTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    cache.posts.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + row.sort_order + '</td>' +
        '<td><strong>' + escapeHtml(row.title) + '</strong><div class="muted small">' + escapeHtml(row.slug) + '</div></td>' +
        '<td><span class="badge ' + (row.published ? 'on' : 'off') + '">' + (row.published ? 'LIVE' : 'DRAFT') + '</span></td>' +
        '<td>' + escapeHtml(row.locale || 'en') + '</td>' +
        '<td class="row-actions">' +
        '<button type="button" class="ghost" data-edit-post="' + row.id + '">Edit</button> ' +
        '<button type="button" class="ghost" data-del-post="' + row.id + '">Delete</button></td>';
      tbody.appendChild(tr);
    });
  }

  function renderSocials() {
    const tbody = document.getElementById('socialTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    cache.socials.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td><strong>' + escapeHtml(row.label) + '</strong><div class="muted small">' + escapeHtml(row.network) + '</div></td>' +
        '<td><input data-social-url="' + row.id + '" value="' + escapeHtml(row.url) + '" style="width:100%;min-width:180px;background:#060a07;border:1px solid var(--border);color:var(--text);padding:6px 8px;border-radius:4px;font:inherit;"></td>' +
        '<td><label class="row-check"><input type="checkbox" data-social-active="' + row.id + '" ' + (row.active ? 'checked' : '') + '> On</label></td>' +
        '<td><button type="button" class="primary" data-social-save="' + row.id + '">Save</button></td>';
      tbody.appendChild(tr);
    });
  }

  function renderProjects() {
    const tbody = document.getElementById('projTable');
    tbody.innerHTML = '';
    cache.projects.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + row.sort_order + '</td>' +
        '<td><strong>' + escapeHtml(row.name) + '</strong><div class="muted small">' + escapeHtml(row.slug) + '</div></td>' +
        '<td><span class="badge ' + (row.published ? 'on' : 'off') + '">' + (row.published ? 'LIVE' : 'DRAFT') + '</span></td>' +
        '<td class="muted small">' + escapeHtml((row.tags || []).join(', ')) + '</td>' +
        '<td class="row-actions">' +
        '<button type="button" class="ghost" data-edit-project="' + row.id + '">Edit</button> ' +
        '<button type="button" class="ghost" data-del-project="' + row.id + '">Delete</button></td>';
      tbody.appendChild(tr);
    });
  }

  function renderSkills() {
    const tbody = document.getElementById('skillTable');
    tbody.innerHTML = '';
    cache.skills.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + row.sort_order + '</td>' +
        '<td>' + escapeHtml(row.label) + '</td>' +
        '<td><span class="badge ' + (row.published ? 'on' : 'off') + '">' + (row.published ? 'LIVE' : 'DRAFT') + '</span></td>' +
        '<td class="row-actions">' +
        '<button type="button" class="ghost" data-edit-skill="' + row.id + '">Edit</button> ' +
        '<button type="button" class="ghost" data-del-skill="' + row.id + '">Delete</button></td>';
      tbody.appendChild(tr);
    });
  }

  function renderTimeline() {
    const tbody = document.getElementById('tlTable');
    tbody.innerHTML = '';
    cache.timeline.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + row.sort_order + '</td>' +
        '<td>' + escapeHtml(row.date_label) + '</td>' +
        '<td>' + escapeHtml(row.role) + '</td>' +
        '<td><span class="badge ' + (row.published ? 'on' : 'off') + '">' + (row.published ? 'LIVE' : 'DRAFT') + '</span></td>' +
        '<td class="row-actions">' +
        '<button type="button" class="ghost" data-edit-tl="' + row.id + '">Edit</button> ' +
        '<button type="button" class="ghost" data-del-tl="' + row.id + '">Delete</button></td>';
      tbody.appendChild(tr);
    });
  }

  function showFields(kind) {
    document.getElementById('fieldsProject').hidden = kind !== 'project';
    document.getElementById('fieldsSkill').hidden = kind !== 'skill';
    document.getElementById('fieldsTimeline').hidden = kind !== 'timeline';
    const fp = document.getElementById('fieldsPost');
    if (fp) fp.hidden = kind !== 'post';
  }

  function openProject(row) {
    editError.textContent = '';
    document.getElementById('fKind').value = 'project';
    showFields('project');
    document.getElementById('editTitle').textContent = row && row.id ? 'Edit project' : 'New project';
    document.getElementById('fId').value = (row && row.id) || '';
    document.getElementById('fName').value = (row && row.name) || '';
    document.getElementById('fSlug').value = (row && row.slug) || '';
    document.getElementById('fDesc').value = (row && row.description) || '';
    document.getElementById('fTags').value = ((row && row.tags) || []).join(', ');
    document.getElementById('fDemo').value = (row && row.demo_url) || '';
    document.getElementById('fRepo').value = (row && row.repo_url) || '';
    document.getElementById('fCover').value = (row && row.cover_url) || '';
    document.getElementById('fSort').value = row && row.sort_order != null ? row.sort_order : 0;
    document.getElementById('fPublished').checked = Boolean(row && row.published);
    dialog.showModal();
  }

  function openSkill(row) {
    editError.textContent = '';
    document.getElementById('fKind').value = 'skill';
    showFields('skill');
    document.getElementById('editTitle').textContent = row && row.id ? 'Edit skill' : 'New skill';
    document.getElementById('fId').value = (row && row.id) || '';
    document.getElementById('fSkillLabel').value = (row && row.label) || '';
    document.getElementById('fSort').value = row && row.sort_order != null ? row.sort_order : 0;
    document.getElementById('fPublished').checked = row ? Boolean(row.published) : true;
    dialog.showModal();
  }

  function openPost(row) {
    editError.textContent = '';
    document.getElementById('fKind').value = 'post';
    showFields('post');
    document.getElementById('editTitle').textContent = row && row.id ? 'Edit post' : 'New post';
    document.getElementById('fId').value = (row && row.id) || '';
    document.getElementById('fPostTitle').value = (row && row.title) || '';
    document.getElementById('fPostSlug').value = (row && row.slug) || '';
    document.getElementById('fPostBody').value = (row && row.body) || '';
    document.getElementById('fPostCover').value = (row && row.cover_url) || '';
    document.getElementById('fPostLocale').value = (row && row.locale) || 'en';
    document.getElementById('fSort').value = row && row.sort_order != null ? row.sort_order : 0;
    document.getElementById('fPublished').checked = Boolean(row && row.published);
    dialog.showModal();
  }

  function openTimeline(row) {
    editError.textContent = '';
    document.getElementById('fKind').value = 'timeline';
    showFields('timeline');
    document.getElementById('editTitle').textContent = row && row.id ? 'Edit timeline' : 'New timeline';
    document.getElementById('fId').value = (row && row.id) || '';
    document.getElementById('fDate').value = (row && row.date_label) || '';
    document.getElementById('fRole').value = (row && row.role) || '';
    document.getElementById('fTlDesc').value = (row && row.description) || '';
    document.getElementById('fSort').value = row && row.sort_order != null ? row.sort_order : 0;
    document.getElementById('fPublished').checked = row ? Boolean(row.published) : true;
    dialog.showModal();
  }

  appView.addEventListener('click', async (e) => {
    const t = e.target;
    if (t.dataset.editProject) openProject(cache.projects.find(r => r.id === t.dataset.editProject));
    if (t.dataset.editSkill) openSkill(cache.skills.find(r => r.id === t.dataset.editSkill));
    if (t.dataset.editTl) openTimeline(cache.timeline.find(r => r.id === t.dataset.editTl));
    if (t.dataset.delProject) {
      if (!confirm('Delete project?')) return;
      await client().from('projects').delete().eq('id', t.dataset.delProject);
      await loadAll();
    }
    if (t.dataset.delSkill) {
      if (!confirm('Delete skill?')) return;
      await client().from('skills').delete().eq('id', t.dataset.delSkill);
      await loadAll();
    }
    if (t.dataset.delTl) {
      if (!confirm('Delete timeline entry?')) return;
      await client().from('timeline').delete().eq('id', t.dataset.delTl);
      await loadAll();
    }
    if (t.dataset.socialSave) {
      const id = t.dataset.socialSave;
      const urlInput = document.querySelector('[data-social-url="' + id + '"]');
      const activeInput = document.querySelector('[data-social-active="' + id + '"]');
      await client().from('social_links').update({
        url: (urlInput && urlInput.value.trim()) || '',
        active: Boolean(activeInput && activeInput.checked),
      }).eq('id', id);
      await loadAll();
    }
  });

  document.getElementById('btnNewProject').addEventListener('click', () => {
    const next = cache.projects.reduce((m, r) => Math.max(m, r.sort_order), -1) + 1;
    openProject({ sort_order: next, published: false, tags: [], demo_url: '#', repo_url: '#' });
  });
  document.getElementById('btnNewSkill').addEventListener('click', () => {
    const next = cache.skills.reduce((m, r) => Math.max(m, r.sort_order), -1) + 1;
    openSkill({ sort_order: next, published: true });
  });
  const btnNewPost = document.getElementById('btnNewPost');
  if (btnNewPost) btnNewPost.addEventListener('click', () => {
    const next = cache.posts.reduce((m, r) => Math.max(m, r.sort_order), -1) + 1;
    openPost({ sort_order: next, published: false, locale: 'en', body: '', cover_url: '' });
  });

  document.getElementById('btnNewTimeline').addEventListener('click', () => {
    const next = cache.timeline.reduce((m, r) => Math.max(m, r.sort_order), -1) + 1;
    openTimeline({ sort_order: next, published: true });
  });

  document.getElementById('btnCancel').addEventListener('click', () => dialog.close());

  document.getElementById('fName').addEventListener('blur', () => {
    const slug = document.getElementById('fSlug');
    if (!slug.value) slug.value = slugify(document.getElementById('fName').value);
  });

  document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    editError.textContent = '';
    const c = client();
    const kind = document.getElementById('fKind').value;
    const id = document.getElementById('fId').value;
    const published = document.getElementById('fPublished').checked;
    const sort_order = Number(document.getElementById('fSort').value) || 0;
    let table, payload;
    if (kind === 'project') {
      table = 'projects';
      payload = {
        name: document.getElementById('fName').value.trim(),
        slug: document.getElementById('fSlug').value.trim(),
        description: document.getElementById('fDesc').value.trim(),
        tags: document.getElementById('fTags').value.split(',').map(s => s.trim()).filter(Boolean),
        demo_url: document.getElementById('fDemo').value.trim() || '#',
        repo_url: document.getElementById('fRepo').value.trim() || '#',
        cover_url: document.getElementById('fCover').value.trim() || null,
        sort_order, published,
      };
    } else if (kind === 'skill') {
      table = 'skills';
      payload = { label: document.getElementById('fSkillLabel').value.trim(), sort_order, published };
    } else if (kind === 'post') {
      table = 'posts';
      payload = {
        title: document.getElementById('fPostTitle').value.trim(),
        slug: document.getElementById('fPostSlug').value.trim() || slugify(document.getElementById('fPostTitle').value),
        body: document.getElementById('fPostBody').value,
        cover_url: document.getElementById('fPostCover').value.trim() || null,
        locale: document.getElementById('fPostLocale').value.trim() || 'en',
        sort_order, published,
      };
    } else {
      table = 'timeline';
      payload = {
        date_label: document.getElementById('fDate').value.trim(),
        role: document.getElementById('fRole').value.trim(),
        description: document.getElementById('fTlDesc').value.trim(),
        sort_order, published,
      };
    }
    const res = id
      ? await c.from(table).update(payload).eq('id', id)
      : await c.from(table).insert(payload);
    if (res.error) {
      editError.textContent = res.error.message;
      return;
    }
    await logAction('save', kind, id || 'new', payload.name || payload.label || '');
    dialog.close();
    await loadAll();
  });

  document.getElementById('copyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const c = client();
    const rows = [
      { key: 'hero_tagline', value: document.getElementById('copyHero').value },
      { key: 'about_bio', value: document.getElementById('copyAbout').value },
      { key: 'footer_text', value: document.getElementById('copyFooter').value },
      { key: 'profile_photo_url', value: (document.getElementById('copyPhoto') || {}).value || '' },
      { key: 'seo_title', value: (document.getElementById('copySeoTitle') || {}).value || '' },
      { key: 'seo_description', value: (document.getElementById('copySeoDesc') || {}).value || '' },
      { key: 'theme_pack', value: (document.getElementById('copyTheme') || {}).value || 'classic-matrix' },
    ];
    const { error } = await c.from('site_copy').upsert(rows);
    document.getElementById('copyStatus').textContent = error ? error.message : 'Saved.';
  });

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const c = client();
    if (!c) { loginError.textContent = 'Configure Supabase keys first.'; return; }
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const { error } = await c.auth.signInWithPassword({ email, password });
    if (error) { loginError.textContent = error.message; return; }
    await checkGateAndEnter();
  });

  document.getElementById('btnLogout').addEventListener('click', async () => {
    const c = client();
    if (c) await c.auth.signOut();
    showApp(false);
  });


  async function loadVisits() {
    const c = client();
    const { data } = await c.from('visit_counts').select('day,hits').order('day', { ascending: false }).limit(30);
    const tbody = document.getElementById('visitTable');
    const totalEl = document.getElementById('visitTotal');
    if (!tbody) return;
    tbody.innerHTML = '';
    let total = 0;
    (data || []).forEach(r => {
      total += Number(r.hits) || 0;
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + r.day + '</td><td>' + r.hits + '</td>';
      tbody.appendChild(tr);
    });
    if (totalEl) totalEl.textContent = total.toLocaleString() + ' total hits';
  }

  async function loadLogs() {
    const c = client();
    const { data } = await c.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(40);
    const tbody = document.getElementById('logTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    (data || []).forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td class="muted small">' + escapeHtml(r.created_at) + '</td><td>' + escapeHtml(r.action) + '</td><td>' + escapeHtml(r.entity) + ' ' + escapeHtml(r.entity_id) + '</td><td class="muted small">' + escapeHtml(r.detail) + '</td>';
      tbody.appendChild(tr);
    });
  }

  async function logAction(action, entity, entityId, detail) {
    try {
      await client().rpc('log_admin_action', {
        p_action: action,
        p_entity: entity || '',
        p_entity_id: entityId || '',
        p_detail: detail || '',
      });
    } catch (e) {}
  }

  document.getElementById('tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    if (btn.dataset.tab === 'analytics') loadVisits();
    if (btn.dataset.tab === 'logs') loadLogs();
  });

  const resetBtn = document.getElementById('btnResetDefaults');
  if (resetBtn) resetBtn.addEventListener('click', async () => {
    if (!confirm('Restore default theme pack, SEO, and core site copy? Projects are kept.')) return;
    const c = client();
    const rows = [
      { key: 'theme_pack', value: 'classic-matrix' },
      { key: 'seo_title', value: 'SYSTEM:// BLIK.EXE — Joseph Agyei' },
      { key: 'seo_description', value: 'BLIK — Joseph Agyei. Cyberpunk OS, Datavibes GH, Next.js, creative systems. Interactive terminal portfolio.' },
      { key: 'default_locale', value: 'en' },
      { key: 'hero_tagline', value: 'Full-stack builder. Portfolio of Joseph Agyei — Cyberpunk OS, Datavibes GH, generative systems, and production-shaped web apps.' },
      { key: 'about_bio', value: 'Joseph Agyei (BLIK) builds systems at the edge of product and experiment — from Ghana data-bundle commerce to neural-interface OS demos and generative creative tools.' },
      { key: 'footer_text', value: 'SYSTEM:// BLIK.EXE — Built by Joseph Agyei. All systems operational.' },
    ];
    const { error } = await c.from('site_copy').upsert(rows);
    const st = document.getElementById('systemStatus');
    if (st) st.textContent = error ? error.message : 'Defaults restored.';
    await logAction('reset_defaults', 'site_copy', '', 'featuring mode reset');
    await loadAll();
  });

  const coverFile = document.getElementById('fCoverFile');
  if (coverFile) coverFile.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const path = 'cover-' + Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const { error } = await client().storage.from('covers').upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = client().storage.from('covers').getPublicUrl(path);
      document.getElementById('fCover').value = data.publicUrl;
    } catch (err) {
      editError.textContent = 'Upload failed: ' + err.message + ' (create public bucket covers)';
    }
  });


  async function checkGateAndEnter() {
    const c = client();
    const { data } = await c.from('site_copy').select('key,value');
    const map = {};
    (data || []).forEach(r => { map[r.key] = r.value; });
    const enabled = map.admin_gate_enabled === 'true';
    const pass = map.admin_gate_pass || '';
    if (enabled && pass) {
      const unlocked = sessionStorage.getItem('blik-admin-gate') === '1';
      if (!unlocked) {
        document.getElementById('loginView').hidden = true;
        document.getElementById('gateView').hidden = false;
        document.getElementById('appView').hidden = true;
        return;
      }
    }
    document.getElementById('gateView').hidden = true;
    showApp(true);
    await loadAll();
  }

  const gateForm = document.getElementById('gateForm');
  if (gateForm) gateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const c = client();
    const { data } = await c.from('site_copy').select('key,value');
    const map = {};
    (data || []).forEach(r => { map[r.key] = r.value; });
    const entered = document.getElementById('gatePass').value;
    if (entered && entered === (map.admin_gate_pass || '')) {
      sessionStorage.setItem('blik-admin-gate', '1');
      document.getElementById('gateError').textContent = '';
      document.getElementById('gateView').hidden = true;
      showApp(true);
      await loadAll();
    } else {
      document.getElementById('gateError').textContent = 'Incorrect passphrase.';
    }
  });

  const btnSaveGate = document.getElementById('btnSaveGate');
  if (btnSaveGate) btnSaveGate.addEventListener('click', async () => {
    const c = client();
    const enabled = document.getElementById('gateEnabled').checked;
    const pass = document.getElementById('gatePassSet').value;
    const rows = [{ key: 'admin_gate_enabled', value: enabled ? 'true' : 'false' }];
    if (pass) rows.push({ key: 'admin_gate_pass', value: pass });
    const { error } = await c.from('site_copy').upsert(rows);
    document.getElementById('systemStatus').textContent = error ? error.message : 'Lock settings saved.';
    await logAction('update_gate', 'site_copy', '', enabled ? 'enabled' : 'disabled');
  });

  const avatarFile = document.getElementById('avatarFile');
  if (avatarFile) avatarFile.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const st = document.getElementById('avatarStatus');
    try {
      const path = 'avatar-' + Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const { error } = await client().storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = client().storage.from('avatars').getPublicUrl(path);
      await client().from('site_copy').upsert({ key: 'profile_photo_url', value: data.publicUrl });
      if (st) st.textContent = 'Uploaded: ' + data.publicUrl;
      await logAction('upload_avatar', 'site_copy', '', data.publicUrl);
    } catch (err) {
      if (st) st.textContent = 'Failed: ' + err.message + ' (create public bucket avatars)';
    }
  });

  (async () => {
    if (!cfgOk()) {
      loginError.textContent = 'Add Supabase URL + anon key to js/config.js, run schema.sql, create Auth user.';
      return;
    }
    const { data } = await client().auth.getSession();
    if (data.session) {
      await checkGateAndEnter();
    }
  })();
})();
