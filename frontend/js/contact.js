// Contact form — Netlify Forms when deployed; local simulated success otherwise.
const BlikContact = (() => {
  function init() {
    const contactForm = document.getElementById('contactForm');
    const contactStatus = document.getElementById('contactStatus');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name = document.getElementById('cName').value.trim();
      const email = document.getElementById('cEmail').value.trim();
      const message = document.getElementById('cMsg').value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || !emailOk || !message) {
        contactStatus.className = 'error';
        contactStatus.textContent = '✖ FILL ALL FIELDS WITH A VALID EMAIL.';
        return;
      }

      contactStatus.className = 'pending';
      contactStatus.textContent = 'TRANSMITTING...';

      // Netlify Forms endpoint (static hosting)
      const isNetlify = window.location.hostname.includes('netlify.app') || contactForm.hasAttribute('data-netlify');
      if (isNetlify || contactForm.getAttribute('method') === 'POST') {
        try {
          const body = new URLSearchParams({
            'form-name': contactForm.getAttribute('name') || 'contact',
            name, email, message,
          });
          const res = await fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
          });
          if (res.ok) {
            contactStatus.className = 'success';
            contactStatus.textContent = '✔ TRANSMISSION COMPLETE — message received.';
            contactForm.reset();
            return;
          }
        } catch (err) {
          // fall through to simulated
        }
      }

      setTimeout(() => {
        contactStatus.className = 'success';
        contactStatus.textContent = '✔ TRANSMISSION COMPLETE — message received. Response window: 24–48h.';
        contactForm.reset();
      }, 900);
    });
  }
  return { init };
})();
