(function () {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('mobileMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      if (open) { menu.setAttribute('hidden', ''); }
      else { menu.removeAttribute('hidden'); }
    });
  }

  // Set suburb on appraisal form if landing on a suburb page
  const path = location.pathname.split('/').filter(Boolean);
  if (path[0] === 'lower-north-shore' && path[1]) {
    const slug = path[1];
    const name = slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
    document.querySelectorAll('#formSuburb').forEach(el => {
      if (!el.value) el.value = name;
    });
  }
})();
