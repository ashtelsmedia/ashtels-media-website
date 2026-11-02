/* Ashtels Media - site behaviour (plain JavaScript, no framework) */
(function () {
  'use strict';
  var WHATSAPP_NUMBER = '918310872992'; // change here if the WhatsApp number changes
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Header: scroll style + mobile menu ---------- */
  var header = $('#site-header');
  var toggle = $('#menu-toggle');
  var menu = $('#mobile-menu');
  var menuOpen = false;
  var ICON_MENU = toggle ? toggle.innerHTML : '';
  var ICON_CLOSE = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';
  var SOLID = ['glass', 'border-brand-line', 'shadow-[0_8px_40px_rgba(4,157,217,0.08)]'];
  var CLEAR = ['bg-transparent', 'border-transparent'];

  function paintHeader() {
    if (!header) return;
    var solid = window.scrollY > 24 || menuOpen;
    SOLID.forEach(function (c) { header.classList.toggle(c, solid); });
    CLEAR.forEach(function (c) { header.classList.toggle(c, !solid); });
  }
  function setMenu(open) {
    menuOpen = open;
    if (menu) menu.hidden = !open;
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      toggle.innerHTML = open ? ICON_CLOSE : ICON_MENU;
    }
    document.body.style.overflow = open ? 'hidden' : '';
    paintHeader();
  }
  if (toggle) toggle.addEventListener('click', function () { setMenu(!menuOpen); });
  if (menu) $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1024 && menuOpen) setMenu(false); });
  window.addEventListener('scroll', paintHeader, { passive: true });
  paintHeader();

  /* ---------- Scroll reveal ---------- */
  var revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Number counters ---------- */
  var counters = $$('[data-count]');
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var start = performance.now(), dur = 1200;
    (function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(eased * target)).padStart(2, '0');
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }
  if ('IntersectionObserver' in window && !reduced) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { el.textContent = '00'; cio.observe(el); });
  }

  /* ---------- Hero particles ---------- */
  var canvas = $('canvas[data-particles]');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var particles = [];
    for (var i = 0; i < 46; i++) {
      particles.push({ x: Math.random(), y: Math.random(), r: 0.8 + Math.random() * 2.2,
        vy: 0.0002 + Math.random() * 0.0005, vx: (Math.random() - 0.5) * 0.0002, o: 0.15 + Math.random() * 0.4 });
    }
    var raf = 0, running = true;
    var resize = function () {
      canvas.width = canvas.offsetWidth * DPR; canvas.height = canvas.offsetHeight * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    var draw = function () {
      var w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      particles.forEach(function (p) {
        p.y -= p.vy; p.x += p.vx;
        if (p.y < -0.02) p.y = 1.02;
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;
        ctx.beginPath(); ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(80, 212, 242, ' + p.o + ')';
        ctx.shadowColor = 'rgba(4, 178, 217, 0.8)'; ctx.shadowBlur = 6; ctx.fill();
      });
      if (running && !reduced) raf = requestAnimationFrame(draw);
    };
    resize(); window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () {
      running = document.visibilityState === 'visible';
      if (running && !reduced) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
    });
    if (reduced) draw(); else raf = requestAnimationFrame(draw);
  }

  /* ---------- Services: Learn more / Show less ---------- */
  $$('[data-svc-toggle]').forEach(function (btn) {
    var card = btn.closest('article');
    var details = $('[data-svc-details]', card);
    var preview = $('[data-svc-preview]', card);
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      details.hidden = !open;
      if (preview) preview.style.display = open ? 'none' : '';
      $('[data-icon-closed]', btn).hidden = open;
      $('[data-icon-open]', btn).hidden = !open;
      $('[data-label]', btn).textContent = open ? 'Show Less' : 'Learn More';
    });
  });
  // open the service named in the URL (e.g. /services/#seo)
  if (location.hash) { var t = $(location.hash.replace(/[^#\w-]/g, '')); if (t) setTimeout(function () { t.scrollIntoView(); }, 50); }

  /* ---------- Work: category filter ---------- */
  var filters = $$('[data-filter]');
  if (filters.length) {
    var ON = 'border-brand-bright bg-brand-blue text-white'.split(' ');
    var OFF = 'border-brand-line text-slate-400 hover:border-brand-bright hover:text-brand-bright'.split(' ');
    var cards = $$('article[data-category]');
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.textContent.trim();
        filters.forEach(function (b) {
          var on = b === btn;
          b.setAttribute('aria-selected', String(on));
          ON.forEach(function (c) { b.classList.toggle(c, on); });
          OFF.forEach(function (c) { b.classList.toggle(c, !on); });
        });
        cards.forEach(function (c) {
          c.style.display = (cat === 'All' || c.getAttribute('data-category') === cat) ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Process: timeline progress line ---------- */
  var line = $('[data-progress-line]');
  if (line) {
    var host = line.parentElement;
    var update = function () {
      var r = host.getBoundingClientRect();
      var p = (window.innerHeight * 0.6 - r.top) / r.height;
      line.style.transform = 'scaleY(' + Math.max(0, Math.min(1, p)) + ')';
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Contact form -> opens WhatsApp with the enquiry ---------- */
  var form = $('#enquiry-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var v = function (id) { var el = $('#' + id); return el ? el.value.trim() : ''; };
      var ref = 'ASH-' + Date.now().toString(36).toUpperCase().slice(-6);
      var lines = [
        'Hi Ashtels Media, I\'d like to start a project. (Ref ' + ref + ')',
        'Name: ' + v('cf-name'),
        v('cf-company') && 'Company: ' + v('cf-company'),
        'Email: ' + v('cf-email'),
        v('cf-phone') && 'Phone: ' + v('cf-phone'),
        v('cf-service') && 'Service: ' + v('cf-service'),
        v('cf-budget') && 'Budget: ' + v('cf-budget'),
        v('cf-message') && 'Message: ' + v('cf-message')
      ].filter(Boolean);
      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      var w = window.open(url, '_blank', 'noopener');
      $('#enquiry-ref').textContent = ref;
      form.hidden = true;
      $('#enquiry-success').hidden = false;
      if (!w) { location.href = url; } // popup blocked: continue in this tab
    });
  }
})();
