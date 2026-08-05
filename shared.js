/* ==========================================================================
    shared.js — Fuente única de verdad para el proyecto "Para Ti"
    Contiene: íconos, rarezas, definición de premios, helpers de contexto,
    la secuencia de apertura de la Mega Caja y los textos de las cartas.
    ========================================================================== */

/* ---------- AUDIO PERSISTENTE ENTRE PÁGINAS ----------
   Cada página crea su propio <audio> local pero restaura la posición y
   el estado desde localStorage. Así la música "continúa" al navegar. */
const AudioBridge = (function () {
    let audio = null;
    let listeners = [];
    let _lastDuration = 0;

    function init() {
        audio = document.querySelector('#main-audio') || document.createElement('audio');
        if (!audio.id) { audio.id = 'main-audio'; audio.preload = 'auto'; document.body.appendChild(audio); }
        audio.addEventListener('timeupdate', function () {
            if (audio.duration) {
                localStorage.setItem('audio_currentTime', audio.currentTime);
                _lastDuration = audio.duration;
            }
            emit({
                type: 'audioState',
                src: audio.src,
                currentTime: audio.currentTime,
                duration: audio.duration || 0,
                paused: audio.paused,
                ended: audio.ended,
                volume: audio.volume
            });
        });
        audio.addEventListener('ended', function () {
            localStorage.removeItem('audio_currentTime');
            emit({ type: 'audioEnded' });
        });
        audio.addEventListener('loadedmetadata', function () {
            _lastDuration = audio.duration || 0;
        });
        audio.volume = parseFloat(localStorage.getItem('audio_volume') || '0.5');
    }

    function emit(state) {
        listeners.forEach(fn => fn(state));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        play: function () { if (audio) audio.play().catch(function () {}); },
        pause: function () { if (audio) audio.pause(); },
        load: function (src, time, autoplay) {
            if (!audio) return;
            if (audio.src !== src) {
                audio.src = src;
                audio.currentTime = 0;
            }
            if (time && time > 0) {
                audio.currentTime = time;
            }
            if (autoplay) audio.play().catch(function () {});
        },
        seek: function (time) { if (audio) audio.currentTime = time; },
        volume: function (v) { if (audio) audio.volume = v; },
        onUpdate: function (fn) { listeners.push(fn); },
        get _lastDuration() { return _lastDuration; }
    };
})();

/* ---------- ÍCONOS SVG ---------- */
const SVGS = {
    heart: '<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.[...]',
    sparkles: '<svg viewBox="0 0 24 24"><path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L[...]',
    film: '<svg viewBox="0 0 24 24"><path d="M18 4v1h-2V4c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v1H6V4c0-.55-.45-1-1-1s-1 .45-1 1v16c0 .55.45 1 1 1s1-.45 1-1v-1h2v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1[...]',
    music: '<svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>',
    headphones: '<svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9v7c0 1.1.9 2 2 2h4v-8H5v-1c0-3.87 3.13-7 7-7s7 3.13 7 7v1h-4v8h4c1.1 0 2-.9 2-2v-7c0-4.97-4.03-9-9-9z"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 2l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>',
    heart2: '<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 [...]',
    smile: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-6c.78 2.34 2.72 4 5 4s[...]',
    volleyball: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-12S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.[...]',
    palette: '<svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>',
    mic: '<svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 13 12 13s-4.52 1.2-5.9[...]',
    check: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
};

/* ---------- METADATA DE RAREZAS ---------- */
const RARITY_META = {
    'epico':              { name: 'Épico',            order: 1 },
    'especial':           { name: 'Especial',         order: 2 },
    'super-raro':         { name: 'Súper Raro',       order: 3 },
    'mitico':             { name: 'Mítico',           order: 4 },
    'legendario':         { name: 'Legendario',       order: 5 },
    'ultralegendario':    { name: 'Ultralegendario',  order: 6 }
};

