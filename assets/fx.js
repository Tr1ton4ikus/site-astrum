/* Фон: днём падают лепестки вишни, ночью — светлячки и звёзды.
   Лёгкий canvas: пауза в фоновой вкладке, ничего не двигается при prefers-reduced-motion. */
(() => {
  const c = document.getElementById('fx');
  if (!c) return;
  const ctx = c.getContext('2d'), root = document.documentElement;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const PETALS = ['#ffb7d2', '#ff9cc2', '#ffd3e4', '#ff86b3'];
  let w, h, dpr, petals = [], flies = [], stars = [], raf = 0, last = 0, wind = 0;

  const petal = top => ({ x: rnd(-40, w), y: top ? rnd(-h, h) : rnd(-60, -10), s: rnd(5, 10), vy: rnd(.35, .9), vx: rnd(.15, .55),
    rot: rnd(0, 6.28), vr: rnd(-.03, .03), sw: rnd(0, 6.28), col: PETALS[(Math.random() * PETALS.length) | 0] });
  const fly = () => ({ x: rnd(0, w), y: rnd(h * .15, h), r: rnd(1.2, 2.6), ph: rnd(0, 6.28), sp: rnd(.4, 1.1), dx: rnd(-.25, .25), dy: rnd(-.2, .2) });

  function size() {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    w = innerWidth; h = innerHeight;
    c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const area = w * h;
    petals = Array.from({ length: Math.round(Math.min(34, area / 30000)) }, () => petal(true));
    flies = Array.from({ length: Math.round(Math.min(26, area / 45000)) }, fly);
    stars = Array.from({ length: Math.round(Math.min(110, area / 12000)) }, () => ({ x: rnd(0, w), y: rnd(0, h * .7), r: rnd(.5, 1.4), ph: rnd(0, 6.28), sp: rnd(.5, 1.6) }));
  }

  function draw(t, dt) {
    ctx.clearRect(0, 0, w, h);
    if (root.dataset.sky === 'night') {
      for (const s of stars) {
        ctx.globalAlpha = .25 + .55 * (.5 + .5 * Math.sin(t * s.sp + s.ph));
        ctx.fillStyle = '#fff6e0'; ctx.fillRect(s.x, s.y, s.r * 1.5, s.r * 1.5);
      }
      for (const f of flies) {
        f.x += f.dx * dt + Math.sin(t * .6 + f.ph) * .15; f.y += f.dy * dt + Math.cos(t * .5 + f.ph) * .12;
        if (f.x < -10) f.x = w + 10; if (f.x > w + 10) f.x = -10; if (f.y < -10) f.y = h + 10; if (f.y > h + 10) f.y = -10;
        const a = .35 + .65 * (.5 + .5 * Math.sin(t * f.sp * 2 + f.ph));
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 6);
        g.addColorStop(0, `rgba(255,214,102,${a})`); g.addColorStop(1, 'rgba(255,214,102,0)');
        ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 6, 0, 6.283); ctx.fill();
      }
    } else {
      wind = Math.sin(t * .25) * .35;
      for (const p of petals) {
        p.y += p.vy * dt; p.x += (p.vx + wind + Math.sin(t + p.sw) * .25) * dt; p.rot += p.vr * dt;
        if (p.y > h + 20 || p.x > w + 40) Object.assign(p, petal(false));
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = .9; ctx.fillStyle = p.col;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .8);                 /* квадратный «пиксельный» лепесток, как в вишнёвой роще */
        ctx.globalAlpha = .5; ctx.fillStyle = '#fff';
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s / 2.5, p.s / 3);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    const dt = Math.min((now - last) / 16.7, 3) || 1; last = now;
    draw(now / 1000, dt);
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf && !calm) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  size(); draw(0, 0); start();
  addEventListener('resize', () => { size(); if (calm) draw(0, 0); });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  new MutationObserver(() => { if (calm) draw(0, 0); }).observe(root, { attributes: true, attributeFilter: ['data-sky'] });
})();
