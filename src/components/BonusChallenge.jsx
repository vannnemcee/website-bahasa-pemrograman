import React, { useState, useEffect } from 'react';
import { categoryIntro } from '../data/introData';
import { soundRun, soundSuccess, soundClick, soundBack } from '../utils/sounds';

/* ===== CSS Preview for bonus ===== */
function CSSBonusPreview({ code }) {
  const srcDoc = `
    <html>
      <head>
        <style>
          body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 120px; background: #111827; font-family: Arial, sans-serif; }
          .box { font-size: 18px; font-weight: bold; padding: 16px 32px; ${code} }
        </style>
      </head>
      <body><div class="box">HELLO PIXEL — Desain Bebas!</div></body>
    </html>
  `;
  return (
    <iframe
      title="css-bonus-preview"
      srcDoc={srcDoc}
      style={{ width: '100%', minHeight: '120px', border: 'none', display: 'block', background: 'white' }}
      sandbox="allow-scripts"
    />
  );
}

function BonusChallenge({ category, onBack, onComplete, completedLessons, soundEnabled }) {
  const intro = categoryIntro[category];
  const bonusKey = `${category}-bonus`;
  const isAlreadyCompleted = completedLessons.includes(bonusKey);
  const [code, setCode] = useState(intro.bonusPlaceholder || '');
  const [submitted, setSubmitted] = useState(isAlreadyCompleted);
  const [error, setError] = useState('');

  const catColor = intro.color;
  const lines = code.split('\n');
  const lineCount = Math.max(lines.length, 6);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newVal = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newVal);
      setTimeout(() => {
        e.target.selectionStart = start + 2;
        e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  function handleSubmit() {
    if (soundEnabled) soundRun();
    const trimmed = code.replace(/\s+/g, '').replace(/<!--.*?-->/g, '').replace(/\/\*.*?\*\//g, '');
    if (trimmed.length < (intro.bonusMinLength || 15)) {
      setError('Kodenya terlalu pendek! Coba tambahkan lebih banyak konten.');
      return;
    }
    setError('');
    if (soundEnabled) setTimeout(() => soundSuccess(), 200);
    setSubmitted(true);
    onComplete(bonusKey);
  }

  function handleReset() {
    if (soundEnabled) soundClick();
    setSubmitted(false);
    setCode(intro.bonusPlaceholder || '');
    setError('');
  }

  return (
    <div className="bonus-screen">
      {/* Header */}
      <div className="lesson-detail-header">
        <button
          className="btn btn-ghost"
          onClick={() => { if (soundEnabled) soundBack(); onBack(); }}
        >
          ← BACK
        </button>
        <div className="quest-hud">
          <div className="hud-item">
            <span className="hud-label">LEVEL</span>
            <span className="hud-value" style={{ color: catColor }}>
              {category.toUpperCase()}
            </span>
          </div>
          <div className="hud-item">
            <span className="hud-label">TIPE</span>
            <span className="hud-value" style={{ color: catColor }}>TUGAS BEBAS</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">STATUS</span>
            <span className="hud-value" style={{ color: submitted ? 'var(--color-green)' : 'var(--color-yellow)' }}>
              {submitted ? 'SELESAI' : 'OPEN'}
            </span>
          </div>
        </div>
      </div>

      {/* Title Banner */}
      <div className="bonus-banner" style={{ borderColor: catColor, background: `${catColor}15` }}>
        <div className="bonus-star-row">
          <span style={{ color: catColor }}>★ ★ ★</span>
          <span className="bonus-tag" style={{ color: catColor, borderColor: catColor }}>TUGAS TAMBAHAN</span>
          <span style={{ color: catColor }}>★ ★ ★</span>
        </div>
        <h1 className="bonus-title" style={{ color: catColor }}>
          {intro.bonusTitle}
        </h1>
        <p className="bonus-instruction">
          {intro.bonusInstruction}
        </p>
      </div>

      {/* Success State */}
      {submitted && (
        <div className="bonus-success-box">
          <div className="bonus-success-icon">🏆</div>
          <h2 style={{ color: 'var(--color-green)', fontSize: '14px', marginBottom: '8px' }}>
            TUGAS SELESAI!
          </h2>
          <p style={{ fontSize: '8px', color: 'var(--color-gray-light)', lineHeight: 2, marginBottom: '16px' }}>
            Hebat! Kamu telah berhasil menyelesaikan tugas bebas {category.toUpperCase()}.<br />
            Karya kode kamu telah menjadi kenyataan.
          </p>
          <p style={{ fontSize: '8px', color: 'var(--color-blue)', letterSpacing: '2px', marginBottom: '20px' }}>
            ✦ Your code has become reality. ✦
          </p>
          <button className="btn btn-ghost" onClick={handleReset}>
            ✎ EDIT ULANG
          </button>
        </div>
      )}

      {/* Editor + Preview layout */}
      <div className="lesson-layout" style={{ marginTop: '20px' }}>
        {/* Left: Editor */}
        <div>
          <div className="editor-panel" style={{ borderColor: catColor }}>
            <div className="editor-header">
              <span className="editor-title" style={{ color: catColor }}>
                CODE EDITOR — {category.toUpperCase()}
              </span>
              <div className="editor-dots">
                <div className="editor-dot red" />
                <div className="editor-dot yellow" />
                <div className="editor-dot green" />
              </div>
            </div>

            {/* Line numbers + textarea */}
            <div className="editor-body">
              <div className="editor-line-numbers">
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i} className="line-number">{i + 1}</div>
                ))}
              </div>
              <textarea
                className="editor-textarea"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                rows={Math.max(lineCount, 6)}
                style={{
                  color:
                    category === 'html' ? '#FF8B9A' :
                    category === 'css' ? '#4CC9F0' :
                    '#FFD166',
                }}
                placeholder={intro.bonusPlaceholder}
                disabled={submitted}
              />
            </div>

            <div className="editor-footer">
              {error && (
                <span style={{ fontSize: '7px', color: 'var(--color-red)', flex: 1 }}>
                  ✕ {error}
                </span>
              )}
              {!submitted ? (
                <button
                  className="btn-run btn"
                  onClick={handleSubmit}
                  style={{ marginLeft: 'auto' }}
                >
                  ▶ SUBMIT TUGAS
                </button>
              ) : (
                <span style={{ fontSize: '8px', color: 'var(--color-green)', marginLeft: 'auto' }}>
                  ✓ TUGAS DIKUMPULKAN
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div>
          <div className="preview-panel" style={{ borderColor: catColor, boxShadow: `4px 4px 0px ${intro.colorDark}` }}>
            <div className="preview-header" style={{ background: catColor }}>
              <span className="preview-title">LIVE PREVIEW — KARYA BEBAS</span>
              <span style={{ fontSize: '7px', color: '#080C16' }}>PIXEL → REALITY</span>
            </div>

            {/* HTML Preview */}
            {category === 'html' && (
              <div
                className="preview-body"
                dangerouslySetInnerHTML={{ __html: code }}
              />
            )}

            {/* CSS Preview */}
            {category === 'css' && (
              <CSSBonusPreview code={code} />
            )}

            {/* JS Preview */}
            {category === 'javascript' && (
              <div style={{ padding: '16px', background: '#0d0d1a', minHeight: '120px' }}>
                <p style={{ fontSize: '8px', color: 'var(--color-gray-light)', marginBottom: '12px', lineHeight: 2 }}>
                  📝 Kode JavaScript-mu akan divalidasi secara teks.<br />
                  Pastikan kode sudah sesuai dengan yang kamu inginkan.
                </p>
                {code.trim() && (
                  <pre style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '11px',
                    color: '#FFD166',
                    background: '#080C16',
                    border: '1px solid #333',
                    padding: '12px',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}>
                    {code}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Tips box */}
          <div className="bonus-tips-box" style={{ borderColor: catColor }}>
            <span className="pixel-label" style={{ color: catColor }}>◆ TIPS</span>
            {category === 'html' && (
              <ul className="bonus-tips-list">
                <li>Gunakan tag {'<h1>'} sampai {'<h6>'} untuk judul</li>
                <li>Gunakan tag {'<p>'} untuk paragraf</li>
                <li>Gunakan tag {'<button>'} untuk tombol</li>
                <li>Gunakan tag {'<a href="#">'} untuk link</li>
                <li>Gunakan tag {'<img src="..." alt="...">'} untuk gambar</li>
              </ul>
            )}
            {category === 'css' && (
              <ul className="bonus-tips-list">
                <li>color: untuk warna teks</li>
                <li>background-color: untuk background</li>
                <li>font-size: untuk ukuran huruf</li>
                <li>border: untuk garis tepi</li>
                <li>padding: untuk jarak dalam</li>
                <li>border-radius: untuk sudut melengkung</li>
              </ul>
            )}
            {category === 'javascript' && (
              <ul className="bonus-tips-list">
                <li>let / const untuk variable</li>
                <li>console.log() untuk tampilkan teks</li>
                <li>alert() untuk popup</li>
                <li>if (kondisi) {'{ ... }'} untuk kondisi</li>
                <li>function nama() {'{ ... }'} untuk fungsi</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BonusChallenge;
