/**
 * sounds.js — Pixel Code Academy Sound Engine
 *
 * Terinspirasi dari useSoundFX milik Razzan Portfolio:
 * - Karakteristik: zero-latency, micro-interaction, sintetis via Web Audio API
 * - playHover : tick pendek seperti keyboard mechanical
 * - playClick : click lebih tegas dengan sedikit decay
 *
 * Kita extend dengan suara tambahan untuk quest:
 * - soundRun / soundSuccess / soundError / soundHint / soundBack / soundTheme / soundSelect
 */

let ctx = null;

/** Dapatkan AudioContext — lazy init agar tidak kena autoplay policy */
function getCtx() {
  if (!ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      ctx = new AudioContextClass();
    }
  }
  // Resume kalau suspended (autoplay policy)
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

// Unlock audio context pada interaksi pertama pengguna
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const c = getCtx();
      if (c && c.state === 'suspended') {
        c.resume().catch(() => {});
      }
    } catch {}
  };
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
}

/**
 * Core synthesizer — persis gaya Razzan useSoundFX.
 * Buat nada singkat dengan oscillator + gain envelope.
 *
 * @param {number}  freq       - Frekuensi Hz
 * @param {string}  type       - 'sine' | 'square' | 'triangle' | 'sawtooth'
 * @param {number}  duration   - Durasi detik
 * @param {number}  gainPeak   - Volume puncak (0–1)
 * @param {number}  startDelay - Delay mulai (detik, default 0)
 */
function synth(freq, type = 'sine', duration = 0.06, gainPeak = 0.18, startDelay = 0) {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime + startDelay;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    // Razzan-style envelope: instant attack, quick exponential decay
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.start(now);
    osc.stop(now + duration + 0.01);
  } catch { /* Silence on error */ }
}

/* =================================================================
   RAZZAN-STYLE SOUNDS (PERSIS DARI useSoundFX.ts)
   Repository: https://github.com/YuZann81/razzan-portofolio
================================================================= */

/**
 * playHover — High-frequency subtle hover blip
 * Triangle wave 1400Hz -> 1600Hz linear ramp, 0.02s
 */
export function soundHover() {
  try {
    const c = getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, c.currentTime);
    osc.frequency.linearRampToValueAtTime(1600, c.currentTime + 0.02);
    gain.gain.setValueAtTime(0.03, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.02);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.02);
  } catch {
    // Ignore
  }
}

/**
 * playClick — Subtle mechanical / digital click
 * Sine wave 800Hz -> 200Hz exponential ramp, 0.04s
 */
export function soundClick() {
  try {
    const c = getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, c.currentTime + 0.04);
    gain.gain.setValueAtTime(0.08, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.04);
  } catch {
    // AudioContext might be blocked before user interaction
  }
}

/**
 * soundTheme — Toggle theme sound (menggunakan click khas Razzan)
 */
export function soundTheme() {
  soundClick();
}

/* =================================================================
   EXTENDED SOUNDS — tetap bergaya Razzan tapi lebih ekspresif
================================================================= */

/**
 * soundSelect — Klik kategori / pilih quest
 * Dua nada naik cepat (ascending micro-chime)
 */
export function soundSelect() {
  synth(900, 'sine', 0.06, 0.12);
  synth(1400, 'sine', 0.07, 0.10, 0.04);
}

/**
 * soundBack — Navigasi mundur
 * Dua nada turun (descending)
 */
export function soundBack() {
  synth(1000, 'sine', 0.05, 0.12);
  synth(700, 'sine', 0.06, 0.08, 0.03);
}

/**
 * soundRun — Klik tombol RUN/submit kode
 * Tone cepat seperti "processing" — square wave pendek
 */
export function soundRun() {
  synth(600, 'square', 0.04, 0.10);
  synth(800, 'square', 0.05, 0.07, 0.03);
}

/**
 * soundSuccess — Quest CLEARED / kode benar
 * Arpeggio 5 nada naik bergaya chiptune — signature keberhasilan
 */
export function soundSuccess() {
  const notes = [523, 659, 784, 1047, 1319]; // C5 E5 G5 C6 E6
  notes.forEach((freq, i) => {
    synth(freq, 'sine', 0.10, 0.14, i * 0.07);
  });
}