/* ---------- DEFINICIÓN DE PREMIOS (fuente única de verdad) ----------
   `page` dice a dónde navega cada vale.
   `theme` fuerza el ambiente en immersive.html.
   NOTA: los premios de película apuntan a movienigth1.html (así se llama
   el archivo, con esa errata a propósito). */
const REWARD_DEFINITIONS = [ /* ...unchanged... */ ];

const REWARDS_BY_CODE = {};
REWARD_DEFINITIONS.forEach(r => { REWARDS_BY_CODE[r.code.toUpperCase()] = r; });

/* ---------- TEXTOS DE CARTAS (letter-epic.html) ---------- */
const LETTERS_BY_CODE = { /* ...unchanged... */ };

/* ---------- HELPERS DE CONTEXTO ---------- */
function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function getRewardFromContext() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
        const r = REWARDS_BY_CODE[code.trim().toUpperCase()];
        return r || null;
    }
    return null;
}

function goBackToChest() {
    window.location.href = './index.html#brawl';
}

function showToast(message) {
    const t = document.createElement('div');
    t.className = 'toast-notification';
    t.textContent = message;
    document.body.appendChild(t);
    if (window.anime) {
        anime({ targets: t, opacity: [0, 1], translateY: [20, 0], duration: 250, easing: 'easeOutQuad' });
        setTimeout(() => {
            anime({ targets: t, opacity: [1, 0], translateY: [0, 20], duration: 250, easing: 'easeInQuad', complete: () => t.remove() });
        }, 2200);
    } else {
        setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 350); }, 2200);
    }
}

/* ---------- SECUENCIA DE APERTURA DE LA MEGA CAJA ---------- */
let brawlBoxRunning = false;
let pendingReward = null;

function playBrawlBoxSequence(reward) { /* ...unchanged... */ }
function closeBrawlBox() { /* ...unchanged... */ }
function skipBrawlBox() { /* ...unchanged... */ }

(function bindBrawlBoxSkip() {
    function bind() {
        const btn = document.getElementById('brawlboxSkip');
        if (btn) btn.addEventListener('click', skipBrawlBox);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
    else bind();
})();

/* ==================================================================
   Fix para branch "content": bind intro button para que "¿ESTÁS LISTA, ANA?"
   realmente haga algo cuando se cliquee.
   - Añadimos listener click y keydown (Enter/Space) para accesibilidad.
   - Reproducimos animación breve (si anime.js está presente) y confetti.
   - Ocultamos #intro-screen con fade y llevamos el foco al contenido.
   ================================================================== */
(function bindIntroButtonForContentBranch() {
    function enterSite() {
        const intro = document.getElementById('intro-screen');
        if (!intro) return;

        const btn = document.getElementById('intro-btn');
        if (btn && window.anime) {
            anime.remove(btn);
            anime({ targets: btn, scale: [1, 0.96, 1], duration: 300, easing: 'easeOutQuad' });
        }

        try { if (typeof confetti === 'function') confetti({ particleCount: 100, spread: 80, origin: { y: 0.35 } }); } catch (e) { /* no crash */ }

        intro.style.transition = 'opacity 420ms ease';
        intro.style.opacity = '0';
        document.body.style.overflow = '';
        setTimeout(() => {
            try { intro.style.display = 'none'; } catch (e) { /* ignore */ }
            const main = document.querySelector('.container, nav, main, #bgLayer');
            if (main && typeof main.focus === 'function') {
                try { main.focus({ preventScroll: true }); } catch (e) { /* some browsers may not support options */ main.focus(); }
            } else if (main) {
                main.scrollIntoView({ behavior: 'smooth' });
            }
        }, 440);
    }

    function onKey(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); enterSite();
        }
    }

    function bind() {
        const btn = document.getElementById('intro-btn');
        if (!btn) return;
        btn.addEventListener('click', enterSite);
        btn.addEventListener('keydown', onKey);
        btn.setAttribute('tabindex', '0');
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
    else bind();
})();
