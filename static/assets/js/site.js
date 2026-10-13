/* alex-banning.com: progressive enhancement only. Every page works without this file. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CFG = window.AB || {};
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };

  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var root = document.documentElement;

  /* Header: solid once the page leaves the top (observer on a sentinel, no scroll listener) */
  var hdr = $('#hdr');
  if (hdr) {
    if ('IntersectionObserver' in window) {
      var sentinel = document.createElement('div');
      sentinel.setAttribute('aria-hidden', 'true');
      sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:48px;pointer-events:none';
      document.body.prepend(sentinel);
      new IntersectionObserver(function (en) { hdr.classList.toggle('is-solid', !en[0].isIntersecting); }).observe(sentinel);
    } else {
      hdr.classList.add('is-solid');
    }
    var toggle = $('.hdr__toggle'), menu = $('#menu');
    if (toggle && menu) {
      $$('nav > *', menu).forEach(function (el, k) { el.style.setProperty('--i', k); });
      var setOpen = function (open) {
        toggle.setAttribute('aria-expanded', String(open));
        menu.hidden = !open;
        document.body.classList.toggle('menu-open', open);
        document.body.style.overflow = open ? 'hidden' : '';
      };
      toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setOpen(false); toggle.focus(); } });
    }
  }

  /* Page ready: the hero aperture opens once the first photograph can paint */
  var ready = function () { root.classList.add('is-ready'); };
  var heroImg = $('.hero--full .hero__slide img');
  if (heroImg && !reduced) {
    var done = false, go = function () { if (!done) { done = true; requestAnimationFrame(function () { requestAnimationFrame(ready); }); } };
    if (heroImg.complete && heroImg.naturalWidth) go();
    else { heroImg.addEventListener('load', go, { once: true }); heroImg.addEventListener('error', go, { once: true }); }
    setTimeout(go, 1400);
  } else {
    ready();
  }

  /* Split display headings into words so they can rise line by line */
  function split(el) {
    var k = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'), inner = document.createElement('span');
            w.className = 'w'; inner.style.setProperty('--i', k++); inner.textContent = part;
            w.appendChild(inner); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains('w')) {
          walk(n);
        }
      });
    })(el);
    el.classList.add('is-split');
  }
  if (!reduced) {
    $$('main .display, main [data-split]').forEach(function (el) {
      if (el.closest('.hero') || el.querySelector('a, br')) return;
      el.setAttribute('data-split', '');
      split(el);
    });
  }

  /* Reveal on scroll */
  var reveal = $$('[data-reveal], [data-split]');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    reveal.forEach(function (el) { io.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Hero slideshow: each room wipes in, the caption and progress bar follow */
  var slideRoot = $('[data-slides]');
  var slides = $$('.hero__slide', slideRoot || document);
  if (slides.length > 1 && !reduced) {
    var SLIDE = 7000, si = 0, timer = null, visible = true;
    var bar = $('[data-bar]'), roomEl = $('[data-room]'), idxEl = $('[data-index]');
    root.style.setProperty('--slide', SLIDE / 1000 + 's');
    var runBar = function () { if (!bar) return; bar.classList.remove('is-running'); void bar.offsetWidth; bar.classList.add('is-running'); };
    var advance = function () {
      if (document.hidden || !visible) return;
      var prev = slides[si];
      si = (si + 1) % slides.length;
      var next = slides[si];
      slides.forEach(function (s) { s.classList.remove('is-prev', 'is-entering'); });
      prev.classList.remove('is-active'); prev.classList.add('is-prev');
      next.classList.add('is-entering');
      void next.offsetWidth;
      next.classList.add('is-active');
      if (roomEl) roomEl.textContent = next.getAttribute('data-caption');
      if (idxEl) idxEl.textContent = String(si + 1).padStart(2, '0');
      runBar();
    };
    window.addEventListener('load', function () { $$('img', slideRoot).forEach(function (img) { img.loading = 'eager'; }); });
    var start = function () { if (!timer) { runBar(); timer = setInterval(advance, SLIDE); } };
    var stop = function () { clearInterval(timer); timer = null; if (bar) bar.classList.remove('is-running'); };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; visible ? start() : stop(); }).observe(slideRoot);
    } else { start(); }
  }

  /* Pointer followers: one rAF loop, eased toward the pointer */
  function follower(el) {
    var x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf = null;
    var tick = function () {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(tick) : null;
    };
    return {
      move: function (e, snap) { tx = e.clientX; ty = e.clientY; if (snap) { x = tx; y = ty; } if (!raf) raf = requestAnimationFrame(tick); }
    };
  }
  if (fine && !reduced) {
    /* "View" label over result photographs */
    $$('[data-cursor]').forEach(function (zone) {
      var c = document.createElement('div');
      c.className = 'cursor'; c.setAttribute('aria-hidden', 'true'); c.textContent = zone.getAttribute('data-cursor');
      document.body.appendChild(c);
      var f = follower(c), on = false;
      zone.addEventListener('pointermove', function (e) {
        var over = e.target.closest('.card__media');
        if (over && !on) { f.move(e, true); }
        on = Boolean(over); c.classList.toggle('is-on', on); f.move(e);
      });
      zone.addEventListener('pointerleave', function () { on = false; c.classList.remove('is-on'); });
    });

    /* Suburb index: a photograph from that suburb follows the pointer */
    $$('[data-preview]').forEach(function (list) {
      var p = document.createElement('div'), img = document.createElement('img');
      p.className = 'preview'; p.setAttribute('aria-hidden', 'true'); img.alt = ''; img.decoding = 'async';
      p.appendChild(img); document.body.appendChild(p);
      var f = follower(p);
      $$('a[data-img]', list).forEach(function (a) {
        a.addEventListener('pointerenter', function (e) { img.src = a.getAttribute('data-img'); f.move(e, !p.classList.contains('is-on')); p.classList.add('is-on'); });
        a.addEventListener('pointermove', function (e) { f.move(e); });
        a.addEventListener('pointerleave', function () { p.classList.remove('is-on'); });
      });
    });

    /* Private Collection glimpse: the pointer clears a circle of the frosted photograph */
    $$('[data-glimpse]').forEach(function (g) {
      g.addEventListener('pointerenter', function () { g.classList.add('is-looking'); });
      g.addEventListener('pointerleave', function () { g.classList.remove('is-looking'); });
      g.addEventListener('pointermove', function (e) {
        var r = g.getBoundingClientRect();
        g.style.setProperty('--x', (e.clientX - r.left) + 'px');
        g.style.setProperty('--y', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* Review rotator */
  $$('[data-rotator]').forEach(function (r) {
    var items = $$('.rotator__slide', r), n = items.length, i = 0, timer = null;
    var count = $('[data-count]', r);
    var show = function (k) {
      items[i].classList.remove('is-active'); items[i].hidden = true;
      i = (k + n) % n;
      items[i].hidden = false; items[i].classList.add('is-active');
      count.textContent = String(i + 1).padStart(2, '0');
    };
    var stop = function () { clearInterval(timer); timer = null; };
    var start = function () { if (!reduced && !timer) timer = setInterval(function () { show(i + 1); }, 7000); };
    $('[data-prev]', r).addEventListener('click', function () { stop(); show(i - 1); });
    $('[data-next]', r).addEventListener('click', function () { stop(); show(i + 1); });
    r.addEventListener('mouseenter', stop);
    r.addEventListener('focusin', stop);
    start();
  });

  /* Results filters */
  var filters = $('[data-filters]');
  if (filters) {
    var cards = $$('[data-results] > li');
    var countEl = $('[data-count]', filters);
    var apply = function () {
      var fd = new FormData(filters), type = fd.get('type'), sub = fd.get('suburb'), yr = fd.get('year'), shown = 0;
      cards.forEach(function (li) {
        var ok = (!type || li.dataset.type === type) && (!sub || li.dataset.suburb === sub) && (!yr || li.dataset.year === yr);
        li.classList.toggle('is-hidden', !ok);
        li.classList.remove('is-shown');
        if (ok) { li.style.setProperty('--k', Math.min(shown, 12)); void li.offsetWidth; li.classList.add('is-shown'); shown++; }
      });
      countEl.textContent = shown;
    };
    filters.addEventListener('change', apply);
    filters.addEventListener('submit', function (e) { e.preventDefault(); });
  }

  /* Lead tracking */
  function trackLead(kind) {
    try {
      if (window.gtag) {
        window.gtag('event', 'generate_lead', { form_name: kind });
        if (CFG.adsSendTo) window.gtag('event', 'conversion', { send_to: CFG.adsSendTo });
      }
      if (window.fbq) window.fbq('track', 'Lead', { content_name: kind });
      if (window.va) window.va('event', { name: 'Lead', data: { form: kind, page: location.pathname } });
    } catch (e) { /* never block a lead on analytics */ }
  }

  /* Validation helper */
  function validate(scope) {
    var ok = true, first = null;
    $$('input, select, textarea', scope).forEach(function (el) {
      if (el.closest('.hp')) return;
      var valid = el.checkValidity();
      if (el.type === 'radio') {
        var group = $$('input[name="' + el.name + '"]', scope);
        valid = !group.some(function (g) { return g.required; }) || group.some(function (g) { return g.checked; });
      }
      el.setAttribute('aria-invalid', valid ? 'false' : 'true');
      if (!valid) { ok = false; if (!first) first = el; }
    });
    if (first) first.focus();
    return ok;
  }

  /* Forms: prefill, multi-step, submit via fetch */
  var params = new URLSearchParams(location.search);
  $$('form[data-lead]').forEach(function (form) {
    var page = form.querySelector('input[name="page"]');
    if (page) page.value = location.pathname;
    var sub = form.querySelector('input[name="suburb"]');
    if (sub && !sub.value && params.get('suburb')) sub.value = params.get('suburb');
    var status = $('.form__status', form);
    var kind = form.getAttribute('data-lead');

    var steps = $$('.step', form), cur = 0;
    var prog = $$('.steps__progress li', form);
    var prev = $('[data-prev]', form), next = $('[data-next]', form), submit = $('[data-submit]', form);
    var render = function () {
      steps.forEach(function (s, k) { s.classList.toggle('is-current', k === cur); });
      prog.forEach(function (p, k) { p.classList.toggle('is-on', k <= cur); });
      if (prev) prev.hidden = cur === 0;
      if (next) next.hidden = cur === steps.length - 1;
      if (submit) submit.hidden = cur !== steps.length - 1;
    };
    if (steps.length) {
      render();
      next.addEventListener('click', function () {
        if (!validate(steps[cur])) return;
        cur++; render();
        var f = $('input, select', steps[cur]); if (f) f.focus();
      });
      prev.addEventListener('click', function () { cur--; render(); });
      form.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT' && cur < steps.length - 1) { e.preventDefault(); next.click(); }
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) { status.textContent = 'Please complete the highlighted fields.'; status.classList.add('is-error'); return; }
      if (form._honey && form._honey.value) return;
      var btn = form.querySelector('button[type="submit"]');
      var onSuccess = function () {
        trackLead(kind);
        var gate = form.closest('[data-gated]');
        if (gate) { unlock(gate); store.set('ab-gate-' + gate.getAttribute('data-gated'), '1'); return; }
        window.location.href = '/thank-you/?form=' + encodeURIComponent(kind);
      };
      if (!CFG.endpoint) {
        status.classList.add('is-error');
        status.innerHTML = 'Online forms are being connected. Please call <a href="tel:+61434131903">' + CFG.phone + '</a> or email <a href="mailto:' + CFG.email + '">' + CFG.email + '</a>.';
        return;
      }
      btn.disabled = true; status.classList.remove('is-error'); status.textContent = 'Sending…';
      // FormSubmit answers JSON on its /ajax/ path; other providers (e.g. Formspree) use the URL as given.
      var url = CFG.endpoint.replace('://formsubmit.co/', '://formsubmit.co/ajax/');
      fetch(url, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (data) { if (!res.ok && !(data && data.message)) throw new Error(String(res.status)); return data; }); })
        .then(function (data) { if (data && String(data.success) === 'false') throw new Error(data.message || 'rejected'); onSuccess(); })
        .catch(function (err) {
          btn.disabled = false; status.classList.add('is-error');
          var why = err && err.message && !(err instanceof TypeError) && !/^\d+$/.test(err.message) ? err.message : '';
          if (window.console) console.warn('Form submission failed:', err);
          status.textContent = '';
          status.appendChild(document.createTextNode((why ? why + ' ' : 'Something went wrong. ') + 'Please call '));
          var a = document.createElement('a'); a.href = 'tel:+61434131903'; a.textContent = CFG.phone;
          status.appendChild(a); status.appendChild(document.createTextNode('.'));
        });
    });
  });

  /* Private Collection gate */
  function unlock(el) {
    el.classList.add('is-unlocked');
    var g = $('[data-gate]', el), c = $('[data-gated-content]', el);
    if (g) g.hidden = true;
    if (c) c.hidden = false;
  }
  $$('[data-gated]').forEach(function (el) {
    if (store.get('ab-gate-' + el.getAttribute('data-gated'))) unlock(el);
  });

  /* Lazy map */
  var map = $('[data-map]');
  if (map && 'IntersectionObserver' in window) {
    var mo = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      mo.disconnect();
      var f = document.createElement('iframe');
      f.src = map.getAttribute('data-map'); f.loading = 'lazy'; f.title = 'Map of the Raine & Horne Lane Cove office';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      map.insertBefore(f, map.firstChild);
    }, { rootMargin: '200px' });
    mo.observe(map);
  }

  /* Google Places autocomplete (only when a key is configured) */
  var placeInputs = $$('[data-places]');
  if (CFG.mapsKey && placeInputs.length) {
    var loadPlaces = function () {
      if (window.google && window.google.maps) return;
      window.__abPlaces = function () {
        placeInputs.forEach(function (input) {
          var ac = new google.maps.places.Autocomplete(input, { componentRestrictions: { country: 'au' }, fields: ['formatted_address', 'address_components'], types: ['address'] });
          ac.addListener('place_changed', function () {
            var p = ac.getPlace(); if (!p || !p.address_components) return;
            var loc = p.address_components.find(function (c) { return c.types.indexOf('locality') > -1; });
            var sub = input.form && input.form.querySelector('input[name="suburb"]');
            if (loc && sub) sub.value = loc.long_name;
          });
        });
      };
      var s = document.createElement('script');
      s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(CFG.mapsKey) + '&libraries=places&callback=__abPlaces&loading=async';
      s.async = true; document.head.appendChild(s);
    };
    placeInputs.forEach(function (i) { i.addEventListener('focus', loadPlaces, { once: true }); });
  }
})();
