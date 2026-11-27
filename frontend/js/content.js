// js/content.js — skills matrix, experience timeline, site copy (remote + fallback).

const BlikContent = (() => {
  const FALLBACK_SKILLS = [
    'JavaScript', 'TypeScript', 'React', 'Next.js',
    'Node.js', 'Prisma', 'PostgreSQL', 'Tailwind CSS',
    'Three.js / R3F', 'HTML / CSS', 'Git / GitHub', 'Vercel'
  ];

  const FALLBACK_TIMELINE = [
    {
      date: '2025 — PRESENT',
      role: 'Independent builder · BLIK systems',
      desc: 'Shipping portfolio-grade experiments and production-shaped apps: Cyberpunk OS, Datavibes GH, generative systems, and public learning roadmaps.'
    },
    {
      date: 'ONGOING',
      role: 'Full-stack product work',
      desc: 'Next.js commerce flows, webhooks, admin tooling, auth, and deploy runbooks aimed at real Ghana market constraints.'
    },
    {
      date: 'PRACTICE',
      role: 'Frontend craft loop',
      desc: 'Deliberate weekly builds — responsive UI, forms, APIs, timers, themes — published in the freelancer development roadmap.'
    },
    {
      date: 'ORIGIN',
      role: 'Joseph Agyei · BLIK',
      desc: 'Building in public under Blikvibes1 — terminal aesthetics, systems thinking, and interfaces that feel like tools.'
    }
  ];

  const FALLBACK_COPY = {
    hero_tagline: 'Full-stack builder. Portfolio of Joseph Agyei — Cyberpunk OS, Datavibes GH, generative systems, and production-shaped web apps.',
    about_bio: 'Joseph Agyei (BLIK) builds systems at the edge of product and experiment — from Ghana data-bundle commerce to neural-interface OS demos and generative creative tools.',
    footer_text: 'SYSTEM:// BLIK.EXE — Built by Joseph Agyei. All systems operational.'
  };

  function renderSkills(skills) {
    const skillsMatrix = document.getElementById('skillsMatrix');
    if (!skillsMatrix) return;
    skillsMatrix.innerHTML = '';
    skills.forEach((label) => {
      const d = document.createElement('div');
      d.className = 'skill-slot';
      d.textContent = label;
      skillsMatrix.appendChild(d);
    });
  }

  function renderTimeline(items) {
    const timeline = document.getElementById('timeline');
    if (!timeline) return;
    timeline.innerHTML = '';
    items.forEach(t => {
      const item = document.createElement('div');
      item.className = 'tl-item';
      item.innerHTML =
        '<div class="tl-date">' + t.date + '</div>' +
        '<div class="tl-role">' + t.role + '</div>' +
        '<div class="tl-desc">' + t.desc + '</div>';
      timeline.appendChild(item);
    });
  }

  function applyCopy(copy) {
    const hero = document.querySelector('.hero-tagline');
    if (hero && copy.hero_tagline) {
      hero.textContent = copy.hero_tagline;
    }
    const about = document.getElementById('aboutBio');
    if (about && copy.about_bio) about.textContent = copy.about_bio;
    const footer = document.getElementById('footerText');
    if (footer && copy.footer_text) footer.textContent = copy.footer_text;
    const photo = document.getElementById('profilePhoto');
    if (photo) {
      if (copy.profile_photo_url) {
        photo.src = copy.profile_photo_url;
        photo.hidden = false;
      } else {
        photo.hidden = true;
      }
    }
    if (copy.seo_title) document.title = copy.seo_title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && copy.seo_description) metaDesc.setAttribute('content', copy.seo_description);
  }

  async function load() {
    let skills = FALLBACK_SKILLS;
    let timeline = FALLBACK_TIMELINE;
    let copy = Object.assign({}, FALLBACK_COPY);

    try {
      if (typeof BlikDB !== 'undefined' && BlikDB.isConfigured()) {
        const [s, t, c] = await Promise.all([
          BlikDB.fetchPublishedSkills(),
          BlikDB.fetchPublishedTimeline(),
          BlikDB.fetchSiteCopy(),
        ]);
        if (s && s.length) skills = s;
        if (t && t.length) timeline = t;
        if (c && Object.keys(c).length) copy = Object.assign(copy, c);
      }
    } catch (err) {
      console.warn('[BLIK] content fallback', err);
    }

    renderSkills(skills);
    renderTimeline(timeline);
    applyCopy(copy);
  }

  function init() {
    load();
  }

  return { init };
})();
