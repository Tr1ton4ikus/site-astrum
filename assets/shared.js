/* ASTRUM — скрипт главной страницы (подключается с defer) */
const IP = 'astrums.pro';
const root = document.documentElement;

/* копирование IP */
const toast = document.getElementById('toast');
document.querySelectorAll('[data-ip]').forEach(b => b.addEventListener('click', () => {
  try { navigator.clipboard.writeText(IP); } catch (e) {}
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1600);
}));

/* мобильное меню */
const burger = document.querySelector('.burger');
burger.addEventListener('click', () => document.body.classList.toggle('menu-open'));
document.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')));

/* шапка получает фон при прокрутке */
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('solid', scrollY > 30), { passive: true });

/* ночная картинка подгружается только когда нужна */
const night = document.querySelector('img.night');
const loadNight = () => { if (night.dataset.src) { night.src = night.dataset.src; delete night.dataset.src; } };
if (root.dataset.sky === 'night') loadNight();

/* переключатель день/ночь */
document.getElementById('sw').addEventListener('click', () => {
  const s = root.dataset.sky === 'night' ? 'day' : 'night';
  root.dataset.sky = s;
  if (s === 'night') loadNight();
  try { localStorage.setItem('astrum-sky', s); } catch (e) {}
});

/* онлайн сервера — после отрисовки страницы, в свободное время браузера */
const online = () => fetch('https://api.mcsrvstat.us/3/' + IP)
  .then(r => r.json())
  .then(d => {
    const n = d && d.players ? d.players.online : null;
    root.dataset.live = n == null ? 'off' : 'on';
    document.querySelectorAll('[data-online]').forEach(el => el.textContent = n == null ? '—' : n);
  })
  .catch(() => { root.dataset.live = 'off'; });
(window.requestIdleCallback || setTimeout)(online, 1500);
