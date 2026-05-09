/* ============================================================
   ilFornino® — main.js
   Hand-built motion. No frameworks. No GSAP.
   ============================================================ */

(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(hover: none)').matches;

  /* ░░░░░░ Year ░░░░░░ */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ░░░░░░ Preloader ░░░░░░ */
  const preloader = document.getElementById('preloader');
  const counter = preloader?.querySelector('[data-count]');
  let pct = 0;
  const startedAt = performance.now();
  const target = reduced ? 600 : 2200;

  const tick = () => {
    const now = performance.now();
    pct = Math.min(100, ((now - startedAt) / target) * 100);
    if (counter) counter.textContent = String(Math.floor(pct)).padStart(2, '0');
    if (pct < 100) requestAnimationFrame(tick);
    else finishPreload();
  };

  const finishPreload = () => {
    if (!preloader) return;
    preloader.classList.add('is-done');
    setTimeout(() => preloader.remove(), 900);
    document.body.classList.add('is-ready');
    triggerHero();
  };

  // Wait for window load + minimum animation duration
  if (document.readyState === 'complete') requestAnimationFrame(tick);
  else window.addEventListener('load', () => requestAnimationFrame(tick));

  /* ░░░░░░ Hero entrance trigger ░░░░░░ */
  const triggerHero = () => {
    document.querySelectorAll('.hero__title .word').forEach((w, i) => {
      w.style.animationDelay = `${i * 0.06}s`;
    });
  };

  /* ░░░░░░ Sticky nav state on scroll ░░░░░░ */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add('is-condensed');
    else nav.classList.remove('is-condensed');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ░░░░░░ Active section pip in nav ░░░░░░ */
  const navLinks = document.querySelectorAll('[data-link]');
  const sections = Array.from(navLinks).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach((a) => {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-50% 0px -45% 0px' });
  sections.forEach((s) => sectionObserver.observe(s));

  /* ░░░░░░ Mobile menu toggle ░░░░░░ */
  const burger = document.getElementById('burger');
  const overlay = document.getElementById('overlayMenu');
  burger?.addEventListener('click', () => {
    const open = burger.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    overlay?.classList.toggle('is-open', open);
    overlay?.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('no-scroll', open);
  });
  overlay?.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => burger?.click())
  );

  /* ░░░░░░ Custom cursor ░░░░░░ */
  if (!isCoarse) {
    const cursor = document.querySelector('.cursor');
    const dot = cursor.querySelector('.cursor__dot');
    const ring = cursor.querySelector('.cursor__ring');
    const label = cursor.querySelector('.cursor__label');

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let dx = mx, dy = my;       // dot
    let rx = mx, ry = my;       // ring
    let lx = mx, ly = my;       // label

    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
    window.addEventListener('mousedown', () => cursor.classList.add('is-down'));
    window.addEventListener('mouseup', () => cursor.classList.remove('is-down'));

    const animateCursor = () => {
      dx += (mx - dx) * 1.0;
      dy += (my - dy) * 1.0;
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      lx += (mx - lx) * 0.22;
      ly += (my - ly) * 0.22;

      dot.style.transform = `translate3d(${dx}px,${dy}px,0)`;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      label.style.transform = `translate3d(${lx}px,${ly}px,0)`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Hover targets
    const addHover = (el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('is-hover');
        const lbl = el.dataset.cursor;
        if (lbl) {
          cursor.classList.add('has-label');
          label.textContent = lbl;
        }
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-hover');
        cursor.classList.remove('has-label');
        label.textContent = '';
      });
    };
    document.querySelectorAll('a, button, [data-cursor], [data-magnetic], [data-tilt]').forEach(addHover);

    document.querySelectorAll('p, h1, h2, h3, blockquote, .hero__lede').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-text'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-text'));
    });
  }

  /* ░░░░░░ Magnetic buttons (uses `translate` to avoid clashing with hover transforms) ░░░░░░ */
  if (!isCoarse && !reduced) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      let raf = null;
      const strength = 0.35;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const x = (e.clientX - cx) * strength;
        const y = (e.clientY - cy) * strength;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.translate = `${x}px ${y}px`;
        });
      });
      el.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        el.style.translate = '';
      });
    });
  }

  /* ░░░░░░ 3D tilt cards ░░░░░░ */
  if (!isCoarse && !reduced) {
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      const max = 6;
      let raf = null;
      el.addEventListener('mouseenter', () => {
        el.style.transition = 'transform .15s ease-out, border-color .35s, opacity .5s, scale .5s';
      });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        const rx = py * -max;
        const ry = px * max;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
      });
      el.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        el.style.transition = '';
        el.style.transform = '';
      });
    });
  }

  /* ░░░░░░ Section reveal on scroll ░░░░░░ */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

  document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));

  // Auto-tag scene children
  document.querySelectorAll('[data-scene]').forEach((scene) => {
    scene.querySelectorAll('h2, h3, .kicker, .stats__grid li, .craft__card, .oven, .story, .visit__card, .heritage__chap, .featured__specs, .featured__cta, .academy__list, .academy__cta, .academy__media, .featured__visual, .collection__filters, .collection__lede')
      .forEach((el, i) => {
        el.setAttribute('data-reveal', '');
        el.style.transitionDelay = `${Math.min(i * 0.06, 0.6)}s`;
        revealObserver.observe(el);
      });
  });

  /* ░░░░░░ Stat counters ░░░░░░ */
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseFloat(el.dataset.counter);
        const duration = 1800;
        const start = performance.now();
        const ease = (t) => 1 - Math.pow(1 - t, 3);

        const step = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const v = Math.floor(target * ease(t));
          el.textContent = v;
          if (t < 1) requestAnimationFrame(step);
          else el.textContent = target;
        };
        requestAnimationFrame(step);
        counterObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-counter]').forEach((el) => counterObs.observe(el));

  /* ░░░░░░ Heritage sticky-scroll story ░░░░░░ */
  const heritageChaps = document.querySelectorAll('.heritage__chap');
  const heritageFigs = document.querySelectorAll('.heritage__figure');
  if (heritageChaps.length && heritageFigs.length) {
    // Mark first by default
    heritageChaps[0].classList.add('is-active');
    heritageFigs[0].classList.add('is-active');

    const setActive = (idx) => {
      heritageChaps.forEach((c, i) => c.classList.toggle('is-active', i === idx));
      heritageFigs.forEach((f, i) => f.classList.toggle('is-active', i === idx));
    };

    const chapObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const idx = parseInt(e.target.dataset.chap, 10);
          if (!isNaN(idx)) setActive(idx);
        }
      });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
    heritageChaps.forEach((c) => chapObs.observe(c));
  }

  /* ░░░░░░ Collection filters ░░░░░░ */
  const filterChips = document.querySelectorAll('[data-filter]');
  const ovens = document.querySelectorAll('.oven');
  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filterChips.forEach((c) => {
        c.classList.remove('is-active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('is-active');
      chip.setAttribute('aria-selected', 'true');
      const f = chip.dataset.filter;
      ovens.forEach((o) => {
        const cats = (o.dataset.cat || '').split(' ');
        const show = f === 'all' || cats.includes(f);
        o.classList.toggle('is-hidden', !show);
      });
    });
  });

  /* ░░░░░░ Smooth-scroll for anchor links ░░░░░░ */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* ░░░░░░ Newsletter pseudo-submit ░░░░░░ */
  document.querySelectorAll('.visit__form').forEach((f) => {
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = f.querySelector('input[name=email]');
      if (!input || !input.checkValidity()) {
        f.classList.add('is-invalid');
        return;
      }
      f.innerHTML = `
        <p style="font-family:var(--serif);font-style:italic;font-size:22px;color:var(--paper);margin:0;">
          Grazie. Welcome to <em>Brace di Lunedì</em>.
        </p>
        <small>You'll hear from the workshop on Monday morning.</small>
      `;
    });
  });

  /* ░░░░░░ Ember canvas — particle system ░░░░░░ */
  const canvas = document.getElementById('emberCanvas');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d', { alpha: true });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0, h = 0;
    const particles = [];
    const PCOUNT = window.innerWidth < 720 ? 36 : 80;

    const resize = () => {
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    const rand = (a, b) => a + Math.random() * (b - a);

    class Ember {
      constructor() { this.reset(true); }
      reset(initial = false) {
        this.x = rand(0, w);
        this.y = initial ? rand(0, h) : h + rand(0, 80 * dpr);
        this.vx = rand(-0.3, 0.3) * dpr;
        this.vy = rand(-1.4, -0.4) * dpr;
        this.r = rand(0.6, 2.2) * dpr;
        this.life = 0;
        this.maxLife = rand(280, 600);
        this.hue = rand(15, 38);
        this.sat = rand(85, 100);
        this.flick = Math.random() * Math.PI * 2;
      }
      step() {
        this.x += this.vx + Math.sin(this.flick + this.life * 0.02) * 0.3;
        this.y += this.vy;
        this.vy *= 0.998;
        this.life++;
        this.flick += 0.04;
        if (this.life > this.maxLife || this.y < -20 || this.x < -20 || this.x > w + 20) this.reset();
      }
      draw() {
        const fade = 1 - (this.life / this.maxLife);
        const alpha = Math.max(0, fade) * 0.85;
        const r = this.r * (0.8 + 0.4 * Math.sin(this.flick));
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 6);
        g.addColorStop(0, `hsla(${this.hue}, ${this.sat}%, 70%, ${alpha})`);
        g.addColorStop(0.4, `hsla(${this.hue - 5}, ${this.sat}%, 55%, ${alpha * 0.5})`);
        g.addColorStop(1, `hsla(${this.hue - 10}, ${this.sat}%, 45%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(${this.hue + 8}, ${this.sat}%, 80%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    for (let i = 0; i < PCOUNT; i++) particles.push(new Ember());

    let running = true;
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) loop();
    });

    const loop = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of particles) { p.step(); p.draw(); }
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ░░░░░░ Scroll-driven hero parallax ░░░░░░ */
  if (!reduced) {
    const heroBg = document.querySelector('.hero__bg-glow');
    const heroFlame = document.querySelector('.hero__flame-art');
    const heroTitle = document.querySelector('.hero__title');

    let raf = null;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (heroBg) heroBg.style.transform = `translateY(${y * 0.15}px) scale(${1 + y * 0.0006})`;
        if (heroFlame) heroFlame.style.transform = `translateX(-50%) translateY(${y * 0.25}px)`;
        if (heroTitle) heroTitle.style.transform = `translateY(${y * -0.08}px)`;
      });
    }, { passive: true });
  }

  /* ░░░░░░ Cursor-driven hero glow follow ░░░░░░ */
  if (!isCoarse && !reduced) {
    const heroGlow = document.querySelector('.hero__bg-glow');
    if (heroGlow) {
      window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 60;
        const y = (e.clientY / window.innerHeight - 0.5) * 40;
        heroGlow.style.translate = `${x}px ${y}px`;
      });
    }
  }

  /* ░░░░░░ Featured oven mouse-tilt (already covered by data-tilt; add fire response) ░░░░░░ */
  if (!isCoarse && !reduced) {
    const fov = document.querySelector('.featured__visual');
    const halo = document.querySelector('.featured__halo');
    if (fov && halo) {
      fov.addEventListener('mousemove', (e) => {
        const r = fov.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        halo.style.transform = `translate(${(x - 0.5) * 30}px, ${(y - 0.5) * 30}px) scale(${1 + (1 - y) * 0.08})`;
      });
      fov.addEventListener('mouseleave', () => { halo.style.transform = ''; });
    }
  }

})();
