const BlikPromptLab = (() => {
  function simResponse(prompt) {
    const p = (prompt || '').toLowerCase();
    if (/react|next/.test(p)) return 'Try server components for data, client islands for interactivity. Keep portfolio demos focused.';
    if (/design|ui|cyber/.test(p)) return 'Terminal chrome + one accent glow. Reduce competing effects. Hierarchy > decoration.';
    if (/supabase|auth/.test(p)) return 'RLS first. Anon key is public. Service role never in the browser.';
    if (/protocol|trust/.test(p)) return 'Exchange nonces, sign challenges, expire sessions. Trust is a lease, not a permanent grant.';
    if (/firewall/.test(p)) return 'A firewall is a policy engine: packets are claims, rules are judgments, logs are memory.';
    return 'Prompt received. Refine with stack, audience, and one measurable outcome.';
  }

  async function liveResponse(prompt) {
    const cfg = window.BLIK_CONFIG || {};
    const sys = 'You are a concise coding/product assistant inside the BLIK portfolio Prompt Lab. Under 100 words.';
    try {
      if (cfg.groqApiKey) {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.groqApiKey },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'system', content: sys }, { role: 'user', content: prompt }],
          }),
        });
        const data = await res.json();
        return data.choices?.[0]?.message?.content || simResponse(prompt);
      }
      if (cfg.openRouterApiKey) {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.openRouterApiKey },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.1-8b-instruct:free',
            messages: [{ role: 'system', content: sys }, { role: 'user', content: prompt }],
          }),
        });
        const data = await res.json();
        return data.choices?.[0]?.message?.content || simResponse(prompt);
      }
    } catch (e) {}
    return simResponse(prompt);
  }

  async function run(prompt) {
    const out = document.getElementById('labOut');
    const input = document.getElementById('labInput');
    if (input) input.value = prompt;
    if (out) out.textContent = 'Thinking…';
    const reply = await liveResponse(prompt);
    if (out) out.textContent = reply;
  }

  function init() {
    const form = document.getElementById('labForm');
    if (form) {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const input = document.getElementById('labInput');
        const prompt = (input && input.value || '').trim();
        if (prompt) run(prompt);
      });
    }
    document.querySelectorAll('.lab-example[data-ex]').forEach(btn => {
      btn.addEventListener('click', () => run(btn.getAttribute('data-ex')));
    });
    const clear = document.getElementById('labClear');
    if (clear) clear.addEventListener('click', () => {
      const out = document.getElementById('labOut');
      const input = document.getElementById('labInput');
      if (out) out.textContent = '';
      if (input) input.value = '';
    });
  }
  return { init };
})();
