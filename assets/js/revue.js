/* Revue — améliorations progressives (sommaire, copie du code, thème) */
(function () {
  'use strict';

  var root = document.documentElement;
  var prose = document.querySelector('.prose');
  var abstract = document.querySelector('.abstract');
  var LANG = (root.getAttribute('lang') || 'fr').slice(0, 2) === 'en' ? 'en' : 'fr';
  var T = {
    fr: { copy: 'Copier', copied: 'Copié', copyAria: 'Copier le code', keywords: 'Mots-clés', terminal: 'Terminal', output: 'Sortie' },
    en: { copy: 'Copy', copied: 'Copied', copyAria: 'Copy the code', keywords: 'Keywords', terminal: 'Terminal', output: 'Output' }
  }[LANG];

  /* ---------- Thème clair / sombre ---------- */
  var toggle = document.querySelector('[data-theme-toggle]');
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  function currentTheme() {
    var t = root.getAttribute('data-theme');
    return t ? t : (darkQuery.matches ? 'dark' : 'light');
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('revue-theme', next); } catch (e) { /* stockage indisponible */ }
    });
  }

  /* ---------- Mots-clés en pastilles ---------- */
  if (abstract) {
    Array.prototype.forEach.call(abstract.querySelectorAll('p'), function (p) {
      var label = p.querySelector('strong');
      if (!label || !/^(Mots-cl|Keywords)/i.test(label.textContent)) return;
      var text = p.textContent.replace(label.textContent, '').replace(/^\s*:?\s*/, '');
      var words = text.split(';').map(function (w) { return w.trim().replace(/\.$/, ''); }).filter(Boolean);
      if (!words.length) return;
      var box = document.createElement('div');
      box.className = 'keywords';
      var head = document.createElement('span');
      head.className = 'keywords__label';
      head.textContent = T.keywords;
      box.appendChild(head);
      words.forEach(function (w) {
        var chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = w;
        box.appendChild(chip);
      });
      p.parentNode.replaceChild(box, p);
    });
  }

  if (!prose) return;

  /* ---------- Numérotation des sections ---------- */
  function splitNumber(heading, pattern, cls, pad) {
    var m = heading.textContent.match(pattern);
    if (!m) return null;
    var num = document.createElement('span');
    num.className = cls;
    num.setAttribute('aria-hidden', 'true');
    num.textContent = pad ? ('0' + m[1]).slice(-2) : m[1];
    heading.textContent = '';
    heading.appendChild(num);
    heading.appendChild(document.createTextNode(m[2]));
    heading.setAttribute('aria-label', m[1] + '. ' + m[2]);
    return m;
  }
  var sections = [];
  if (abstract) {
    var abstractTitle = abstract.querySelector('h2[id]');
    if (abstractTitle) sections.push({ el: abstractTitle, num: '', label: abstractTitle.textContent });
  }
  Array.prototype.forEach.call(prose.querySelectorAll('h2'), function (h) {
    var m = splitNumber(h, /^\s*(\d+)\.\s+(.+)$/, 'sec-num', true);
    if (!h.id) return;
    sections.push({ el: h, num: m ? m[1] : '', label: m ? m[2] : h.textContent });
  });
  Array.prototype.forEach.call(prose.querySelectorAll('h3'), function (h) {
    splitNumber(h, /^\s*(\d+\.\d+)\s+(.+)$/, 'sub-num', false);
  });
  var authorTitle = document.querySelector('.author-card h2[id]');
  var authorLabel = document.querySelector('.author-card__eyebrow');
  if (authorTitle) sections.push({ el: authorTitle, num: '', label: authorLabel ? authorLabel.textContent : authorTitle.textContent });

  /* ---------- Sommaire ---------- */
  var tocList = document.getElementById('toc-list');
  var toc = document.querySelector('.toc');
  var links = [];
  if (tocList) {
    sections.forEach(function (s) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + s.el.id;
      var n = document.createElement('span');
      n.className = 'n';
      n.textContent = s.num ? ('0' + s.num).slice(-2) : '—';
      a.appendChild(n);
      a.appendChild(document.createTextNode(s.label));
      li.appendChild(a);
      tocList.appendChild(li);
      links.push(a);
    });
  }
  var wide = window.matchMedia('(min-width: 1100px)');
  function syncToc() { if (toc) toc.open = wide.matches; }
  syncToc();
  if (wide.addEventListener) wide.addEventListener('change', syncToc);
  else if (wide.addListener) wide.addListener(syncToc);
  if (toc) {
    toc.addEventListener('click', function (e) {
      if (e.target.closest('a') && !wide.matches) toc.open = false;
    });
    var summary = toc.querySelector('summary');
    if (summary) summary.addEventListener('click', function (e) { if (wide.matches) e.preventDefault(); });
  }

  /* ---------- Tableaux défilants ---------- */
  Array.prototype.forEach.call(prose.querySelectorAll('table'), function (t) {
    if (t.parentNode.classList.contains('table-wrap')) return;
    var w = document.createElement('div');
    w.className = 'table-wrap';
    t.parentNode.insertBefore(w, t);
    w.appendChild(t);
  });

  /* ---------- Blocs de code : barre + copie ---------- */
  var LABELS = { bash: T.terminal, shell: T.terminal, json: 'JSON', plaintext: T.output, text: T.output, bibtex: 'BibTeX' };
  var ICON_COPY = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
  var ICON_DONE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>';

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  Array.prototype.forEach.call(prose.querySelectorAll('div.highlighter-rouge'), function (block) {
    var code = block.querySelector('pre code') || block.querySelector('pre');
    if (!code) return;
    var m = block.className.match(/language-([\w-]+)/);
    var lang = m ? m[1] : 'code';
    var source = code.textContent.replace(/\n$/, '');
    block.classList.add('code-block', 'code-block--' + lang);

    var bar = document.createElement('div');
    bar.className = 'code-bar';
    var label = document.createElement('span');
    label.className = 'code-lang';
    label.textContent = LABELS[lang] || lang;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.innerHTML = ICON_COPY + '<span>' + T.copy + '</span>';
    btn.setAttribute('aria-label', T.copyAria);
    var timer;
    btn.addEventListener('click', function () {
      copyText(source).then(function () {
        btn.classList.add('is-done');
        btn.innerHTML = ICON_DONE + '<span>' + T.copied + '</span>';
        clearTimeout(timer);
        timer = setTimeout(function () {
          btn.classList.remove('is-done');
          btn.innerHTML = ICON_COPY + '<span>' + T.copy + '</span>';
        }, 1800);
      }, function () { /* copie refusée : on laisse le bouton tel quel */ });
    });
    bar.appendChild(label);
    bar.appendChild(btn);
    block.insertBefore(bar, block.firstChild);

    /* Invite « $ » décorative devant chaque commande shell */
    if (lang === 'bash' || lang === 'shell') {
      var lines = code.innerHTML.replace(/\n$/, '').split('\n');
      var balanced = lines.every(function (l) {
        return (l.match(/<span/g) || []).length === (l.match(/<\/span>/g) || []).length;
      });
      if (balanced) {
        code.innerHTML = lines.map(function (l) {
          return l.trim() ? '<span class="prompt" aria-hidden="true">$</span>' + l : l;
        }).join('\n');
      }
    }
  });

  /* ---------- Liens externes ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.prose a[href^="http"]'), function (a) {
    if (a.hostname && a.hostname !== location.hostname) a.setAttribute('rel', 'noopener');
  });

  /* ---------- Progression de lecture + section active ---------- */
  var bar = document.querySelector('.progress span');
  var ticking = false;
  function update() {
    ticking = false;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (bar) bar.style.transform = 'scaleX(' + ratio + ')';

    if (!links.length) return;
    var active = -1;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].el.getBoundingClientRect().top <= 140) active = i;
      else break;
    }
    if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) active = sections.length - 1;
    links.forEach(function (a, idx) {
      var on = idx === active;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
