/* ==========================================================================
    shared.js — Fuente única de verdad para el proyecto "Para Ti"
    Contiene: íconos, rarezas, definición de premios, helpers de contexto,
    la secuencia de apertura de la Mega Caja y los textos de las cartas.
    ========================================================================== */

/* ---------- SERVICE WORKER ---------- */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
}

/* ---------- AUDIO PERSISTENTE ENTRE PÁGINAS ----------
   Cada página crea su propio <audio> local pero restaura la posición y
   el estado desde localStorage. Así la música "continúa" al navegar. */
const AudioBridge = (function () {
    let audio = null;
    let listeners = [];
    let _lastDuration = 0;
    let _currentSrc = '';

    function basename(url) {
        if (!url) return '';
        try { return decodeURIComponent(new URL(url, location.href).pathname.split('/').pop() || ''); }
        catch(e) { return url.split('/').pop() || ''; }
    }

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
                src: _currentSrc || audio.src,
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
            if (basename(audio.src) !== basename(src)) {
                _currentSrc = src;
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
    heart: '<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
    sparkles: '<svg viewBox="0 0 24 24"><path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z"/></svg>',
    film: '<svg viewBox="0 0 24 24"><path d="M18 4v1h-2V4c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v1H6V4c0-.55-.45-1-1-1s-1 .45-1 1v16c0 .55.45 1 1 1s1-.45 1-1v-1h2v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1h2v1c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1s-1 .45-1 1zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/></svg>',
    music: '<svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>',
    headphones: '<svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9v7c0 1.1.9 2 2 2h4v-8H5v-1c0-3.87 3.13-7 7-7s7 3.13 7 7v1h-4v8h4c1.1 0 2-.9 2-2v-7c0-4.97-4.03-9-9-9z"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 2l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>',
    heart2: '<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
    smile: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-6c.78 2.34 2.72 4 5 4s4.22-1.66 5-4H7zm8-4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-4 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/></svg>',
    volleyball: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-12S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
    palette: '<svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>',
    mic: '<svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 13 12 13s-4.52 1.2-5.93 2.85c-.08.49-.49.85-.98.85-.55 0-1-.45-1-1s.45-1 1-1c.22 0 .42-.08.58-.2.17-.13.36-.21.58-.21.22 0 .42.08.58.21.16.12.36.2.58.2.55 0 1 .45 1 1s-.45 1-1 1z"/></svg>',
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
const REWARD_DEFINITIONS = [
    { code: 'BESO', icon: SVGS.heart, label: 'vale especial', title: 'Beso', desc: 'Canjéalo para darte un gran beso, válido para siempre.', rarity: 'epico' },
    { code: 'CITA', icon: SVGS.sparkles, label: 'vale especial', title: 'Cita sorpresa', desc: 'Cita especial organizada 100% por mí.', rarity: 'epico' },
    { code: 'ABRAZO', icon: SVGS.heart2, label: 'vale emocional', title: 'Abrazo', desc: 'Un abrazo cálido y sincero que te calienta el alma. Válido por tiempo infinito.', rarity: 'epico' },
    { code: 'CARTA', icon: SVGS.film, label: 'vale narrativo', title: 'Carta Secreta', desc: 'Carta secreta escondida, ¡clickea para ver!', rarity: 'epico', page: 'letter-epic.html' },
    { code: 'PELICULA', icon: SVGS.film, label: 'vale especial', title: 'Noche de película', desc: 'Noche de películas donde quieras, ¡cuando quieras!', rarity: 'especial', page: 'movienigth1.html' },
    { code: 'JOJI', icon: SVGS.music, label: 'vale musical', title: 'Lo-Fi Nights', desc: 'Cupón para escuchar juntos una playlist de Joji.', rarity: 'especial', page: 'immersive.html', theme: 'joji' },
    { code: 'VOLEIBOL', icon: SVGS.volleyball, label: 'vale deportivo', title: 'Día de Voleibol', desc: 'Un día entero jugando voleibol juntos. Sin excusas.', rarity: 'especial' },
    { code: 'PINTURA', icon: SVGS.palette, label: 'vale creativo', title: 'Sesión de Pintura', desc: 'Pintamos algo juntos. Tú eliges los colores, como soy péssimo pintando, doy apoyo emocional.', rarity: 'especial', page: 'immersive.html', theme: 'cooky' },
    { code: 'BTS', icon: SVGS.music, label: 'vale kpop', title: 'BTS Marathon', desc: 'Cupón válido para una noche de música y conciertos de BTS juntos.', rarity: 'super-raro', page: 'immersive.html', theme: 'cooky' },
    { code: 'FNAF', icon: SVGS.check, label: 'vale de horror', title: 'Night Fright', desc: 'Noche de jugar o ver videos de FNAF, hacemos locuras y nos divertimos juntos.', rarity: 'super-raro', page: 'immersive.html', theme: 'brawl' },
    { code: 'ANIME', icon: SVGS.smile, label: 'vale otaku', title: 'Anime Marathon', desc: 'Cupón válido para un día completo de ver anime juntos.', rarity: 'super-raro', page: 'immersive.html', theme: 'cooky' },
    { code: 'AMO', icon: SVGS.heart, label: 'vale infinito', title: 'Amo', desc: 'Te amo. Con todas las letras, con toda mi alma.', rarity: 'legendario' },
    { code: '08/01/2026', icon: SVGS.calendar, label: 'fecha grabada', title: '08 / 01 / 2026', desc: 'El día que me diste una oportunidad y prometí hacerte la mujer más feliz del mundo.', rarity: 'legendario' },
    { code: 'CUMPLEANOS', icon: SVGS.smile, label: 'vale de celebración', title: 'Cumpleaños', desc: '¡FELIZ CUMPLEAÑOS MI NIÑA, TE AMO!', rarity: 'legendario' },
    { code: 'SPOTIFY', icon: SVGS.headphones, label: 'canción para ti', title: 'Tu playlist', desc: 'Una playlist hecha por mí, con canciones que me recuerdan a ti.', rarity: 'legendario', special: 'spotify', link: 'https://open.spotify.com/playlist/1j6uTj3NeZlCSxofMol0Ky?si=2c2dab7a59d941a3' },
    { code: 'BRAWLSTARS', icon: SVGS.star, label: 'el vale más valioso', title: 'Mega Caja', desc: 'Canjéalo para pasar conmigo todos los días de mi vida.', rarity: 'ultralegendario', page: 'mega-box.html' },
    { code: 'VIDEOJUEGO', icon: SVGS.star, label: 'vale legendario', title: 'Mini-Game Arcade', desc: 'Un videojuego hecho por mí con lo que te encanta.', rarity: 'legendario', page: 'gungeon_v3.html' },
    { code: 'FELICES16', icon: SVGS.star, label: 'celebración épica', title: 'Felices 16', desc: 'Una celebración épica para tus 16 años.', rarity: 'ultralegendario', page: 'immersive.html' },
    { code: 'SIEMPRE', icon: SVGS.smile, label: 'vale infinito', title: 'Siempre', desc: 'Siempre estaré ahí, sin condiciones.', rarity: 'ultralegendario', page: 'letter-epic.html' }
];

/* ---------- NORMALIZACIÓN DE CÓDIGOS ---------- */
function normalizeCode(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

const REWARDS_BY_CODE = {};
REWARD_DEFINITIONS.forEach(r => { REWARDS_BY_CODE[normalizeCode(r.code)] = r; });

/* ---------- TEXTOS DE CARTAS (letter-epic.html) ----------
   Solo legendarios, ultralegendarios y CARTA tienen carta completa.
   */
const LETTERS_BY_CODE = {
    CARTA: {
        chapters: [
            { label: 'capítulo uno', text: 'Hay cosas que se dicen mejor escritas. Esta carta es un pequeño pedazo de todo lo que a veces no digo en voz alta.\n\nAunque a veces no sea el novio perfecto, gracias a tu increíble forma de ser intento serlo. Eres todo lo que soñé y todo lo que quiero.' },
            { label: 'capítulo dos', text: 'Gracias por tu energía, por tu risa, por tu manera de ser y tu hermosa cara de felicidad al verme.' },
            { label: 'capítulo tres', text: 'Si algún día dudas de cuánto significas para mí, vuelve a esta página. Aquí quedó escrito, sin borrar.' }
        ],
        final: 'Todo lo que he escrito aquí y en otras partes es la manera en la que me haces sentir: seguro y feliz.'
    },
    SIEMPRE: {
        chapters: [
            { label: 'capítulo uno', text: 'Siempre estaré ahí para ti, no importa que tan mal estés. Siempre quiero estar a tu lado apoyando tus ideas. Eres especial para mí, nunca quiero perderte.' },
            { label: 'capítulo dos', text: 'Aunque cometo mil errores, sé que quiero pasar toda mi vida junto a ti, que tú seas la madre de mis hijos y tener un lindo hogar donde tú y yo, hasta ancianos, sigamos coqueteándonos. Porque siempre estaré ahí, sin condiciones.' }
        ],
        final: 'siempre, sin condiciones'
    }
};

/* ---------- HELPERS DE CONTEXTO ---------- */
function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function getRewardFromContext() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
        const r = REWARDS_BY_CODE[normalizeCode(code.trim())];
        return r || null;
    }
    return null;
}

function goBackToChest() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.close();
        setTimeout(function() {
            if (!window.closed) window.location.href = './index.html#brawl';
        }, 100);
    }
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

/* ---------- SECUENCIA DE APERTURA DE LA MEGA CAJA ----------
   Requiere en la página los elementos:
   #brawlboxOverlay, #brawlboxBox, #brawlboxGlow, #brawlboxText,
   #brawlboxSkip y .brawlbox-star (#star1..#star4). */
let brawlBoxRunning = false;
let pendingReward = null;

function playBrawlBoxSequence(reward) {
    if (brawlBoxRunning) return;
    brawlBoxRunning = true;
    pendingReward = reward;

    const overlay = document.getElementById('brawlboxOverlay');
    const box = document.getElementById('brawlboxBox');
    const glow = document.getElementById('brawlboxGlow');
    const text = document.getElementById('brawlboxText');
    if (!overlay || !box) { brawlBoxRunning = false; return; }
    const stars = ['#star1', '#star2', '#star3', '#star4'];

    const leftover = overlay.querySelector('p + p');
    if (leftover) leftover.remove();

    overlay.classList.add('visible');
    text.textContent = 'abriendo mega caja...';
    box.style.transform = 'scale(1) rotate(0deg)';
    box.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="120" height="120"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 15H4V8h16v11z"/><circle cx="12" cy="13" r="2" fill="#10021f"/></svg>';
    glow.style.opacity = 0;
    stars.forEach(s => { const el = document.querySelector(s); if (el) el.style.opacity = 0; });

    if (window.anime) anime({ targets: overlay, opacity: [0, 1], duration: 300, easing: 'easeOutQuad' });

    if (prefersReducedMotion()) {
        /* Versión accesible: sin shake ni flashes, solo fade + scale */
        setTimeout(() => {
            box.innerHTML = reward.icon;
            const svg = box.querySelector('svg');
            if (svg) { svg.style.width = '140px'; svg.style.height = '140px'; }
            if (text) { text.textContent = reward.title.toUpperCase(); text.style.opacity = '1'; }
            if (typeof confetti === 'function') confetti({ particleCount: 160, spread: 120, origin: { y: 0.5 }, colors: ['#ffd60a', '#ff3b5c', '#2dd4ff', '#ffffff'] });
        }, 350);
        setTimeout(() => { closeBrawlBox(); }, 2000);
        return;
    }

    if (!window.anime) {
        /* Fallback sin anime.js: revela la recompensa directamente */
        setTimeout(() => {
            box.innerHTML = reward.icon;
            const svg = box.querySelector('svg');
            if (svg) { svg.style.width = '140px'; svg.style.height = '140px'; }
            if (text) text.textContent = reward.title.toUpperCase();
            if (typeof confetti === 'function') confetti({ particleCount: 160, spread: 120, origin: { y: 0.5 }, colors: ['#ffd60a', '#ff3b5c', '#2dd4ff', '#ffffff'] });
        }, 350);
        setTimeout(() => { closeBrawlBox(); }, 2000);
        return;
    }

    const tl = anime.timeline({ easing: 'easeOutQuad' });
    tl.add({
        targets: box, scale: [1, 1.3, 0.8, 1.4, 0.75, 1.2], rotate: ['0deg', '-15deg', '15deg', '-12deg', '12deg', '-5deg'],
        duration: 1900, easing: 'easeInOutSine'
    })
    .add({ targets: glow, opacity: [0, 1], scale: [1, 12], duration: 600, easing: 'easeOutExpo' }, '-=300')
    .add({
        targets: box, scale: [1, 0], opacity: [1, 0], duration: 380, easing: 'easeInBack',
        complete: () => {
            box.innerHTML = reward.icon;
            box.style.opacity = 1;
            const svg = box.querySelector('svg');
            if (svg) { svg.style.width = '160px'; svg.style.height = '160px'; svg.style.filter = 'drop-shadow(0 0 30px rgba(255,214,10,0.9))'; }
            overlay.style.boxShadow = 'inset 0 0 120px rgba(255,214,10,0.4)';
        }
    })
    .add({ targets: box, scale: [0, 1.8, 0.9, 1.05, 1], rotate: ['0deg', '360deg', '-10deg', '5deg', '0deg'], duration: 1100, easing: 'easeOutElastic(1, .45)' })
    .add({ targets: stars, opacity: [0, 1, 0.7, 1], translateY: [40, -25, -15, -20], scale: [0, 1.3, 0.9, 1.1], duration: 800, delay: anime.stagger(90), easing: 'easeOutQuad' }, '-=800')
    .add({
        targets: text, opacity: [0, 1], translateY: [22, 0], duration: 500,
        complete: () => {
            text.textContent = reward.title.toUpperCase();
            text.style.textShadow = '0 0 20px rgba(255,214,10,0.8), 0 0 40px rgba(255,214,10,0.4)';
            if (typeof confetti === 'function') {
                confetti({ particleCount: 220, spread: 140, origin: { y: 0.45 }, colors: ['#ffd60a', '#ff3b5c', '#2dd4ff', '#ffffff', '#7c3aed'], scalar: 1.2 });
                setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { x: 0.2, y: 0.5 }, colors: ['#ffd60a', '#ff2f6e'] }), 300);
                setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { x: 0.8, y: 0.5 }, colors: ['#2dd4ff', '#ffd60a'] }), 500);
            }
        }
    }, '-=200');

    setTimeout(() => {
        if (overlay.classList.contains('visible') && text) {
            const sub = document.createElement('p');
            sub.style.cssText = 'color:#fff; font-weight:600; margin-top:12px; font-size:1.05rem; text-align:center; max-width:340px; padding:0 22px;';
            sub.textContent = reward.desc;
            text.after(sub);
            anime({ targets: sub, opacity: [0, 1], duration: 450 });
        }
    }, 4000);

    setTimeout(() => { closeBrawlBox(); }, 6800);
}

