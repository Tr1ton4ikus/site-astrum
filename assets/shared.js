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

/* плавный скролл наверх при клике на Главную или лого */
document.querySelectorAll('.nav-links a[href="./"], .brand[href="./"]').forEach(a => {
  a.addEventListener('click', e => {
    if (location.pathname.endsWith('/') || location.pathname.endsWith('index.html')) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
});

/* активный пункт меню при скролле */
const faqSec = document.getElementById('faq');
const navHome = document.querySelector('.nav-links a[href="./"]');
const navFaq = document.querySelector('.nav-links a[href="#faq"]');
const updateActiveNav = () => {
  if (!faqSec || !navHome || !navFaq) return;
  const rect = faqSec.getBoundingClientRect();
  const inFaq = rect.top <= 250 && rect.bottom >= 150;
  navFaq.classList.toggle('active', inFaq);
  navHome.classList.toggle('active', !inFaq);
};

/* шапка: прозрачная над картинкой, плавающие капсулы при прокрутке */
const nav = document.getElementById('nav');
const onScroll = () => {
  nav.classList.toggle('solid', scrollY > 40);
  updateActiveNav();
};
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

/* плавный аккордеон FAQ */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.qs details').forEach(details => {
  const summary = details.querySelector('summary');
  if (!summary) return;

  let content = details.querySelector('.faq-content');
  if (!content) {
    content = document.createElement('div');
    content.className = 'faq-content';
    const children = Array.from(details.childNodes).filter(n => n !== summary);
    children.forEach(c => content.appendChild(c));
    details.appendChild(content);
  }

  let animation = null;
  let isClosing = false;
  let isOpening = false;

  summary.addEventListener('click', e => {
    e.preventDefault();
    if (isClosing || !details.open) {
      open();
    } else if (isOpening || details.open) {
      shrink();
    }
  });

  function open() {
    if (animation) animation.cancel();
    isClosing = false;
    isOpening = true;
    details.classList.remove('is-closing');

    const wasOpen = details.open;
    if (!wasOpen) details.open = true;

    if (prefersReduced) {
      isOpening = false;
      return;
    }

    const startHeight = wasOpen ? content.getBoundingClientRect().height : 0;
    content.style.height = 'auto';
    const endHeight = content.scrollHeight;
    content.style.height = `${startHeight}px`;
    content.style.overflow = 'hidden';

    animation = content.animate([
      {
        height: `${startHeight}px`,
        opacity: startHeight > 0 ? (startHeight / endHeight) : 0,
        transform: startHeight > 0 ? 'translateY(0)' : 'translateY(-6px)'
      },
      {
        height: `${endHeight}px`,
        opacity: 1,
        transform: 'translateY(0)'
      }
    ], {
      duration: 300,
      easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)'
    });

    animation.onfinish = () => {
      content.style.height = '';
      content.style.overflow = '';
      animation = null;
      isOpening = false;
    };
    animation.oncancel = () => {
      isOpening = false;
    };
  }

  function shrink() {
    if (animation) animation.cancel();
    isOpening = false;
    isClosing = true;
    details.classList.add('is-closing');

    if (prefersReduced) {
      details.open = false;
      details.classList.remove('is-closing');
      isClosing = false;
      return;
    }

    const startHeight = content.getBoundingClientRect().height;
    content.style.overflow = 'hidden';

    animation = content.animate([
      {
        height: `${startHeight}px`,
        opacity: 1,
        transform: 'translateY(0)'
      },
      {
        height: '0px',
        opacity: 0,
        transform: 'translateY(-6px)'
      }
    ], {
      duration: 250,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
    });

    animation.onfinish = () => {
      details.open = false;
      details.classList.remove('is-closing');
      content.style.height = '';
      content.style.overflow = '';
      animation = null;
      isClosing = false;
    };
    animation.oncancel = () => {
      isClosing = false;
    };
  }
});

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
