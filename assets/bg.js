/* Фон: медленно плывущие кристаллы-кубы и мерцающие звёзды. Лёгкий canvas: пауза в фоновой вкладке, без движения при prefers-reduced-motion. */
(() => {
  const c = document.getElementById('bg');
  if (!c) return;
  const ctx = c.getContext('2d'), root = document.documentElement;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, dpr, cubes = [], stars = [], mx = 0, my = 0, raf = 0, t0 = 0;

  const rnd = (a, b) => a + Math.random() * (b - a);
  const cube = init => ({ x: rnd(0, w), y: init ? rnd(0, h) : h + 80, s: rnd(12, 46), v: rnd(.1, .32), a: rnd(.1, .3), k: Math.random(), ph: rnd(0, 6.28) });

  function size() {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    w = innerWidth; h = innerHeight;
    c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cubes = Array.from({ length: Math.round(Math.min(34, w * h / 42000)) }, () => cube(true));
    stars = Array.from({ length: Math.round(Math.min(90, w * h / 16000)) }, () => ({ x: rnd(0, w), y: rnd(0, h), r: rnd(.4, 1.3), ph: rnd(0, 6.28), sp: rnd(.4, 1.4) }));
  }

  function mix(k, a, b) { return Math.round(a + (b - a) * k); }
  function draw(c0, t) {
    const dark = root.dataset.sky === 'night';
    ctx.clearRect(0, 0, w, h);
    for (const st of stars) {
      const tw = .5 + .5 * Math.sin(t * st.sp + st.ph);
      ctx.fillStyle = dark ? `rgba(230,215,255,${.15 + tw * .5})` : `rgba(110,60,190,${.1 + tw * .25})`;
      ctx.fillRect(st.x, st.y, st.r * 1.6, st.r * 1.6);
    }
    for (const q of cubes) {
      const par = q.s / 46, x = q.x + Math.sin(t * .25 + q.ph) * 14 + mx * 22 * par, y = q.y + my * 14 * par, s = q.s;
      /* от фиолетового к розовому, как кристалл на логотипе */
      const r = mix(q.k, dark ? 168 : 126, dark ? 244 : 192), g = mix(q.k, dark ? 85 : 34, dark ? 114 : 38), b = mix(q.k, dark ? 247 : 206, dark ? 208 : 211);
      const al = dark ? q.a : q.a * .7, X = .87 * s;
      ctx.save(); ctx.translate(x, y);
      ctx.fillStyle = `rgba(${r},${g},${b},${al * 1.5})`;                       /* верх */
      ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(X, -s / 2); ctx.lineTo(0, 0); ctx.lineTo(-X, -s / 2); ctx.fill();
      ctx.fillStyle = `rgba(${r},${g},${b},${al})`;                             /* левая грань */
      ctx.beginPath(); ctx.moveTo(-X, -s / 2); ctx.lineTo(0, 0); ctx.lineTo(0, s); ctx.lineTo(-X, s / 2); ctx.fill();
      ctx.fillStyle = `rgba(${r},${g},${b},${al * .55})`;                       /* правая грань */
      ctx.beginPath(); ctx.moveTo(X, -s / 2); ctx.lineTo(0, 0); ctx.lineTo(0, s); ctx.lineTo(X, s / 2); ctx.fill();
      ctx.restore();
    }
  }

  function frame(now) {
    const dt = Math.min((now - t0) / 16.7, 3) || 1; t0 = now;
    for (const q of cubes) { q.y -= q.v * dt; if (q.y < -q.s * 2) Object.assign(q, cube(false), { x: rnd(0, w) }); }
    draw(now, now / 1000);
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf && !calm) { t0 = performance.now(); raf = requestAnimationFrame(frame); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  size(); draw(0, 0); start();
  addEventListener('resize', () => { size(); draw(0, 0); });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  if (!calm && matchMedia('(pointer:fine)').matches)
    addEventListener('pointermove', e => { mx = e.clientX / w - .5; my = e.clientY / h - .5; }, { passive: true });
  new MutationObserver(() => draw(0, performance.now() / 1000)).observe(root, { attributes: true, attributeFilter: ['data-sky'] });
})();
