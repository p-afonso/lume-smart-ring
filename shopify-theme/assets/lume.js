/* =========================================================
   LUME — motion & interactions (Shopify theme build)
   Native scroll + GSAP ScrollTrigger. No Lenis (conflicts
   with theme scroll). Content is never left invisible:
   hidden states are gated behind #lume-app.anim, which is
   removed if GSAP fails to initialize.
   ========================================================= */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none)').matches;
  var APP = function () { return document.getElementById('lume-app'); };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  function waitFor(check, cb, tries) {
    tries = tries == null ? 90 : tries;
    if (check()) return cb(true);
    if (tries <= 0) return cb(false);
    requestAnimationFrame(function () { waitFor(check, cb, tries - 1); });
  }
  function revealAll() {
    var a = APP();
    if (a) a.classList.remove('anim'); // drop hidden states -> everything visible
  }
  // Horizon scrolls inside .page-wrapper (html/body are overflow:hidden), not
  // the window. Return whichever element actually scrolls so ScrollTrigger and
  // the progress bar track the real scroll position.
  function getScroller() {
    var pw = document.querySelector('.page-wrapper');
    if (pw && pw.scrollHeight > pw.clientHeight + 40) return pw;
    if (document.documentElement.scrollHeight > window.innerHeight + 40) return window;
    return pw || window;
  }

  ready(function () {
    buildStars();
    initCursor();
    initProgress();

    var done = false;
    waitFor(function () { return window.gsap && window.ScrollTrigger; }, function (ok) {
      if (!ok) { revealAll(); return; }
      try { initGSAP(); done = true; }
      catch (e) { revealAll(); }
    });
    // Safety net: if anything stalls, never leave content hidden
    setTimeout(function () { if (!done) revealAll(); }, 2600);
  });

  /* ---------- Stars ---------- */
  function buildStars() {
    var box = $('[data-stars]');
    if (!box) return;
    var html = '';
    for (var i = 0; i < 70; i++) {
      var x = Math.random() * 100, y = Math.random() * 100;
      var d = (Math.random() * 4 + 1).toFixed(2);
      var delay = (Math.random() * 4).toFixed(2);
      var s = (Math.random() * 1.6 + 0.6).toFixed(2);
      html += '<i style="left:' + x + '%;top:' + y + '%;width:' + s + 'px;height:' + s + 'px;animation-duration:' + d + 's;animation-delay:' + delay + 's"></i>';
    }
    box.innerHTML = html;
  }

  /* ---------- Custom cursor ---------- */
  function initCursor() {
    if (isTouch) return;
    var ring = $('.cursor'), dot = $('.cursor-dot');
    if (!ring || !dot) return;
    var rx = innerWidth / 2, ry = innerHeight / 2, dx = rx, dy = ry;
    window.addEventListener('mousemove', function (e) {
      dx = e.clientX; dy = e.clientY;
      dot.style.transform = 'translate(' + dx + 'px,' + dy + 'px) translate(-50%,-50%)';
    });
    (function loop() {
      rx += (dx - rx) * 0.18; ry += (dy - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
    $$('#lume-app a, #lume-app button, #lume-app [data-hover], #lume-app summary, #lume-app .feature-card, #lume-app .life__card, #lume-app .review').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('is-hover'); });
    });
    $$('#lume-app .btn').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--bx', (e.clientX - r.left) + 'px');
        b.style.setProperty('--by', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Scroll progress ---------- */
  function initProgress() {
    var bar = $('.scroll-progress span');
    if (!bar) return;
    function upd() {
      var sc = getScroller();
      var top = sc === window ? window.scrollY : sc.scrollTop;
      var h = sc === window ? (document.documentElement.scrollHeight - innerHeight) : (sc.scrollHeight - sc.clientHeight);
      bar.style.width = (h > 0 ? (top / h) * 100 : 0) + '%';
    }
    upd();
    // Listen on both so we catch whichever ends up scrolling.
    window.addEventListener('scroll', upd, { passive: true });
    var pw = document.querySelector('.page-wrapper');
    if (pw) pw.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
  }

  /* ---------- GSAP (native scroll) ---------- */
  function initGSAP() {
    var gsap = window.gsap;
    var ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    var app = APP();
    if (app) app.classList.add('anim'); // we can animate -> enable hidden states

    // Bind ScrollTrigger to the element that actually scrolls. Horizon scrolls
    // inside .page-wrapper (html/body are overflow:hidden), NOT the window, so
    // ScrollTrigger must be told this or no scroll animation ever fires.
    var scroller = document.querySelector('.page-wrapper');
    if (scroller && scroller.scrollHeight > scroller.clientHeight + 20) {
      ST.defaults({ scroller: scroller });
    } else {
      scroller = null; // window is the scroller (default)
    }
    window.__lumeBuild = 'scroller-v2';
    window.__lumeScroller = scroller ? 'page-wrapper' : 'window';

    if (reduce) { revealAll(); return; }

    // On-load reveals (hero sub/cta/trust)
    $$('#lume-app .reveal').forEach(function (el, i) {
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.12 * i + 0.25 });
    });

    // Hero ring: slow spin + gentle zoom as you scroll past hero
    var heroRing = $('[data-ring] .ring');
    if (heroRing) {
      heroRing.classList.add('ring--spin');
      gsap.to('[data-ring]', {
        scale: 1.55, yPercent: 12, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
      gsap.to('.hero__content', {
        y: -50, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '70% top', scrub: true }
      });
    }

    // Scroll-in fades
    $$('#lume-app [data-fade], #lume-app [data-card]').forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    // Split-title word reveal
    $$('#lume-app [data-split]').forEach(function (title) {
      splitLines(title);
      gsap.fromTo(title.querySelectorAll('.sr-word'),
        { yPercent: 110 },
        { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.1,
          scrollTrigger: { trigger: title, start: 'top 88%', once: true } });
    });

    // Section 1 — "smartwatch ficou no passado": simple reveal (no pin)
    var pastRing = $('[data-past-ring]');
    if (pastRing) {
      gsap.from(pastRing, { opacity: 0, scale: 0.7, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.past', start: 'top 70%', once: true } });
    }

    // Dashboard bars
    $$('#lume-app .bar i').forEach(function (b) {
      gsap.to(b, { scaleY: 1, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.dashboard', start: 'top 80%', once: true } });
    });

    // Count-up numbers
    $$('#lume-app [data-count]').forEach(function (el) {
      var end = parseFloat(el.dataset.count);
      var suffix = el.dataset.suffix || '';
      var obj = { v: 0 };
      gsap.to(obj, {
        v: end, duration: 1.6, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: function () { el.textContent = Math.round(obj.v).toLocaleString('pt-BR') + suffix; }
      });
    });

    // Material ring parallax
    if ($('.ring--macro')) {
      gsap.to('.ring--macro', { yPercent: -10, rotate: 16, ease: 'none',
        scrollTrigger: { trigger: '.material', start: 'top bottom', end: 'bottom top', scrub: true } });
    }

    // Lifestyle now uses native horizontal scroll (CSS) — no pin.

    // App phones parallax
    if ($('.phone--back')) gsap.to('.phone--back', { y: -36, scrollTrigger: { trigger: '.app', start: 'top bottom', end: 'bottom top', scrub: true } });
    if ($('.phone--front')) gsap.to('.phone--front', { y: 36, scrollTrigger: { trigger: '.app', start: 'top bottom', end: 'bottom top', scrub: true } });

    // Compare rows
    if ($('.compare__table')) {
      gsap.from('#lume-app [data-row]', { opacity: 0, x: -18, duration: 0.7, stagger: 0.07, ease: 'power2.out',
        scrollTrigger: { trigger: '.compare__table', start: 'top 82%', once: true } });
    }

    // FAQ: single-open + refresh on toggle
    $$('#lume-app .faq__item').forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (item.open) $$('#lume-app .faq__item[open]').forEach(function (o) { if (o !== item) o.open = false; });
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      });
    });

    // Recalculate after the CSS scroll override + fonts/images settle so
    // triggers measure the correct (tall) document height, not the initial 900px.
    window.addEventListener('load', function () { ST.refresh(); });
    [150, 600, 1400, 2500].forEach(function (t) { setTimeout(function () { ST.refresh(); }, t); });
  }

  /* ---------- helpers ---------- */
  function splitLines(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3 && n.textContent.trim()) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (word) {
            if (word.trim()) {
              var wrap = document.createElement('span');
              wrap.style.display = 'inline-block';
              wrap.style.overflow = 'hidden';
              wrap.style.verticalAlign = 'top';
              var inner = document.createElement('span');
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
    })(el);
  }
})();
