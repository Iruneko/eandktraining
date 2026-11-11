// E&K Wellness - Episode 1 script page
(function () {
  'use strict';

  // ---------- safe storage ----------
  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { /* storage unavailable: page still works */ }
    return null;
  }

  // ---------- on-screen text toggle ----------
  var toggleBtn = document.getElementById('toggleOnscreen');
  function setOnscreen(hidden) {
    document.body.classList.toggle('hide-onscreen', hidden);
    toggleBtn.textContent = hidden ? 'Show on-screen text' : 'Hide on-screen text';
    toggleBtn.setAttribute('aria-pressed', String(!hidden));
    store('ek-hide-onscreen', hidden ? '1' : '0');
  }
  toggleBtn.addEventListener('click', function () {
    setOnscreen(!document.body.classList.contains('hide-onscreen'));
  });
  setOnscreen(store('ek-hide-onscreen') === '1');

  // ---------- print ----------
  document.getElementById('printPage').addEventListener('click', function () { window.print(); });

  // ---------- checklist (saved in this browser) ----------
  var boxes = document.querySelectorAll('.checklist input');
  var saved = [];
  try { saved = JSON.parse(store('ek-checks') || '[]'); } catch (e) { saved = []; }
  boxes.forEach(function (box, i) {
    box.checked = !!saved[i];
    box.addEventListener('change', function () {
      store('ek-checks', JSON.stringify(Array.prototype.map.call(boxes, function (b) { return b.checked; })));
    });
  });
  document.getElementById('resetChecks').addEventListener('click', function () {
    boxes.forEach(function (b) { b.checked = false; });
    store('ek-checks', '[]');
  });

  // ---------- schedule rows jump to sections ----------
  var rows = document.querySelectorAll('tbody tr[data-target]');
  rows.forEach(function (row) {
    row.tabIndex = 0;
    function go() {
      var el = document.getElementById(row.dataset.target);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    row.addEventListener('click', go);
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  });

  // ---------- highlight current section in the schedule ----------
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          rows.forEach(function (r) { r.classList.toggle('active', r.dataset.target === entry.target.id); });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    document.querySelectorAll('.segment').forEach(function (s) { obs.observe(s); });
  }

  // ---------- copy buttons ----------
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = document.getElementById(btn.dataset.copy).textContent;
      function done(ok) {
        btn.textContent = ok ? 'Copied!' : 'Press Ctrl+C';
        btn.classList.toggle('done', ok);
        setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('done'); }, 1800);
      }
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function' && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
      } else {
        done(fallbackCopy(text));
      }
    });
  });

  // ---------- reading progress + back-to-top ----------
  var bar = document.getElementById('progress');
  var topBtn = document.getElementById('toTop');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    topBtn.classList.toggle('show', h.scrollTop > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  onScroll();
})();
