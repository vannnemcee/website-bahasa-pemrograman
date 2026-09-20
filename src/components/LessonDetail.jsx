import React, { useState, useEffect, useRef } from 'react';
import { lessons, categoryInfo } from '../data/lessons';
import CodeEditor from './CodeEditor';
import ResultModal from './ResultModal';
import { soundRun, soundSuccess, soundError, soundHint, soundBack, soundClick } from '../utils/sounds';

/* ========= VALIDATION HELPERS ========= */
function normalizeCode(str) {
  return str
    .replace(/\s+/g, '')
    .replace(/;/g, '')
    .replace(/['"`]/g, '"')
    .toLowerCase();
}

function checkAnswer(code, lesson) {
  const { checkType, checkConfig } = lesson;

  if (checkType === 'html-element') {
    const { tag, text } = checkConfig;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, 'text/html');
      const el = doc.querySelector(tag);
      if (!el) return false;
      if (text) {
        const elText = el.textContent.trim().toLowerCase();
        if (Array.isArray(text)) {
          return text.some((t) => elText === t.toLowerCase() || elText.includes(t.toLowerCase()));
        }
        const target = text.toLowerCase();
        return elText === target || elText.includes(target);
      }
      return true;
    } catch {
      return false;
    }
  }

  if (checkType === 'html-img') {
    const { src, alt } = checkConfig;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, 'text/html');
      const img = doc.querySelector('img');
      if (!img) return false;
      const srcMatch = img.getAttribute('src')?.trim().toLowerCase() === src.toLowerCase();
      const altMatch = !alt || img.getAttribute('alt')?.trim().toLowerCase() === alt.toLowerCase();
      return srcMatch && altMatch;
    } catch {
      return false;
    }
  }

  if (checkType === 'css-property') {
    const { property, value } = checkConfig;
    const norm = normalizeCode(code);
    const normProp = normalizeCode(property);
    const normVal = normalizeCode(value);
    return norm.includes(normProp + ':' + normVal) || norm.includes(normProp + normVal);
  }

  if (checkType === 'js-pattern') {
    const { pattern } = checkConfig;
    // Normalisasi quotes, spasi, dan deklarasi variable let/var/const
    const norm = normalizeCode(code).replace(/\b(var|const)\b/g, 'let');
    const normPat = normalizeCode(pattern).replace(/\b(var|const)\b/g, 'let');

    if (norm.includes(normPat)) return true;

    // Pengecekan cerdas untuk kondisi if dan function jika ada variasi tanda kurung kurawal {}
    if (normPat.includes('if(')) {
      return norm.includes('if(5>3)') && (norm.includes('console.log("benar")') || norm.includes('console.log("benar")'));
    }
    if (normPat.includes('functionsapa')) {
      return norm.includes('functionsapa()') && norm.includes('console.log("halo!")');
    }
    if (normPat.includes('hasil=5+3')) {
      return norm.includes('hasil=5+3');
    }
    if (normPat.includes('nama="evan"')) {
      return norm.includes('nama="evan"');
    }

    return false;
  }

  return false;
}

/* ========= CSS PREVIEW ========= */
function CSSPreview({ code, previewLabel }) {
  const srcDoc = `
    <html>
      <head>
        <style>
          body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100px; background: #111827; font-family: 'Courier New', monospace; }
          .preview-box { font-size: 18px; font-weight: bold; padding: 16px 24px; border: 2px solid #4CC9F0; color: #F8FAFC; ${code} }
        </style>
      </head>
      <body><div class="preview-box">${previewLabel || 'HELLO PIXEL'}</div></body>
    </html>
  `;
  return (
    <iframe
      title="css-preview"
      srcDoc={srcDoc}
      className="preview-iframe"
      style={{ minHeight: '120px' }}
      sandbox="allow-scripts"
    />
  );
}

