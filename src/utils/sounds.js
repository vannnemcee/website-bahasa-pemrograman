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
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume kalau suspended (autoplay policy)
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
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
  } catch (_) { /* Silence on error */ }
}

/* =================================================================
   RAZZAN-STYLE SOUNDS
   Dokumentasi dari useSoundFX.ts: playHover + playClick
================================================================= */

/**
 * playHover — Tick pendek seperti mechanical keyboard hover
 * Razzan: sine wave, sangat pendek, frekuensi tinggi, volume kecil
 */
export function soundHover() {
  synth(1800, 'sine', 0.04, 0.08);
}

/**
 * playClick — Click tegas dengan sedikit pitch drop
 * Razzan: dua nada cepat — attack tinggi lalu sedikit lebih rendah
 */
export function soundClick() {
  synth(1200, 'sine', 0.05, 0.15);
  synth(900, 'sine', 0.06, 0.08, 0.025);
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
 * soundTheme — Toggle dark/light mode
 * Ping ringan dua nada yang terasa "switching"
 */
export function soundTheme() {
  synth(1200, 'sine', 0.06, 0.10);
  synth(1600, 'sine', 0.07, 0.08, 0.05);
}
