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

  /* Header: solid on scroll, mobile menu */
  var hdr = $('#hdr');
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle('is-solid', window.scrollY > 40); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    var toggle = $('.hdr__toggle'), menu = $('#menu');
    if (toggle && menu) {
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

  /* Reveal on scroll */
  var reveal = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveal.forEach(function (el) { io.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Hero slideshow */
  var slides = $$('[data-slides] .hero__slide');
  if (slides.length > 1 && !reduced) {
    var si = 0;
    setInterval(function () {
      if (document.hidden) return;
      slides[si].classList.remove('is-active');
      si = (si + 1) % slides.length;
      slides[si].classList.add('is-active');
    }, 7000);
  }

  /* Drag carousel */
  $$('[data-carousel]').forEach(function (c) {
    var track = $('.carousel__track', c);
    var step = function () { var li = track.querySelector('li'); return li ? li.getBoundingClientRect().width + 32 : 320; };
    var go = function (dir) { track.scrollBy({ left: dir * step(), behavior: reduced ? 'auto' : 'smooth' }); };
    $('[data-prev]', c).addEventListener('click', function () { go(-1); });
    $('[data-next]', c).addEventListener('click', function () { go(1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; track.classList.add('is-dragging'); }
      track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      setTimeout(function () { track.classList.remove('is-dragging'); }, 0);
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
  });

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
        if (ok) shown++;
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
        .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json().catch(function () { return {}; }); })
        .then(function (data) { if (data && String(data.success) === 'false') throw new Error(data.message || 'rejected'); onSuccess(); })
        .catch(function () {
          btn.disabled = false; status.classList.add('is-error');
          status.innerHTML = 'Something went wrong. Please call <a href="tel:+61434131903">' + CFG.phone + '</a>.';
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