/**
 * soundError — Kode salah / try again
 * Tiga nada turun dengan sawtooth — "buzzer" tegas tapi tidak harsh
 */
export function soundError() {
  synth(400, 'sawtooth', 0.07, 0.10);
  synth(320, 'sawtooth', 0.08, 0.09, 0.08);
  synth(240, 'sawtooth', 0.10, 0.08, 0.16);
}

/**
 * soundHint — Tampilkan hint
 * Sine lembut tunggal — "ding" halus
 */
export function soundHint() {
  synth(1600, 'sine', 0.12, 0.08);
  synth(2000, 'sine', 0.10, 0.05, 0.06);
}

/**
 * soundLaunch — Transisi selesai loading meluncur ke atas
 * Nada arpeggio ascending 8-bit ceria
 */
export function soundLaunch() {
  synth(523, 'square', 0.08, 0.12);
  synth(659, 'square', 0.08, 0.12, 0.06);
  synth(784, 'square', 0.09, 0.14, 0.12);
  synth(1046, 'sine', 0.18, 0.15, 0.18);
}

/**
 * soundTyping — Mechanical keyboard / cyber tactile typing click
 * Karakteristik:
 * - Dihasilkan murni via Web Audio API tanpa beban file audio eksternal
 * - Kombinasi transient snap (high-frequency click) + bottom-out body resonance
 * - Pitch bervariasi dinamis per tombol (Space, Enter, Backspace, Tab, & variasi acak)
 * - Volume lembut dan tidak memekakkan telinga (non-fatiguing)
 */
let lastTypeAudioTime = 0;

export function soundTyping(key = '') {
  try {
    const c = getCtx();
    if (!c) return;

    const now = c.currentTime;
    // Micro debounce (20ms) agar audio tidak distorsi/menumpuk saat fast typing
    if (now - lastTypeAudioTime < 0.02) return;
    lastTypeAudioTime = now;

    // Variasi acak halus (+/- 7%) agar terasa seperti keyboard fisik sungguhan
    const jitter = 0.93 + Math.random() * 0.14;

    let clickFreq = 2100 * jitter;
    let bodyFreq = 340 * jitter;
    let volume = 0.042;
    let duration = 0.026;

    if (key === 'Enter') {
      clickFreq = 1500;
      bodyFreq = 220;
      volume = 0.058;
      duration = 0.036;
    } else if (key === ' ' || key === 'Space') {
      clickFreq = 1750;
      bodyFreq = 250;
      volume = 0.048;
      duration = 0.032;
    } else if (key === 'Backspace' || key === 'Delete') {
      clickFreq = 2600 * jitter;
      bodyFreq = 400;
      volume = 0.044;
      duration = 0.024;
    } else if (key === 'Tab') {
      clickFreq = 1900;
      bodyFreq = 290;
      volume = 0.048;
      duration = 0.03;
    }

    // 1. Transient click (snappy tactile switch click)
    const oscClick = c.createOscillator();
    const gainClick = c.createGain();
    oscClick.type = 'triangle';
    oscClick.frequency.setValueAtTime(clickFreq, now);
    oscClick.frequency.exponentialRampToValueAtTime(Math.max(180, clickFreq * 0.35), now + 0.012);

    gainClick.gain.setValueAtTime(volume * 0.85, now);
    gainClick.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

    oscClick.connect(gainClick);
    gainClick.connect(c.destination);
    oscClick.start(now);
    oscClick.stop(now + 0.015);

    // 2. Body resonance (subtle mechanical bottom-out thud)
    const oscBody = c.createOscillator();
    const gainBody = c.createGain();
    oscBody.type = 'sine';
    oscBody.frequency.setValueAtTime(bodyFreq, now);
    oscBody.frequency.exponentialRampToValueAtTime(Math.max(70, bodyFreq * 0.45), now + duration);

    gainBody.gain.setValueAtTime(volume * 0.65, now);
    gainBody.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscBody.connect(gainBody);
    gainBody.connect(c.destination);
    oscBody.start(now);
    oscBody.stop(now + duration + 0.004);
  } catch {
    // Ignore audio error
  }
}
