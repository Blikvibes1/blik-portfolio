// js/nav.js — mobile menu toggle + scroll-spy active link highlighting.

const BlikNav = (() => {
  function init() {
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.getElementById('navLinks');

    menuBtn.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
    });

    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }));

    const sectionIds = ['home', 'about', 'projects', 'ai-lab', 'experience', 'contact'];
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
    const navA = Array.from(navLinks.querySelectorAll('a'));

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navA.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });

    sections.forEach(s => io.observe(s));
  }

  return { init };
})();