function closeBrawlBox() {
    const overlay = document.getElementById('brawlboxOverlay');
    if (!overlay) { brawlBoxRunning = false; return; }
    const box = document.getElementById('brawlboxBox');
    const text = document.getElementById('brawlboxText');
    const finish = () => {
        overlay.classList.remove('visible');
        overlay.style.boxShadow = '';
        if (text) { text.textContent = ''; text.style.textShadow = ''; }
        if (box) box.innerHTML = '';
        const extraSub = overlay.querySelector('p + p');
        if (extraSub) extraSub.remove();
        brawlBoxRunning = false;
        const r = pendingReward;
        pendingReward = null;
        if (window.brawlBoxCompleted) window.brawlBoxCompleted(r);
    };
    if (window.anime) {
        anime({ targets: overlay, opacity: [1, 0], duration: 400, easing: 'easeInQuad', complete: finish });
    } else {
        finish();
    }
}

function skipBrawlBox() {
    const overlay = document.getElementById('brawlboxOverlay');
    if (!overlay || !overlay.classList.contains('visible')) return;
    if (window.anime) anime.remove('#brawlboxBox, #brawlboxGlow, #brawlboxText, .brawlbox-star');
    closeBrawlBox();
}

(function bindBrawlBoxSkip() {
    function bind() {
        const btn = document.getElementById('brawlboxSkip');
        if (btn) btn.addEventListener('click', skipBrawlBox);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
    else bind();
})();
