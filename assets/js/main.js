/* =========================================================
   LUME — motion & interactions
   GSAP + ScrollTrigger + Lenis
   ========================================================= */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // wait for deferred libs
  function waitFor(check, cb, tries = 60) {
    if (check()) return cb();
    if (tries <= 0) return cb(); // graceful fallback
    requestAnimationFrame(() => waitFor(check, cb, tries - 1));
  }

  ready(() => {
    buildStars();
    initCursor();
    initNav();
    initProgress();

    waitFor(() => window.gsap && window.ScrollTrigger, initGSAP);
  });

  /* ---------- Stars (sleep section) ---------- */
  function buildStars() {
    const box = document.querySelector('[data-stars]');
    if (!box) return;
    const n = 70;
    let html = '';
    for (let i = 0; i < n; i++) {
      const x = Math.random() * 100, y = Math.random() * 100;
      const d = (Math.random() * 4 + 1).toFixed(2);
      const delay = (Math.random() * 4).toFixed(2);
      const s = (Math.random() * 1.6 + 0.6).toFixed(2);
      html += `<i style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-duration:${d}s;animation-delay:${delay}s"></i>`;
    }
    box.innerHTML = html;
  }

  /* ---------- Custom cursor ---------- */
  function initCursor() {
    if (isTouch) return;
    const ring = document.querySelector('.cursor');
    const dot = document.querySelector('.cursor-dot');
    if (!ring || !dot) return;
    let rx = window.innerWidth / 2, ry = window.innerHeight / 2, dx = rx, dy = ry;
    window.addEventListener('mousemove', (e) => {
      dx = e.clientX; dy = e.clientY;
      dot.style.transform = `translate(${dx}px,${dy}px) translate(-50%,-50%)`;
    });
    (function loop() {
      rx += (dx - rx) * 0.18; ry += (dy - ry) * 0.18;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a,button,[data-hover],summary,.feature-card,.life__card,.review').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
    });
    // Light-follow on buttons
    document.querySelectorAll('.btn').forEach((b) => {
      b.addEventListener('mousemove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--bx', (e.clientX - r.left) + 'px');
        b.style.setProperty('--by', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Navbar blur on scroll ---------- */
  function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Scroll progress bar ---------- */
  function initProgress() {
    const bar = document.querySelector('.scroll-progress span');
    if (!bar) return;
    const upd = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    };
    upd();
    window.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
  }

  /* ---------- GSAP + Lenis ---------- */
  function initGSAP() {
    const { gsap } = window;
    gsap.registerPlugin(window.ScrollTrigger);

    // Lenis smooth scroll
    let lenis = null;
    if (window.Lenis && !reduce) {
      lenis = new window.Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
      lenis.on('scroll', window.ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      document.documentElement.classList.add('lenis');
      // Anchor links through Lenis
      document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
          const id = a.getAttribute('href');
          if (id.length > 1) {
            const t = document.querySelector(id);
            if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -10 }); }
          }
        });
      });
    }

    if (reduce) {
      document.querySelectorAll('[data-fade],[data-card],.reveal').forEach((el) => {
        el.style.opacity = 1; el.style.transform = 'none';
      });
      revealHeroText(gsap, true);
      return;
    }

    /* Hero text reveal */
    revealHeroText(gsap, false);

    gsap.utils.toArray('.reveal').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.15 * i + 0.3,
      });
    });

    /* Hero ring parallax + zoom on scroll */
    const heroRing = document.querySelector('[data-ring] .ring');
    if (heroRing) {
      heroRing.classList.add('ring--spin');
      gsap.to('[data-ring]', {
        scale: 1.7, y: 120, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('.hero__content', {
        y: -60, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '60% top', scrub: true },
      });
    }

    /* Generic fade-in for data-fade & data-card */
    gsap.utils.toArray('[data-fade],[data-card]').forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    });

    /* Split-title word reveal */
    gsap.utils.toArray('[data-split]').forEach((title) => {
      splitLines(title);
      gsap.fromTo(title.querySelectorAll('.sr-word'),
        { yPercent: 110 },
        {
          yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.12,
          scrollTrigger: { trigger: title, start: 'top 85%' },
        });
    });

    /* Section 1 — watch → ring transition (pinned) */
    const past = document.querySelector('.past');
    if (past) {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: past, start: 'top top', end: 'bottom bottom', scrub: 1 },
      });
      tl.set('[data-past-ring]', { scale: 0.2, opacity: 0, filter: 'blur(20px)' })
        .to('[data-watch]', { scale: 0.25, opacity: 0, filter: 'blur(16px)', ease: 'power2.in' }, 0)
        .to('[data-past-ring]', { scale: 1, opacity: 1, filter: 'blur(0px)', ease: 'power2.out' }, 0.15)
        .from('.past__text', { opacity: 0, y: 40 }, 0.3);
    }

    /* Dashboard bars grow */
    gsap.utils.toArray('.bar i').forEach((b) => {
      gsap.to(b, {
        scaleY: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: '.dashboard', start: 'top 75%' },
      });
    });

    /* Count-up numbers */
    gsap.utils.toArray('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const obj = { v: 0 };
      gsap.to(obj, {
        v: end, duration: 1.6, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
        onUpdate: () => {
          el.textContent = Math.round(obj.v).toLocaleString('pt-BR') + suffix;
        },
      });
    });

    /* Material ring parallax */
    gsap.to('.ring--macro', {
      yPercent: -12, rotate: 18, ease: 'none',
      scrollTrigger: { trigger: '.material', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    /* Lifestyle horizontal scroll */
    const track = document.querySelector('[data-hscroll]');
    if (track && window.innerWidth > 760) {
      const dist = track.scrollWidth - window.innerWidth + 80;
      if (dist > 0) {
        gsap.to(track, {
          x: -dist, ease: 'none',
          scrollTrigger: { trigger: '.life', start: 'top top', end: () => '+=' + dist, scrub: 1, pin: true, anticipatePin: 1 },
        });
      }
    }

    /* App phones parallax */
    gsap.to('.phone--back', { y: -40, scrollTrigger: { trigger: '.app', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.to('.phone--front', { y: 40, scrollTrigger: { trigger: '.app', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* Compare rows stagger */
    gsap.from('[data-row]', {
      opacity: 0, x: -20, duration: 0.8, stagger: 0.08, ease: 'power2.out',
      scrollTrigger: { trigger: '.compare__table', start: 'top 80%' },
    });

    /* FAQ accordion smooth (native details + measured height already via CSS) */
    document.querySelectorAll('.faq__item').forEach((item) => {
      item.addEventListener('toggle', () => {
        if (item.open) {
          document.querySelectorAll('.faq__item[open]').forEach((o) => { if (o !== item) o.open = false; });
        }
        window.ScrollTrigger && window.ScrollTrigger.refresh();
      });
    });

    window.ScrollTrigger.refresh();
  }

  /* ---------- helpers ---------- */
  function revealHeroText(gsap, instant) {
    const words = document.querySelectorAll('.hero__title .line > span');
    if (!words.length) return;
    if (instant) { words.forEach((w) => (w.style.transform = 'none')); return; }
    gsap.to(words, { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: 0.12, delay: 0.2 });
  }

  // Wrap each word of a [data-split] title in an overflow-hidden span for reveal
  function splitLines(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const walk = (node) => {
      const kids = Array.from(node.childNodes);
      kids.forEach((n) => {
        if (n.nodeType === 3 && n.textContent.trim()) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((word) => {
            if (word.trim()) {
              const wrap = document.createElement('span');
              wrap.style.display = 'inline-block';
              wrap.style.overflow = 'hidden';
              wrap.style.verticalAlign = 'top';
              const inner = document.createElement('span');
              inner.className = 'sr-word';
              inner.style.display = 'inline-block';
              inner.textContent = word;
              wrap.appendChild(inner);
              frag.appendChild(wrap);
            } else {
              frag.appendChild(document.createTextNode(word));
            }
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) {
          walk(n);
        }
      });
    };
    walk(el);
  }
})();
