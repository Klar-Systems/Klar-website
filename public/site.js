// ── HERO FOOD MOTES ──
// A little life in the hero. Move the mouse and the kitchen drifts past.
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const mm = window.matchMedia;
  if (mm && mm('(prefers-reduced-motion: reduce)').matches) return;
  if (mm && mm('(hover: none)').matches) return;

  const FOOD = ['\u{1F355}', '\u{1F35C}', '\u{1F363}', '\u{1F354}', '\u{1F950}', '\u{1F373}',
                '\u{1F957}', '\u{1F35D}', '\u{1F368}', '\u{1F376}', '☕', '\u{1F958}'];
  const MAX = 14;
  let alive = 0, lastAt = 0, lastX = 0, lastY = 0;

  function spawn(x, y) {
    if (alive >= MAX) return;
    alive++;
    const el = document.createElement('span');
    el.className = 'hero-mote';
    el.textContent = FOOD[(Math.random() * FOOD.length) | 0];
    el.style.fontSize = (16 + Math.random() * 20) + 'px';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.opacity = '0';
    hero.appendChild(el);

    const driftX = (Math.random() - 0.5) * 150;
    const driftY = -70 - Math.random() * 130;
    const spin = (Math.random() - 0.5) * 220;
    const life = 2200 + Math.random() * 1400;
    const peak = 0.5 + Math.random() * 0.3;

    const anim = el.animate([
      { transform: 'translate(-50%, -50%) translate(0,0) rotate(0deg) scale(0.5)', opacity: 0 },
      { transform: 'translate(-50%, -50%) translate(' + driftX * 0.35 + 'px,' + driftY * 0.3 + 'px) rotate(' + spin * 0.3 + 'deg) scale(1)', opacity: peak, offset: 0.25 },
      { transform: 'translate(-50%, -50%) translate(' + driftX + 'px,' + driftY + 'px) rotate(' + spin + 'deg) scale(0.85)', opacity: 0 }
    ], { duration: life, easing: 'cubic-bezier(0.25,0.6,0.3,1)' });

    anim.onfinish = () => { el.remove(); alive--; };
  }

  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    const now = e.timeStamp;
    if (now - lastAt < 110) return;
    if (Math.hypot(e.clientX - lastX, e.clientY - lastY) < 26) return;
    lastAt = now; lastX = e.clientX; lastY = e.clientY;
    const r = hero.getBoundingClientRect();
    spawn(e.clientX - r.left, e.clientY - r.top);
  });
})();

