// AI excursion guide + pre-project context + boundaries.
// Always refreshes project list from BlikProjects / Supabase so NEW projects are known.
const BlikAIGuide = (() => {
  const OFFLINE_REPLIES = [
    'Tour mode online. Ask about any project by name, or say "start tour".',
    'I can walk you through hero → projects → skills. What should we open first?',
  ];

  let messages = [];
  let projectContext = null;

  function systemPrompt() {
    const projects = (typeof BlikProjects !== 'undefined' && BlikProjects.projects)
      ? BlikProjects.projects
      : [];
    const catalog = projects.map(p =>
      `- ${p.name}: ${(p.desc || '').slice(0, 180)} | tags: ${(p.tags || []).join(', ')} | demo: ${p.demo || ''} | repo: ${p.repo || ''}`
    ).join('\n') || '(no projects loaded yet)';

    const boundary = (typeof BlikI18n !== 'undefined' && BlikI18n.t)
      ? BlikI18n.t('ai_boundary')
      : "I can chat briefly off-topic — I'm mainly Joseph Agyei's portfolio guide. Want to continue the tour?";

    return `You are the BLIK portfolio AI tour guide for Joseph Agyei (BLIK).
You give a friendly excursion through this site: hero, projects, skills, timeline, contact.
You ALWAYS use the live project catalog below (it updates when projects are added in admin — never claim a project is missing if it is listed).

LIVE PROJECT CATALOG:
${catalog}

${projectContext ? `CURRENT PROJECT FOCUS:\n${projectContext}\n` : ''}

Rules:
- Prefer guiding through portfolio work with concrete details from the catalog.
- You may answer short off-topic questions, then gently return with this boundary tone: ${boundary}
- Do not invent projects not in the catalog.
- Keep answers concise (under 120 words unless asked for depth).
- Default language: English unless the user writes in another language.`;
  }

  function refreshContextFromProject(p) {
    if (!p) { projectContext = null; return; }
    projectContext = `Name: ${p.name}\nDescription: ${p.desc}\nTags: ${(p.tags || []).join(', ')}\nDemo: ${p.demo}\nRepo: ${p.repo}`;
  }

  async function callModel(userText) {
    const cfg = window.BLIK_CONFIG || {};
    const provider = cfg.aiDefaultProvider || 'groq';
    const sys = systemPrompt();
    const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));

    // Offline keyword helper when no keys
    if (provider === 'offline' || (!cfg.groqApiKey && !cfg.openRouterApiKey)) {
      return offlineAnswer(userText);
    }

    try {
      if (provider === 'openrouter' && cfg.openRouterApiKey) {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + cfg.openRouterApiKey,
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.1-8b-instruct:free',
            messages: [{ role: 'system', content: sys }, ...history, { role: 'user', content: userText }],
          }),
        });
        const data = await res.json();
        return data.choices?.[0]?.message?.content || offlineAnswer(userText);
      }
      // groq default
      if (cfg.groqApiKey) {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + cfg.groqApiKey,
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'system', content: sys }, ...history, { role: 'user', content: userText }],
          }),
        });
        const data = await res.json();
        return data.choices?.[0]?.message?.content || offlineAnswer(userText);
      }
    } catch (e) {
      return offlineAnswer(userText) + ' (offline fallback)';
    }
    return offlineAnswer(userText);
  }

  function offlineAnswer(userText) {
    const q = (userText || '').toLowerCase();
    const projects = (typeof BlikProjects !== 'undefined' && BlikProjects.projects) ? BlikProjects.projects : [];
    const hit = projects.find(p => q.includes((p.name || '').toLowerCase()));
    if (hit) {
      return `${hit.name}: ${hit.desc}\nTags: ${(hit.tags || []).join(', ')}\nDemo: ${hit.demo}\nRepo: ${hit.repo}`;
    }
    if (/tour|start|guide|excursion/.test(q)) {
      const names = projects.map(p => p.name).join(', ') || 'projects loading…';
      return `Welcome aboard. Live catalog: ${names}. Say a project name to inspect it, or ask about skills / stack.`;
    }
    if (/skill|stack|tech/.test(q)) {
      return 'Core stack includes JavaScript/TypeScript, React, Next.js, Prisma, and creative systems work. See the Skills matrix on this page.';
    }
    const boundary = (typeof BlikI18n !== 'undefined') ? BlikI18n.t('ai_boundary') : OFFLINE_REPLIES[0];
    if (/weather|crypto|politics|homework/.test(q)) {
      return boundary;
    }
    return OFFLINE_REPLIES[Math.floor(Math.random() * OFFLINE_REPLIES.length)];
  }

  function appendBubble(role, text) {
    const log = document.getElementById('aiGuideLog');
    if (!log) return;
    const div = document.createElement('div');
    div.className = 'ai-bubble ' + role;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  async function send(text) {
    const input = document.getElementById('aiGuideInput');
    const raw = (text != null ? text : (input && input.value) || '').trim();
    if (!raw) return;
    if (input) input.value = '';
    messages.push({ role: 'user', content: raw });
    appendBubble('user', raw);
    appendBubble('assistant', '…');
    const reply = await callModel(raw);
    messages.push({ role: 'assistant', content: reply });
    const log = document.getElementById('aiGuideLog');
    if (log && log.lastChild) log.lastChild.textContent = reply;
  }

  function onProjectOpen(p) {
    refreshContextFromProject(p);
    const panel = document.getElementById('aiGuidePanel');
    if (panel && p) {
      appendBubble('assistant', `Context loaded for ${p.name}. Ask me anything about this build.`);
    }
  }

  function init() {
    const form = document.getElementById('aiGuideForm');
    const start = document.getElementById('aiGuideStart');
    const toggle = document.getElementById('aiGuideToggle');
    const panel = document.getElementById('aiGuidePanel');
    if (toggle && panel) {
      toggle.addEventListener('click', () => {
        panel.hidden = !panel.hidden;
      });
    }
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        send();
      });
    }
    if (start) {
      start.addEventListener('click', () => send('start tour'));
    }
    // Hook project modal opens if available
    if (typeof BlikProjects !== 'undefined' && BlikProjects.onOpen) {
      BlikProjects.onOpen(onProjectOpen);
    }
  }

  return { init, send, onProjectOpen, refreshContextFromProject };
})();
