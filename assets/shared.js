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
document.querySelector('.burger').addEventListener('click', () => document.body.classList.toggle('menu-open'));
document.querySelectorAll('.top a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')));

/* шапка: прозрачная над картинкой, плотная при прокрутке */
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* переключатель день / ночь */
document.getElementById('sw').addEventListener('click', () => {
  const s = root.dataset.sky === 'night' ? 'day' : 'night';
  root.dataset.sky = s;
  try { localStorage.setItem('astrum-sky', s); } catch (e) {}
});

/* мягкое появление блоков при прокрутке */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  document.querySelectorAll('.p,.card,.step,.qs,.band,.head').forEach(el => { el.classList.add('rv'); io.observe(el); });
}

/* статус сервера и число игроков — после отрисовки страницы */
const plural = n => n % 10 === 1 && n % 100 !== 11 ? 'игрок' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'игрока' : 'игроков';
const loadStatus = () => fetch('https://api.mcsrvstat.us/3/' + IP)
  .then(r => r.json())
  .then(d => {
    const on = d && d.online, n = on && d.players ? d.players.online : 0;
    const box = document.getElementById('status');
    box.classList.toggle('off', !on);
    box.children[1].textContent = on ? 'Сервер онлайн' : 'Сервер оффлайн';
    document.getElementById('count').textContent = on ? '· ' + n + ' ' + plural(n) : '';
  })
  .catch(() => {});
setTimeout(() => (window.requestIdleCallback || (f => f()))(loadStatus), 600);