/* ========= HTML PREVIEW — iframe agar tag render benar ========= */
function HTMLPreview({ code }) {
  // Wrap di dalam full HTML doc supaya tag seperti <h1> <p> <button> render dengan benar
  const srcDoc = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>
      body {
        margin: 16px;
        font-family: Arial, sans-serif;
        font-size: 16px;
        color: #111;
        background: #ffffff;
      }
      h1 { font-size: 2em; margin: 0.2em 0; }
      h2 { font-size: 1.5em; margin: 0.2em 0; }
      h3 { font-size: 1.2em; }
      p  { margin: 0.4em 0; }
      button { padding: 6px 14px; cursor: pointer; font-size: 14px; }
      a  { color: #0066cc; }
      img { max-width: 100%; }
    </style>
  </head>
  <body>${code}</body>
</html>`;
  return (
    <iframe
      title="html-preview"
      srcDoc={srcDoc}
      className="preview-iframe"
      style={{ minHeight: '120px', width: '100%', border: 'none', display: 'block', background: 'white' }}
      sandbox="allow-scripts"
    />
  );
}

/* ========= JS PREVIEW — iframe dengan allow-modals agar alert() beneran muncul ========= */
function JSPreview({ code, runKey }) {
  // Wrap kode JS user di dalam HTML dengan console.log redirect ke UI
  const srcDoc = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { margin: 0; padding: 12px; background: #0d0d1a; font-family: 'Courier New', monospace; font-size: 13px; color: #63f5a8; }
      .log-line { padding: 2px 0; border-bottom: 1px solid #1a1a2e; word-break: break-all; }
      .log-line.error { color: #ff667d; }
    </style>
  </head>
  <body>
    <div id="output"></div>
    <script>
      // Redirect console.log ke div output
      var out = document.getElementById('output');
      var origLog = console.log;
      console.log = function() {
        var args = Array.prototype.slice.call(arguments);
        var line = document.createElement('div');
        line.className = 'log-line';
        line.textContent = '> ' + args.join(' ');
        out.appendChild(line);
        origLog.apply(console, args);
      };
      try {
        ${code}
      } catch(e) {
        var errLine = document.createElement('div');
        errLine.className = 'log-line error';
        errLine.textContent = 'Error: ' + e.message;
        out.appendChild(errLine);
      }
    <\/script>
  </body>
</html>`;
  return (
    <iframe
      key={runKey}
      title="js-preview"
      srcDoc={srcDoc}
      className="preview-iframe"
      style={{ minHeight: '120px', width: '100%', border: 'none', display: 'block', background: '#0d0d1a' }}
      sandbox="allow-scripts allow-modals"
    />
  );
}

/* ========= LESSON DETAIL ========= */
function LessonDetail({ category, lesson, onBack, onComplete, completedLessons, soundEnabled }) {
  const [code, setCode] = useState(lesson.starterCode || '');
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  // runKey: increment setiap klik RUN agar iframe JS di-refresh ulang
  const [runKey, setRunKey] = useState(0);
  const [hasRun, setHasRun] = useState(false);
  const [mobileTab, setMobileTab] = useState('quest'); // 'quest' | 'editor'
  const lessonList = lessons[category];
  const currentIndex = lessonList.findIndex((l) => l.id === lesson.id);
  const nextLesson = lessonList[currentIndex + 1] || null;
  const isLastLesson = !nextLesson;
  const isCleared = completedLessons.includes(`${category}-${lesson.id}`);
  const info = categoryInfo[category];

  const catColorMap = {
    html: '#FF667D',
    css: '#4CC9F0',
    javascript: '#FFD166',
  };
  const catColor = catColorMap[category] || '#4CC9F0';

  // Reset when lesson changes
  useEffect(() => {
    setCode(lesson.starterCode || '');
    setResult(null);
    setShowHint(false);
    setMobileTab('quest');
  }, [lesson.id]);

  function handleRun() {
    if (soundEnabled) soundRun();
    // Refresh iframe JS setiap klik RUN
    setRunKey(k => k + 1);
    setHasRun(true);
    const isCorrect = checkAnswer(code, lesson);
    if (isCorrect) {
      setResult('correct');
      onComplete(`${category}-${lesson.id}`);
      if (soundEnabled) setTimeout(() => soundSuccess(), 200);
    } else {
      setResult('wrong');
      if (soundEnabled) setTimeout(() => soundError(), 200);
    }
  }

  function handleNext() {
    if (nextLesson) {
      onBack();
    }
    setResult(null);
  }

  function handleRetry() {
    if (soundEnabled) soundClick();
    setResult(null);
    setCode(lesson.starterCode || '');
  }

  return (
    <div className="lesson-detail-screen">
      {/* Header row */}
      <div className="lesson-detail-header">
        <button className="btn btn-ghost" onClick={() => { if(soundEnabled) soundBack(); onBack(); }}>← BACK</button>

        <div className="quest-hud">
          <div className="hud-item">
            <span className="hud-label">LEVEL</span>
            <span className="hud-value" style={{ color: catColor }}>{info.label}</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">QUEST</span>
            <span className="hud-value">{String(currentIndex + 1).padStart(2, '0')}</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">STATUS</span>
            <span className="hud-value" style={{ color: isCleared ? 'var(--color-green)' : 'var(--color-yellow)' }}>
              {isCleared ? 'CLEARED' : 'LEARNING'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher untuk mempermudah layar sentuh / HP */}
      <div className="mobile-lesson-tabs">
        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'quest' ? 'active' : ''}`}
          onClick={() => { if (soundEnabled) soundClick(); setMobileTab('quest'); }}
        >
          📋 MATERI & SOAL
        </button>
        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'editor' ? 'active' : ''}`}
          onClick={() => { if (soundEnabled) soundClick(); setMobileTab('editor'); }}
        >
          ⚡ KODING & PREVIEW
        </button>
      </div>

      <div className={`lesson-layout mobile-tab-${mobileTab}`}>
        {/* LEFT: Quest Panel */}
        <div className="lesson-col-quest">
          <div className="quest-panel">
            <div className="quest-panel-header">
              <h2>{info.label} QUEST {String(currentIndex + 1).padStart(2, '0')}</h2>
              <span className="quest-id-badge">#{lesson.id}</span>
            </div>
            <div className="quest-panel-body">

              <div className="quest-section">
                <span className="quest-section-label">◆ MATERI</span>
                <h3 style={{ fontSize: '12px', color: catColor, marginBottom: '12px' }}>
                  {lesson.title.toUpperCase()}
                </h3>
                <p className="quest-section-label" style={{ color: 'var(--color-gray-light)', fontSize: '7px' }}>
                  {lesson.description}
                </p>
              </div>

              <div className="quest-section">
                <span className="quest-section-label">◆ PENJELASAN</span>
                <p className="quest-explanation">{lesson.explanation}</p>
              </div>

              <div className="quest-section">
                <span className="quest-section-label">◆ CONTOH KODE</span>
                <pre className="quest-example">{lesson.example}</pre>
              </div>

              <div className="quest-section">
                <span className="quest-section-label">◆ YOUR QUEST</span>
                <div className="quest-instruction">
                  🎯 {lesson.instruction}
                </div>
              </div>

              {/* Tombol khusus Mobile untuk langsung lompat ke tab editor */}
              <button
                type="button"
                className="btn btn-run mobile-start-code-btn"
                onClick={() => { if (soundEnabled) soundClick(); setMobileTab('editor'); }}
              >
                ▶ MULAI KODING SEKARANG →
              </button>

            </div>
          </div>
        </div>

        {/* RIGHT: Editor + Preview */}
        <div className="lesson-col-editor">
          {/* Pengingat instruksi soal pada tampilan HP */}
          <div className="mobile-quest-banner">
            <span className="banner-badge" style={{ background: catColor }}>TARGET</span>
            <span className="banner-text">{lesson.instruction}</span>
          </div>

          {/* Code Editor */}
          <div className="editor-panel">
            <div className="editor-header">
              <span className="editor-title">CODE EDITOR</span>
              <div className="editor-dots">
                <div className="editor-dot red" />
                <div className="editor-dot yellow" />
                <div className="editor-dot green" />
              </div>
            </div>

            <CodeEditor
              value={code}
              onChange={setCode}
              category={category}
            />

            <div className="editor-footer">
              <button
                className="btn btn-yellow"
                onClick={() => {
                  if (soundEnabled) soundHint();
                  setShowHint(!showHint);
                }}
              >
                {showHint ? '▼ HINT' : '? HINT'}
              </button>
              <button className="btn-run btn" onClick={handleRun}>
                ▶ RUN
              </button>
            </div>
          </div>

          {/* Hint */}
          {showHint && (
            <div className="hint-box">
              💡 HINT: {lesson.hint}
            </div>
          )}

          {/* Preview */}
          {category === 'html' && code.trim() && (
            <div className="preview-panel" style={{ marginTop: '16px' }}>
              <div className="preview-header">
                <span className="preview-title">LIVE PREVIEW</span>
                <span style={{ fontSize: '7px', color: 'var(--bg-main)' }}>PIXEL → REALITY</span>
              </div>
              {/* Pakai iframe agar HTML dirender dengan benar — tag tidak hilang */}
              <HTMLPreview code={code} />
            </div>
          )}

          {category === 'css' && (
            <div className="preview-panel" style={{ marginTop: '16px' }}>
              <div className="preview-header">
                <span className="preview-title">CSS PREVIEW</span>
                <span style={{ fontSize: '7px', color: 'var(--bg-main)' }}>PIXEL → REALITY</span>
              </div>
              <CSSPreview code={code} previewLabel={lesson.previewLabel} />
            </div>
          )}

          {category === 'javascript' && (
            <div className="preview-panel" style={{ marginTop: '16px' }}>
              <div className="preview-header" style={{ background: 'var(--color-yellow)' }}>
                <span className="preview-title">JS OUTPUT — {hasRun ? 'EXECUTED ✓' : 'TEKAN ▶ RUN'}</span>
                <span style={{ fontSize: '7px', color: 'var(--bg-main)' }}>PIXEL → REALITY</span>
              </div>
              {/* Iframe yang beneran jalankan JS — alert() popup asli akan muncul */}
              {hasRun ? (
                <JSPreview code={code} runKey={runKey} />
              ) : (
                <div style={{ padding: '16px', background: '#0d0d1a', minHeight: '80px', display: 'flex', alignItems: 'center' }}>
                  <p style={{ fontSize: '8px', color: 'var(--color-gray-light)', lineHeight: 2.2, margin: 0 }}>
                    ▶ Klik tombol <strong style={{ color: 'var(--color-yellow)' }}>RUN</strong> untuk menjalankan kode!<br />
                    • <code style={{ color: '#FFD166' }}>alert()</code> → popup asli akan muncul<br />
                    • <code style={{ color: '#63f5a8' }}>console.log()</code> → output tampil di sini
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Result Modal */}
      <ResultModal
        result={result}
        onNext={handleNext}
        onRetry={handleRetry}
        onClose={() => setResult(null)}
        isLastLesson={isLastLesson}
      />
    </div>
  );
}

export default LessonDetail;
