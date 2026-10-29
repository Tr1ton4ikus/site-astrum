/* ASTRUM — общий скрипт для всех шаблонов */
const IP = 'astrums.pro';

/* копирование IP + уведомление */
const toast = document.getElementById('toast');
document.querySelectorAll('[data-ip]').forEach(b => b.addEventListener('click', () => {
  try { navigator.clipboard.writeText(IP); } catch (e) {}
  if (!toast) return;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}));

/* появление блоков при прокрутке */
const io = new IntersectionObserver(es => es.forEach(x => {
  if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* мобильное меню */
const burger = document.querySelector('.burger');
if (burger) {
  burger.addEventListener('click', () => document.body.classList.toggle('menu-open'));
  document.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')));
}

/* живой онлайн сервера (если API недоступен — показываем тире) */
fetch('https://api.mcsrvstat.us/3/' + IP)
  .then(r => r.json())
  .then(d => {
    const n = d && d.players ? d.players.online : null;
    document.documentElement.dataset.live = n == null ? 'off' : 'on';
    document.querySelectorAll('[data-online]').forEach(el => el.textContent = n == null ? '—' : n);
  })
  .catch(() => {
    document.documentElement.dataset.live = 'off';
    document.querySelectorAll('[data-online]').forEach(el => el.textContent = '—');
  });

/* звёздное небо: <canvas id="stars" data-color="255,255,255"> */
const cv = document.getElementById('stars');
if (cv) {
  const ctx = cv.getContext('2d'), col = cv.dataset.color || '255,255,255';
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, stars = [];
  const fit = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: Math.round(w * h / 5500) }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.4 + .3,
      p: Math.random() * 6.28, s: Math.random() * .02 + .005, v: Math.random() * .08 + .02
    }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.p += s.s; if (!calm) { s.y -= s.v; if (s.y < 0) { s.y = h; s.x = Math.random() * w; } }
      ctx.fillStyle = `rgba(${col},${.35 + Math.sin(s.p) * .35})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.28); ctx.fill();
    }
    if (!calm) requestAnimationFrame(draw);
  };
  fit(); draw(); addEventListener('resize', fit);
}
