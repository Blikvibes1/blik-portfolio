// js/node-grid.js — the animated "signature" node grid in the hero terminal,
// plus a small reusable typewriter effect used across the site.

const BlikNodeGrid = (() => {
  function init(gridId) {
    const nodeGrid = document.getElementById(gridId);
    const totalNodes = 36;
    for (let i = 0; i < totalNodes; i++) {
      const n = document.createElement('div');
      n.className = 'node';
      nodeGrid.appendChild(n);
    }
    const nodes = Array.from(nodeGrid.children);

    function pulse() {
      nodes.forEach(n => n.classList.remove('on', 'cyan-on', 'magenta-on'));
      const activeCount = 10 + Math.floor(Math.random() * 6);
      const palette = ['on', 'cyan-on', 'magenta-on'];
      const used = new Set();
      while (used.size < activeCount) used.add(Math.floor(Math.random() * totalNodes));
      used.forEach(idx => nodes[idx].classList.add(palette[Math.floor(Math.random() * palette.length)]));
    }

    pulse();
    if (!BlikMatrix.reduceMotion) setInterval(pulse, 2200);
  }

  return { init };
})();

const BlikType = (() => {
  function typeInto(el, text, speed, cb) {
    let i = 0;
    el.textContent = '';
    (function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed);
      } else if (cb) {
        cb();
      }
    })();
  }
  return { typeInto };
})();
