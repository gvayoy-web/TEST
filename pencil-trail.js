/* Trazo multicolor tipo lápiz al deslizar/scrollear en móvil.
   Cada movimiento del dedo deja un trazo de colores que se desvanece en ~1s. */
(function () {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var isTouch = ('ontouchstart' in window) ||
                  (navigator.maxTouchPoints > 0) ||
                  (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    if (!isTouch) return;

    var style = document.createElement('style');
    style.textContent =
        '.pencil-trail{position:fixed;pointer-events:none;z-index:9998;border-radius:999px;' +
        'transform-origin:left center;will-change:transform,opacity;' +
        'animation:pencilTrailFade 1s ease-out forwards;}' +
        '@keyframes pencilTrailFade{' +
        '0%{opacity:0.95;transform:rotate(var(--pr)) scaleX(1);}' +
        '100%{opacity:0;transform:rotate(var(--pr)) scaleX(0.15);}' +
        '}';
    (document.head || document.documentElement).appendChild(style);

    var COLORS = ['#ff2f6e', '#ff8c00', '#ffd23f', '#2dd4ff', '#7c3aed', '#ff59e0', '#22c55e', '#f43f5e'];
    var ci = 0;
    var active = 0;
    var lastSpawn = 0;
    var touchState = null;
    var MAX_DOTS = 40;

    var dots = [];

    function spawn(x, y, nx, ny, speed) {
        var dx = nx - x, dy = ny - y;
        var len = Math.sqrt(dx * dx + dy * dy);
        if (len < 5) return;
        if (dots.length >= MAX_DOTS) {
            var oldest = dots.shift();
            if (oldest && oldest.parentNode) oldest.remove();
        }
        var ang = Math.atan2(dy, dx) * 180 / Math.PI;
        var p = document.createElement('div');
        p.className = 'pencil-trail';
        var w = Math.min(len * 1.15, 90);
        var h = 2.5 + Math.min(speed * 0.06, 2.5);
        var color = COLORS[ci % COLORS.length];
        ci++;
        p.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;' +
            'background:' + color + ';box-shadow:0 0 6px ' + color + ';--pr:' + ang + 'deg;';
        (document.body || document.documentElement).appendChild(p);
        dots.push(p);
        p.addEventListener('animationend', function () {
            var idx = dots.indexOf(p);
            if (idx !== -1) dots.splice(idx, 1);
            p.remove();
        }, { once: true });
        setTimeout(function () {
            if (p.parentNode) {
                var idx = dots.indexOf(p);
                if (idx !== -1) dots.splice(idx, 1);
                p.remove();
            }
        }, 1100);
    }

    window.addEventListener('touchstart', function (e) {
        var t = e.touches && e.touches[0];
        if (!t) return;
        touchState = { x: t.clientX, y: t.clientY, t: Date.now() };
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
        if (!touchState) return;
        var t = e.touches && e.touches[0];
        if (!t) return;
        var now = Date.now();
        if (now - lastSpawn < 18) return;
        var dx = t.clientX - touchState.x;
        var dy = t.clientY - touchState.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 4) return;
        var speed = dist / Math.max(now - touchState.t, 1);
        spawn(touchState.x, touchState.y, t.clientX, t.clientY, speed);
        touchState = { x: t.clientX, y: t.clientY, t: now };
        lastSpawn = now;
    }, { passive: true });

    window.addEventListener('touchend', function () { touchState = null; }, { passive: true });
})();
