const BlikDB = (() => {
  let client = null;

  function isConfigured() {
    const c = window.BLIK_CONFIG || {};
    return Boolean(c.supabaseUrl && c.supabaseAnonKey);
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (client) return client;
    if (typeof window.supabase === 'undefined' || !window.supabase.createClient) return null;
    client = window.supabase.createClient(window.BLIK_CONFIG.supabaseUrl, window.BLIK_CONFIG.supabaseAnonKey);
    return client;
  }

  async function fetchPublishedProjects() {
    const sb = getClient();
    if (!sb) return null;
    const { data, error } = await sb
      .from('projects')
      .select('id,name,slug,description,tags,demo_url,repo_url,cover_url,sort_order,published')
      .eq('published', true)
      .order('sort_order', { ascending: true });
    if (error) return null;
    return (data || []).map(row => ({
      id: row.id, name: row.name, slug: row.slug, desc: row.description,
      tags: row.tags || [], demo: row.demo_url || '#', repo: row.repo_url || '#',
      cover: row.cover_url || null, sort_order: row.sort_order,
    }));
  }

  async function fetchPublishedSkills() {
    const sb = getClient();
    if (!sb) return null;
    const { data, error } = await sb.from('skills').select('label,sort_order').eq('published', true).order('sort_order');
    if (error) return null;
    return (data || []).map(r => r.label);
  }

  async function fetchPublishedTimeline() {
    const sb = getClient();
    if (!sb) return null;
    const { data, error } = await sb.from('timeline').select('date_label,role,description,sort_order').eq('published', true).order('sort_order');
    if (error) return null;
    return (data || []).map(r => ({ date: r.date_label, role: r.role, desc: r.description }));
  }

  async function fetchSiteCopy() {
    const sb = getClient();
    if (!sb) return null;
    const { data, error } = await sb.from('site_copy').select('key,value');
    if (error) return null;
    const map = {};
    (data || []).forEach(r => { map[r.key] = r.value; });
    return map;
  }

  async function fetchActiveSocials() {
    const sb = getClient();
    if (!sb) return null;
    const { data, error } = await sb.from('social_links').select('network,label,url,sort_order').eq('active', true).order('sort_order');
    if (error) return null;
    return data || [];
  }

  async function bumpVisit() {
    const sb = getClient();
    if (!sb) return;
    try { await sb.rpc('bump_visit'); } catch (e) { /* silent */ }
  }

  async function fetchVisitStats() {
    const sb = getClient();
    if (!sb) return null;
    const { data, error } = await sb.from('visit_counts').select('day,hits').order('day', { ascending: false }).limit(30);
    if (error) return null;
    return data || [];
  }

  async function fetchI18n(locale) {
    const sb = getClient();
    if (!sb) return null;
    const { data, error } = await sb.from('i18n_strings').select('key,value').eq('locale', locale);
    if (error) return null;
    const map = {};
    (data || []).forEach(r => { map[r.key] = r.value; });
    return map;
  }

  async function logAdmin(action, entity, entityId, detail) {
    const sb = getClient();
    if (!sb) return;
    try {
      await sb.rpc('log_admin_action', {
        p_action: action,
        p_entity: entity || '',
        p_entity_id: entityId || '',
        p_detail: detail || '',
      });
    } catch (e) {}
  }

  async function fetchAdminLogs(limit) {
    const sb = getClient();
    if (!sb) return null;
    const { data, error } = await sb.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(limit || 50);
    if (error) return null;
    return data || [];
  }

  async function uploadPublicFile(bucket, path, file) {
    const sb = getClient();
    if (!sb) throw new Error('Supabase not configured');
    const { error } = await sb.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    const { data } = sb.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  return {
    isConfigured, getClient,
    fetchPublishedProjects, fetchPublishedSkills, fetchPublishedTimeline,
    fetchSiteCopy, fetchActiveSocials, bumpVisit, fetchVisitStats,
    fetchI18n, logAdmin, fetchAdminLogs, uploadPublicFile,
  };
})();
