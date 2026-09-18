/* Soft elliptical glow behind a section.
   Lime and black, heavily translucent, never covering the whole surface.
   [data-mesh="live"] eases toward the pointer; [data-mesh="still"] sits centred. */
(function () {
  var LIME = '200,255,0';
  var INK = '26,26,26';

  function build(host) {
    var live = host.getAttribute('data-mesh') === 'live';
    var canvas = document.createElement('canvas');
    canvas.className = 'mesh-canvas';
    host.insertBefore(canvas, host.firstChild);
    if (getComputedStyle(host).position === 'static') { host.style.position = 'relative'; }

    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, dpr = 1;
    var target = { x: 0.5, y: 0.5 };
    var at = { x: 0.5, y: 0.5 };
    var raf = null;

    function layout() {
      var r = host.getBoundingClientRect();
      var nw = Math.max(1, Math.round(r.width));
      var nh = Math.max(1, Math.round(r.height));
      if (nw === w && nh === h) { return; }
      w = nw; h = nh;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    /* one soft ellipse, drawn as a scaled radial gradient */
    function blob(cx, cy, rx, ry, rgb, alpha) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, ry / rx);
      var g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(0, 'rgba(' + rgb + ',' + alpha + ')');
      g.addColorStop(0.45, 'rgba(' + rgb + ',' + (alpha * 0.55).toFixed(4) + ')');
      g.addColorStop(1, 'rgba(' + rgb + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      var cx = at.x * w, cy = at.y * h;
      var rx = Math.min(w * 0.42, 620);
      var ry = Math.min(h * 0.62, 400);

      blob(cx + rx * 0.16, cy + ry * 0.20, rx * 1.05, ry * 0.95, INK, 0.07);
      blob(cx, cy, rx, ry, LIME, 0.22);
      blob(cx - rx * 0.10, cy - ry * 0.12, rx * 0.52, ry * 0.5, LIME, 0.16);
    }

    function tick() {
      raf = null;
      at.x += (target.x - at.x) * 0.16;
      at.y += (target.y - at.y) * 0.16;
      draw();
      if (Math.abs(target.x - at.x) > 0.001 || Math.abs(target.y - at.y) > 0.001) { schedule(); }
    }
    function schedule() { if (raf === null) { raf = window.requestAnimationFrame(tick); } }

    if (live) {
      host.addEventListener('pointermove', function (e) {
        var r = host.getBoundingClientRect();
        target.x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        target.y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
        schedule();
      });
      host.addEventListener('pointerleave', function () {
        target.x = 0.5; target.y = 0.5;
        schedule();
      });
    }

    layout();
    var ro = window.ResizeObserver ? new ResizeObserver(layout) : null;
    if (ro) { ro.observe(host); } else { window.addEventListener('resize', layout); }
  }

  function init() {
    var hosts = document.querySelectorAll('[data-mesh]');
    for (var i = 0; i < hosts.length; i++) { build(hosts[i]); }
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
  else { init(); }
})();
