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
