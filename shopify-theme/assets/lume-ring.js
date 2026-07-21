/* =========================================================
   LUME RING — homepage motion v2
   Zero dependencies. Scroller-agnostic by design:
   - reveals: IntersectionObserver
   - scrub/parallax: rAF + getBoundingClientRect (viewport-
     relative, so it works whether the page scrolls the window
     or Horizon's .page-wrapper)
   Content is never left hidden: states live behind #lume-ring.anim
   and a watchdog strips the class if this file fails to boot.
   ========================================================= */
(function () {
  var root = document.getElementById('lume-ring');
  if (!root) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  var $$ = function (sel, r) {
    return Array.prototype.slice.call((r || root).querySelectorAll(sel));
  };

  // Inline script in the section armed a watchdog; we're alive, disarm it.
  if (window.__lrGuard) clearTimeout(window.__lrGuard);
  if (hasIO && !reduce) root.classList.add('anim');
  else root.classList.remove('anim');

  /* ---------- word splitting for manifesto reveal ---------- */
  $$('.lr-words').forEach(function (el) {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    var idx = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3 && n.textContent.trim()) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (word) {
            if (word.trim()) {
              var s = document.createElement('span');
              s.className = 'w';
              s.style.setProperty('--wi', idx++);
              s.textContent = word;
              frag.appendChild(s);
            } else {
              frag.appendChild(document.createTextNode(word));
            }
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
  });

  /* ---------- tabs ---------- */
  (function () {
    var nav = root.querySelector('.lr-tabnav');
    if (!nav) return;
    var buttons = $$('button', nav);
    var panels = $$('.lr-tabpanel');
    function select(idx) {
      buttons.forEach(function (b, i) {
        b.setAttribute('aria-selected', i === idx ? 'true' : 'false');
        b.setAttribute('tabindex', i === idx ? '0' : '-1');
      });
      panels.forEach(function (p, i) {
        p.classList.toggle('is-active', i === idx);
        p.hidden = i !== idx;
      });
    }
    buttons.forEach(function (b, i) {
      b.addEventListener('click', function () { select(i); });
      b.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = (i + 1) % buttons.length;
        if (e.key === 'ArrowLeft') n = (i - 1 + buttons.length) % buttons.length;
        if (n !== null) { e.preventDefault(); select(n); buttons[n].focus(); }
      });
    });
    select(0);
  })();

  /* ---------- accordions: one open per group ---------- */
  ['.lr-spec', '.lr-faq details'].forEach(function (sel) {
    var group = $$(sel);
    group.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) group.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  });

  /* ---------- reveals + counters (IntersectionObserver) ---------- */
  if (!hasIO || reduce) {
    $$('[data-count]').forEach(function (el) {
      el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
    });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      if (entry.target.hasAttribute('data-count')) countUp(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

  $$('.lr-r, .lr-words').forEach(function (el) { io.observe(el); });
  $$('[data-count]').forEach(function (el) { io.observe(el); });

  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    var dur = 1400, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* =========================================================
     Scroll-scrubbed motion: pinned chapters + parallax.
     Damping makes the rendered value chase the scroll value —
     that lag is what reads as "smooth" instead of rigid.
     ========================================================= */
  (function () {
    if (reduce) return;
    var pins = $$('[data-pin]');
    var paras = $$('[data-parallax]');
    if (!pins.length && !paras.length) return;

    var DAMP = 0.085;
    var smooth = new WeakMap();

    var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
    var lerp = function (a, b, t) { return a + (b - a) * t; };

    function damp(key, target) {
      var cur = smooth.get(key);
      if (cur === undefined) cur = target;
      cur += (target - cur) * DAMP;
      if (Math.abs(target - cur) < 0.0004) cur = target;
      smooth.set(key, cur);
      return cur;
    }
    function progressOf(el) {
      var r = el.getBoundingClientRect();
      var span = r.height - window.innerHeight;
      if (span <= 0) return r.top < window.innerHeight ? 1 : 0;
      return clamp(-r.top / span, 0, 1);
    }
    function inView(el, pad) {
      var r = el.getBoundingClientRect();
      return r.bottom > -(pad || 0) && r.top < window.innerHeight + (pad || 0);
    }

    function frame() {
      pins.forEach(function (pin) {
        if (!inView(pin, 220)) return;
        var raw = progressOf(pin);
        var p = damp(pin, raw);

        var media = pin.querySelector('[data-pin-media]');
        if (media) {
          var scale = lerp(0.6, 2.0, p);
          var rot = lerp(-8, 20, p);
          var y = lerp(28, -28, p);
          media.style.transform =
            'translate3d(0,' + y.toFixed(2) + 'px,0) scale(' + scale.toFixed(3) + ') rotate(' + rot.toFixed(2) + 'deg)';
        }
        var rail = pin.querySelector('[data-rail]');
        if (rail) rail.style.width = (p * 100).toFixed(1) + '%';

        // captions switch on the raw value so boundaries are exact
        $$('[data-from]', pin).forEach(function (cap) {
          var from = parseFloat(cap.getAttribute('data-from'));
          var to = parseFloat(cap.getAttribute('data-to'));
          cap.classList.toggle('on', raw >= from && raw <= to);
        });
      });

      paras.forEach(function (el) {
        if (!inView(el, 120)) return;
        var amt = parseFloat(el.getAttribute('data-parallax')) || 0.12;
        var r = el.getBoundingClientRect();
        var vh = window.innerHeight;
        var rel = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2);
        var sm = damp(el, rel);
        el.style.transform = 'translate3d(0,' + (sm * amt * 100).toFixed(2) + 'px,0)';
      });

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();
})();
