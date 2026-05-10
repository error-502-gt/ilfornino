/* ============================================================
   ilFornino® v3 — main.js
   Quiet, considered motion. No bouncing pizzas.
   ============================================================ */

(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Year */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* Sticky nav shrink */
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
      const top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* Active section pip in nav */
  const navAnchors = document.querySelectorAll('.nav__links a[href^="#"]');
  const ids = Array.from(navAnchors).map((a) => a.getAttribute('href').slice(1));
  const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
  const navObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navAnchors.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-50% 0px -45% 0px' });
  sections.forEach((s) => navObs.observe(s));

  /* Reveal on scroll */
  const tagSelectors = [
    '.hero__rule', '.hero__intro', '.hero__cta', '.hero__foot',
    '.catalog__head > *', '.row',
    '.spread__title', '.spread__grid > *', '.spread__cta',
    '.method__head > *', '.method__list li',
    '.academy__title', '.academy__lede', '.academy__list > *',
    '.stories__stage', '.stories__index',
    '.press', '.visit__address > *', '.visit__form-wrap',
    '.footer__manifesto', '.footer__cols > *',
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

  /* Hero title kinetic reveal */
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    requestAnimationFrame(() => heroTitle.classList.add('is-in'));
  }

  /* Newsletter pseudo-submit */
  document.querySelectorAll('.visit__form').forEach((f) => {
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = f.querySelector('input[name=email]');
      if (!input || !input.checkValidity()) {
        input?.focus();
        f.animate(
          [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }],
          { duration: 280, easing: 'ease-in-out' }
        );
        return;
      }
      f.innerHTML = `
        <span style="padding:14px 22px; font-weight:600; color:var(--ink); display:flex; align-items:center; gap:10px;">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Saved. Code <b style="font-weight:700; letter-spacing:.04em; margin-left:2px; color:var(--ember);">FUOCO50</b> sent to your inbox.
        </span>
      `;
      f.style.gridTemplateColumns = '1fr';
    });
  });

  /* Stories carousel */
  const quotes = document.querySelectorAll('.quote');
  const dots = document.querySelectorAll('.dot');
  const navPrev = document.querySelector('.stories__nav--prev');
  const navNext = document.querySelector('.stories__nav--next');
  let qIndex = 0;
  let qTimer = null;

  const setQuote = (i) => {
    qIndex = (i + quotes.length) % quotes.length;
    quotes.forEach((q, n) => q.classList.toggle('is-active', n === qIndex));
    dots.forEach((d, n) => d.classList.toggle('is-active', n === qIndex));
  };

  const startAuto = () => {
    if (reduced) return;
    stopAuto();
    qTimer = setInterval(() => setQuote(qIndex + 1), 6500);
  };
  const stopAuto = () => { if (qTimer) clearInterval(qTimer); qTimer = null; };

  navPrev?.addEventListener('click', () => { setQuote(qIndex - 1); startAuto(); });
  navNext?.addEventListener('click', () => { setQuote(qIndex + 1); startAuto(); });
  dots.forEach((d) => d.addEventListener('click', () => {
    setQuote(parseInt(d.dataset.dot, 10));
    startAuto();
  }));

  // Keyboard: ←/→ when stories section is in view
  const storiesEl = document.querySelector('.stories');
  if (storiesEl) {
    document.addEventListener('keydown', (e) => {
      const r = storiesEl.getBoundingClientRect();
      const inView = r.top < window.innerHeight * 0.7 && r.bottom > window.innerHeight * 0.3;
      if (!inView) return;
      if (e.key === 'ArrowLeft') { setQuote(qIndex - 1); startAuto(); }
      if (e.key === 'ArrowRight') { setQuote(qIndex + 1); startAuto(); }
    });

    // Pause auto when hovering the stage
    const stage = storiesEl.querySelector('.stories__stage');
    stage?.addEventListener('mouseenter', stopAuto);
    stage?.addEventListener('mouseleave', startAuto);

    // Start auto when first scrolled into view
    const startObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { startAuto(); startObs.disconnect(); }
      });
    }, { threshold: 0.3 });
    startObs.observe(storiesEl);
  }

  /* Subtle row hover sound — none. Just a tiny letterspacing shift on the price */
  document.querySelectorAll('.row').forEach((row) => {
    const link = row.querySelector('.row__link');
    row.addEventListener('mouseenter', () => link?.classList.add('is-hovering'));
    row.addEventListener('mouseleave', () => link?.classList.remove('is-hovering'));
  });

})();
