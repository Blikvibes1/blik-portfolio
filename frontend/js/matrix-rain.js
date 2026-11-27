// js/matrix-rain.js — animated Matrix-style character rain on a canvas background.

const BlikMatrix = (() => {
  let canvas, ctx, w, h, cols, drops;
  const chars = "01アイウエオカキクケコサシスセソ$#@&BLIK";
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const fontSize = 14;
    cols = Math.floor(w / fontSize);
    drops = new Array(cols).fill(1);
  }

  function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#00FF41';
    ctx.font = '14px monospace';
    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * 14, drops[i] * 14);
      if (drops[i] * 14 > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  function init(canvasId) {
    canvas = document.getElementById(canvasId);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    if (!reduceMotion) {
      setInterval(draw, 50);
    } else {
      canvas.style.display = 'none';
    }
  }

  function setEnabled(on) {
    if (!canvas) return;
    canvas.style.display = on ? '' : 'none';
  }

  return { init, setEnabled, reduceMotion };
})();