// ── MOBILE NAV ──
(function () {
  const btn = document.getElementById('navToggle');
  const menu = document.getElementById('navRight');
  if (!btn || !menu) return;
  const close = () => { menu.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); };
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  menu.addEventListener('click', e => { if (e.target.tagName === 'A') close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

// ── HERO VIDEO ──
// The gradient behind is the default. If a hero video is actually present and
// can play, fade it in over the top; otherwise nothing changes and nobody
// sees a broken box.
(function () {
  const v = document.getElementById('heroVideo');
  if (!v) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce && reduce.matches) { v.remove(); return; }
  v.addEventListener('canplay', () => v.classList.add('is-ready'), { once: true });
  v.addEventListener('error', () => v.remove());
  // No source resolved at all (files not uploaded yet) leaves networkState NO_SOURCE
  setTimeout(() => {
    if (v.networkState === 3 || v.readyState === 0) v.remove();
  }, 2500);
})();

// ── COMMISSION CALCULATOR ──
(function () {
  // Klar plans are priced on monthly activity: completed direct orders plus
  // guests who arrived on a Klar booking. Quoting the €249 floor at every
  // volume would promise a price we would not actually invoice.
  const TIERS = [
    { upTo: 300,  price: 249, name: 'Klar 300' },
    { upTo: 750,  price: 399, name: 'Klar 750' },
    { upTo: 1500, price: 599, name: 'Klar 1500' }
  ];
  const tierFor = units => TIERS.find(t => units <= t.upTo) ||
    { upTo: Infinity, price: null, name: 'Klar Custom' };

  const SETUP_MID = 2250;
  const verdictSub = tier => 'Website, online ordering, booking system, guest CRM, Google setup and the ongoing work, all inside one setup fee of €1,900–€2,600. Then €' +
    tier.price + ' a month on ' + tier.name + ' plus VAT, and 0% of your sales for as long as you\'re with us.';

  // Not every page carries the calculator. Without its root section there is
  // nothing to wire up, so leave quietly instead of throwing.
  if (!document.getElementById('calculator')) return;

  const ids = ['cOrders', 'cCovers', 'cShare', 'cAov', 'cComm', 'cPerCover'];
  const el = {};
  ids.forEach(id => { el[id] = document.getElementById(id); });
  if (ids.some(id => !el[id])) return;

  // A missing output node must not take the whole calculator down with it
  const sink = {};
  const out = id => document.getElementById(id) || sink;

  function eur(n) {
    return '€' + Math.round(n).toLocaleString('en-US');
  }
  // Keep the typed-in boxes inside sane bounds without fighting the user mid-type
  function bounded(input, fallback) {
    const v = parseFloat(input.value);
    if (isNaN(v)) return fallback;
    return Math.min(Math.max(v, +input.min), +input.max);
  }

  function recalc() {
    const orders   = +el.cOrders.value;
    const covers   = +el.cCovers.value;
    const outOf10  = +el.cShare.value;
    const aov      = bounded(el.cAov, 30);
    const comm     = bounded(el.cComm, 30) / 100;
    const perCover = bounded(el.cPerCover, 3);
    const share    = outOf10 / 10;

    // Echo the two big questions back in plain words
    out('cOrdersVal').textContent = orders + (orders === 1 ? ' order' : ' orders');
    out('cCoversVal').textContent = covers + (covers === 1 ? ' guest' : ' guests');
    out('cShareVal').textContent  = outOf10 + ' out of 10';

    // What you pay the platforms now
    const commissionCost = orders * aov * comm;
    const coverCost      = covers * perCover;
    const bleed          = commissionCost + coverCost;

    out('oCommLabel').textContent  = 'Wolt / Foodora commission, ' + Math.round(comm * 100) + '% of ' + orders + ' orders';
    out('oComm').textContent       = eur(commissionCost);
    out('oCoverLabel').textContent = 'Booking service fees, ' + covers + ' guests';
    out('oCover').textContent      = eur(coverCost);
    out('oTotal').textContent      = eur(bleed);
    out('oYear').textContent       = eur(bleed * 12) + ' a year';

    // What changes with Klar
    const ordersMoved     = Math.round(orders * share);
    const commissionSaved = ordersMoved * aov * comm;
    const bookingSaved    = coverCost;
    const recovered       = commissionSaved + bookingSaved;

    // Your plan follows how much you actually use it
    const units = ordersMoved + covers;
    const tier  = tierFor(units);
    const KLAR_MONTHLY = tier.price;
    const isCustom = KLAR_MONTHLY === null;
    const net = isCustom ? 0 : recovered - KLAR_MONTHLY;

    out('oRecovLabel').textContent = 'Commission on the ' + ordersMoved + ' orders that now come to you direct';
    out('oRecov').textContent      = '+ ' + eur(commissionSaved);
    out('oBookRecov').textContent  = '+ ' + eur(bookingSaved);
    out('oKlarLabel').textContent  = 'What Klar costs you, ' + tier.name;
    out('oTierNote').textContent   = isCustom
      ? 'Over 1,500 orders and guests a month, so we would quote you properly rather than guess.'
      : ordersMoved + ' direct orders + ' + covers + ' booked guests = ' + units +
        ' a month, which is the ' + tier.name + ' plan.';
    out('oKlar').textContent       = isCustom ? 'Quoted' : '− ' + eur(KLAR_MONTHLY);
    out('planName').textContent    = tier.name;
    out('planPrice').textContent   = isCustom ? 'Quoted for you' : eur(KLAR_MONTHLY) + ' a month + VAT';
    out('planWhy').textContent     = units + ' orders and booked guests a month';
    out('oNet').textContent        = isCustom ? ',' : (net < 0 ? '− ' : '') + eur(Math.abs(net));
    out('oNetYear').textContent    = isCustom
      ? 'Book a call and we will do this with you'
      : (net < 0 ? '− ' : '') + eur(Math.abs(net * 12)) + ' a year';

    // The verdict
    const daysOfBleed  = bleed > 0 ? SETUP_MID / bleed * 30 : 0;
    const payback      = net > 0 ? SETUP_MID / net : 0;
    const perOrder     = aov * comm;
    const ordersToPlan = perOrder > 0 ? Math.ceil(KLAR_MONTHLY / perOrder) : 0;
    const multiple     = recovered / KLAR_MONTHLY;

    // Only claim a win when the setup fee actually pays for itself inside the
    // first year and a half. Below that, say so plainly instead of printing an
    // absurd number like "750 months" and hoping nobody reads it.
    const worthIt = !isCustom && net > 0 && payback > 0 && payback <= 18;

    if (isCustom) {
      out('vBig').textContent = 'You are bigger than our standard plans. Let us price this properly.';
      out('vSub').textContent = 'Above 1,500 orders and booked guests a month we quote individually instead of pushing you into a band that does not fit. Everything else on this page still holds: no commission, no fee per order, no fee per cover.';
    } else if (worthIt && daysOfBleed < 60) {
      out('vBig').textContent = 'Your whole setup costs less than ' +
        Math.ceil(daysOfBleed) + ' days of what the platforms take from you.';
      out('vSub').textContent = verdictSub(tier);
    } else if (worthIt) {
      out('vBig').textContent = 'Your whole setup costs about ' +
        (daysOfBleed / 30).toFixed(1) + ' months of what the platforms take from you.';
      out('vSub').textContent = verdictSub(tier);
    } else {
      out('vBig').textContent = 'At these numbers, the platforms are not what is holding you back.';
      out('vSub').textContent = 'We would rather say that than dress up a calculator result. On these figures Klar would not pay for itself quickly, and we are not going to pretend otherwise. What you most likely need first is a proper website and to be found, so let us talk about that instead.';
    }

    out('vPayback').textContent = worthIt
      ? (payback < 1 ? 'Under a month' : payback.toFixed(1) + ' months')
      : ',';
    out('vOrders').textContent  = ordersToPlan > 0 ? ordersToPlan + ' orders' : ',';
    out('vMultiple').textContent = worthIt ? '€' + multiple.toFixed(2) : ',';
  }

  ids.forEach(id => {
    el[id].addEventListener('input', recalc);
  });
  recalc();
})();

// ── NAV SCROLL ──
(function () {
  const nav = document.querySelector('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
})();

// ── EMAIL CAPTURE ──
(function () {
  const form = document.getElementById('captureForm');
  const input = document.getElementById('captureEmail');
  const button = document.getElementById('captureSubmit');
  const message = document.getElementById('captureMessage');
  if (!form || !input || !button || !message) return;

  function showMessage(text, kind) {
    message.textContent = text;
    message.classList.remove('success', 'error');
    if (kind) message.classList.add(kind);
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!isValidEmail(email)) {
      showMessage('Please enter a valid email address.', 'error');
      input.focus();
      return;
    }
    button.disabled = true;
    const originalLabel = button.textContent;
    button.textContent = 'Sending…';
    showMessage('', null);

    try {
      const res = await fetch('https://n8n.klarsystems.com/webhook/Nott-ready-tocall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Request failed');
      form.reset();
      showMessage("Thanks! We'll be in touch within 24 hours.", 'success');
    } catch (err) {
      showMessage('Something went wrong. Email us at guidance@klarsystems.com instead.', 'error');
    } finally {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  });
})();

// ── FOUNDING POPUP ──
// Opens once per browser session, after 15 seconds or once a third of the page
// has been read, whichever comes first. Closing it does not throw the offer
// away: it shrinks to a tab in the corner that reopens the same card. Focus is
// moved with preventScroll, otherwise closing it yanks the page down to wherever
// this markup happens to sit.
(function () {
  const pop   = document.getElementById('fpop');
  const close = document.getElementById('fpopClose');
  const more  = document.getElementById('fpopMore');
  const tab   = document.getElementById('fpopTab');
  if (!pop || !close || !tab) return;

  const SEEN = 'klar-founding-popup';
  let seen = false;
  try { seen = !!sessionStorage.getItem(SEEN); } catch (e) { /* private mode */ }

  let lastFocus = null;

  function focusSafely(node) {
    if (node && node.focus) { try { node.focus({ preventScroll: true }); } catch (e) { node.focus(); } }
  }

  function open() {
    cleanup();
    try { sessionStorage.setItem(SEEN, '1'); } catch (e) {}
    lastFocus = document.activeElement;
    tab.hidden = true;
    pop.hidden = false;
    // let the browser paint the hidden state first, so the fade actually runs
    requestAnimationFrame(() => pop.classList.add('is-open'));
    focusSafely(close);
    document.addEventListener('keydown', onKey);
  }

  function shrink() {
    pop.classList.remove('is-open');
    document.removeEventListener('keydown', onKey);
    setTimeout(() => { pop.hidden = true; }, 250);
    tab.hidden = false;
    focusSafely(lastFocus === close ? tab : lastFocus);
  }

  function onKey(e) {
    if (e.key === 'Escape') shrink();
    if (e.key !== 'Tab') return;
    // keep tabbing inside the dialog while it is open
    const items = pop.querySelectorAll('button, a[href]');
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); focusSafely(last); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); focusSafely(first); }
  }

  function onScroll() {
    if (window.scrollY + window.innerHeight > document.body.scrollHeight / 3) open();
  }
  function cleanup() {
    clearTimeout(timer);
    window.removeEventListener('scroll', onScroll);
  }

  close.addEventListener('click', shrink);
  pop.addEventListener('click', e => { if (e.target === pop) shrink(); });
  if (more) more.addEventListener('click', shrink);
  tab.addEventListener('click', open);

  let timer = null;
  if (seen) {
    // already had the card this session, so go straight to the corner
    tab.hidden = false;
  } else {
    timer = setTimeout(open, 15000);
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();