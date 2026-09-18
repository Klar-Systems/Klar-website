/* Shared offer modal. Injected on every page so one copy stays in sync. */
(function () {
  var HTML =
    '<div class="modal" id="offer" role="dialog" aria-modal="true" aria-labelledby="offer-title">' +
      '<div class="veil" data-close></div>' +
      '<div class="box">' +
        '<button class="x" type="button" data-close aria-label="Sulje">&times;</button>' +
        '<span class="tag">Veloitukseton käynti</span>' +
        '<h3 id="offer-title">Tulemme ravintolaasi. Ilmaiseksi.</h3>' +
        '<ul>' +
          '<li>Tuomme Google-arvostelukortit pöytiisi — ilmaiseksi, jos haluat ne.</li>' +
          '<li>Käymme läpi mitä ravintolasi tarvitsee: näkyvyys, varaukset, tilaukset, sivut.</li>' +
          '<li>Katsotaan yhdessä mikä sopii juuri sinulle — ei valmista pakettia.</li>' +
          '<li>Ei myyntipuhetta, ei sitoumusta.</li>' +
        '</ul>' +
        '<form onsubmit="return false">' +
          '<input type="text" placeholder="Ravintolan nimi" aria-label="Ravintolan nimi">' +
          '<input type="email" placeholder="sinun@ravintolasi.fi" aria-label="Sähköposti">' +
          '<button class="btn btn-ink" type="submit" style="flex:1 1 100%;justify-content:center">Varaa käynti</button>' +
        '</form>' +
        '<p class="fine">Vastaamme henkilökohtaisesti 24 tunnin sisällä.</p>' +
      '</div>' +
    '</div>';

  function init() {
    var host = document.createElement('div');
    host.innerHTML = HTML;
    var modal = host.firstChild;
    document.body.appendChild(modal);

    function open(e) {
      if (e) { e.preventDefault(); }
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      var first = modal.querySelector('input');
      if (first) { setTimeout(function () { first.focus(); }, 40); }
    }
    function close() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    var triggers = document.querySelectorAll('[data-modal]');
    for (var i = 0; i < triggers.length; i++) { triggers[i].addEventListener('click', open); }
    var closers = modal.querySelectorAll('[data-close]');
    for (var j = 0; j < closers.length; j++) { closers[j].addEventListener('click', close); }
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(); } });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* Reveal blocks as they enter the viewport. Never hides content when
   IntersectionObserver is missing or motion is reduced. */
(function () {
  function start() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) { return; }
    var sel = 'section > .wrap, .rowgrid .cell, .oc, .svclist .li, .svc, .foot-top, .qa, .price .big, .member, .mission p, .two > div';
    var nodes = document.querySelectorAll(sel);
    if (!nodes.length) { return; }
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].classList.add('reveal');
      if (i % 3 === 1) { nodes[i].classList.add('d1'); }
      if (i % 3 === 2) { nodes[i].classList.add('d2'); }
    }
    var io = new IntersectionObserver(function (entries) {
      for (var k = 0; k < entries.length; k++) {
        if (entries[k].isIntersecting) {
          entries[k].target.classList.add('in');
          io.unobserve(entries[k].target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    for (var j = 0; j < nodes.length; j++) { io.observe(nodes[j]); }
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', start); }
  else { start(); }
})();

/* Mobile menu. The button is injected so all pages share one implementation. */
(function () {
  function init() {
    var nav = document.querySelector('nav .wrap');
    if (!nav) { return; }
    var links = nav.querySelector('.navlinks');
    if (!links) { return; }
    var btn = document.createElement('button');
    btn.className = 'nav-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Valikko');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span></span>';
    btn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.appendChild(btn);
    // a tap on any link closes the sheet
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
  else { init(); }
})();
