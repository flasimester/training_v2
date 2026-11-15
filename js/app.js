(function () {
  'use strict';

  var DAYS = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'notes'];
  var KEYS = { progress: 'descent-proof-progress', phase: 'descent-proof-phase', day: 'descent-proof-day' };
  var INFO = window.DP_INFO || {};

  var navBtns = document.querySelectorAll('.daynav button[data-day]');
  var sections = document.querySelectorAll('section.day');
  var hero = document.querySelector('.hero');

  /* ---------- storage (fails soft: private mode, blocked storage, corrupt JSON) ---------- */
  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
  }

  /* ---------- tabs ---------- */
  function showDay(day, opts) {
    opts = opts || {};
    if (DAYS.indexOf(day) === -1) day = 'd1';
    sections.forEach(function (s) { s.classList.toggle('active', s.id === day); });
    navBtns.forEach(function (b) {
      var on = b.dataset.day === day;
      b.classList.toggle('active', on);
      if (on) {
        b.setAttribute('aria-current', 'page');
      } else {
        b.removeAttribute('aria-current');
      }
    });
    save(KEYS.day, day);
    if (opts.fromHash !== true && location.hash !== '#' + day) {
      try { history.replaceState(null, '', '#' + day); } catch (e) { /* file:// etc. */ }
    }
    // keep the reader at the top of the new day instead of mid-page
    if (opts.noScroll !== true && window.scrollY > hero.offsetHeight) window.scrollTo(0, hero.offsetHeight);
  }
  navBtns.forEach(function (b) {
    b.addEventListener('click', function () { showDay(b.dataset.day); });
  });
  window.addEventListener('hashchange', function () {
    var d = location.hash.slice(1);
    if (DAYS.indexOf(d) !== -1) showDay(d, { fromHash: true });
  });

  /* ---------- progress ---------- */
  var state = load(KEYS.progress, {});
  if (!state || typeof state !== 'object' || Array.isArray(state)) state = {};

  function updateBadges() {
    var phase2 = document.body.getAttribute('data-phase') === '2';
    document.querySelectorAll('.progress-badge[data-badge]').forEach(function (badge) {
      var table = document.querySelector('table[data-day-table="' + badge.dataset.badge + '"]');
      if (!table) return;
      var rows = Array.prototype.filter.call(table.querySelectorAll('tbody tr'), function (tr) {
        return tr.querySelector('input[type=checkbox]') && (phase2 || !tr.classList.contains('phase2'));
      });
      var done = rows.filter(function (tr) { return tr.querySelector('input').checked; }).length;
      badge.textContent = done + '/' + rows.length;
      badge.classList.toggle('complete', rows.length > 0 && done === rows.length);
    });
  }

  document.querySelectorAll('input[type=checkbox][data-id]').forEach(function (cb) {
    var tr = cb.closest('tr');
    if (state[cb.dataset.id]) { cb.checked = true; tr.classList.add('done'); }
    cb.addEventListener('change', function () {
      if (cb.checked) state[cb.dataset.id] = true; else delete state[cb.dataset.id];
      tr.classList.toggle('done', cb.checked);
      save(KEYS.progress, state);
      updateBadges();
    });
    // the whole row is a tap target (the checkbox itself is small)
    tr.addEventListener('click', function (e) {
      if (e.target === cb || e.target.closest('a, button')) return;
      cb.checked = !cb.checked;
      cb.dispatchEvent(new Event('change'));
    });
  });

  document.getElementById('resetBtn').addEventListener('click', function () {
    if (!window.confirm('Clear all checkmarks and start a fresh cycle?')) return;
    state = {};
    save(KEYS.progress, state);
    document.querySelectorAll('input[type=checkbox][data-id]').forEach(function (cb) {
      cb.checked = false;
      cb.closest('tr').classList.remove('done');
    });
    updateBadges();
  });

  /* ---------- exercise info rows ---------- */
  function closeInfoRows() {
    document.querySelectorAll('tr.info-row').forEach(function (r) { r.remove(); });
    document.querySelectorAll('button.info-btn').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
  }
  function infoLine(label, text) {
    var p = document.createElement('p');
    var b = document.createElement('b');
    b.textContent = label + ' ';
    p.appendChild(b);
    p.appendChild(document.createTextNode(text));
    return p;
  }
  document.querySelectorAll('button.info-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var tr = btn.closest('tr');
      var next = tr.nextElementSibling;
      if (next && next.classList.contains('info-row')) {
        next.remove();
        btn.setAttribute('aria-expanded', 'false');
        return;
      }
      var d = INFO[btn.dataset.info];
      if (!d) return;
      var row = document.createElement('tr');
      row.className = 'info-row';
      var spacer = document.createElement('td');
      var cell = document.createElement('td');
      cell.colSpan = 3;
      var body = document.createElement('div');
      body.className = 'info-body';
      body.appendChild(infoLine('Works:', d[0]));
      body.appendChild(infoLine('Good for:', d[1]));
      cell.appendChild(body);
      row.appendChild(spacer);
      row.appendChild(cell);
      tr.after(row);
      btn.setAttribute('aria-expanded', 'true');
    });
  });

  /* ---------- warm-up panels ---------- */
  document.querySelectorAll('.pre-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var el = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') === 'true';
      el.hidden = open;
      btn.setAttribute('aria-expanded', String(!open));
    });
  });

  /* ---------- phase toggle ---------- */
  var phaseBtns = document.querySelectorAll('.phase-btn');
  function setPhase(p) {
    p = Number(p) === 2 ? 2 : 1;
    document.body.setAttribute('data-phase', String(p));
    phaseBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(Number(b.dataset.phase) === p)); });
    save(KEYS.phase, p);
    closeInfoRows(); // an open info row could belong to a row that just got hidden
    updateBadges();
  }
  phaseBtns.forEach(function (b) {
    b.addEventListener('click', function () { setPhase(b.dataset.phase); });
  });

  /* ---------- boot ---------- */
  setPhase(load(KEYS.phase, 1));
  var start = location.hash.slice(1);
  if (DAYS.indexOf(start) === -1) start = load(KEYS.day, 'd1');
  showDay(start, { noScroll: true, fromHash: true });

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* offline support is optional */ });
    });
  }
})();
