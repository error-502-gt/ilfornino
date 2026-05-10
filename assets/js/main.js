/* ============================================================
   ilFornino® — main.js v2
   Restrained, e-commerce-grade interactivity. No frameworks.
   ============================================================ */

(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(hover: none)').matches;

  /* Year */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* Sticky nav shrink on scroll */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('is-shrunk', window.scrollY > 16);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  const burger = document.getElementById('burger');
  const overlay = document.getElementById('overlay');
  burger?.addEventListener('click', () => {
    const open = burger.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    overlay?.classList.toggle('is-open', open);
    overlay?.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  overlay?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => burger?.click()));

  /* Smooth-scroll anchors */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* Reveal on scroll — auto-tag relevant elements */
  const tagSelectors = [
    '.categories__head', '.categories__grid > *',
    '.grid-section__head', '.products > *',
    '.feature__copy', '.feature__art',
    '.howto__head', '.howto__steps > *',
    '.recipes__head', '.recipes__grid > *',
    '.reviews__head', '.reviews__grid > *',
    '.press', '.academy__copy', '.academy__media',
    '.newsletter__inner > *',
  ];
  tagSelectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.setAttribute('data-reveal', '');
      el.style.transitionDelay = `${Math.min(i * 0.05, 0.4)}s`;
    });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  /* Filter: collection grid */
  const filters = document.querySelectorAll('[data-filter]');
  const products = document.querySelectorAll('.product');
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => b.classList.remove('is-on'));
      btn.classList.add('is-on');
      const f = btn.dataset.filter;
      products.forEach((p) => {
        const cats = (p.dataset.cat || '').split(' ');
        const show = f === 'all' || cats.includes(f);
        p.classList.toggle('is-hidden', !show);
      });
    });
  });

  /* Cart count: fake increment on Add */
  const cartCount = document.querySelector('.nav__cart-count');
  document.querySelectorAll('.product__add').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      if (!cartCount) return;
      const n = parseInt(cartCount.textContent || '0', 10) + 1;
      cartCount.textContent = String(n);
      cartCount.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }],
        { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' }
      );
      // Brief flash on cart
      const cartBtn = cartCount.parentElement;
      cartBtn?.animate(
        [{ background: 'transparent' }, { background: 'rgba(210,63,28,.18)' }, { background: 'transparent' }],
        { duration: 600 }
      );
    });
  });

  /* Hero oven 3D tilt — light, subtle */
  if (!isCoarse && !reduced) {
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      const max = 8;
      const parent = el.closest('.hero__visual') || el.parentElement;
      let raf = null;
      parent.addEventListener('mousemove', (e) => {
        const r = parent.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        const rx = py * -max;
        const ry = px * max;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transition = 'transform .15s ease-out';
          el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
      });
      parent.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        el.style.transition = '';
        el.style.transform = '';
      });
    });
  }

  /* Newsletter pseudo-submit */
  document.querySelectorAll('.newsletter__form').forEach((f) => {
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = f.querySelector('input[name=email]');
      if (!input || !input.checkValidity()) {
        input?.focus();
        f.animate(
          [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }],
          { duration: 300, easing: 'ease-in-out' }
        );
        return;
      }
      f.innerHTML = `
        <span style="padding:14px 22px; font-weight:600; color:var(--ink); display:flex; align-items:center; gap:8px;">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Saved. Code <b style="font-weight:800; letter-spacing:.05em; margin-left:4px;">FUOCO50</b> sent to your inbox.
        </span>
      `;
      f.style.gridTemplateColumns = '1fr';
    });
  });

  /* Subtle parallax on hero pizza */
  if (!reduced) {
    const pizza = document.querySelector('.hero__pizza');
    if (pizza) {
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        pizza.style.translate = `0 ${y * 0.12}px`;
      }, { passive: true });
    }
  }

})();
