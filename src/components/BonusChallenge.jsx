import React, { useState, useRef } from 'react';
import { categoryIntro } from '../data/introData';
import { soundRun, soundSuccess, soundClick, soundBack, soundHover } from '../utils/sounds';
import { runPythonCode } from '../utils/pythonRunner';
import { runPhpCode } from '../utils/phpRunner';
import { runTypeScriptCode } from '../utils/typescriptRunner';
import { handleEditorKeyDown, insertEditorSymbol } from '../utils/editorHelper';
import { Code2, Play } from 'lucide-react';
import BrandIcon from './BrandIcon';

/* ===== HTML Preview for bonus ===== */
function HTMLBonusPreview({ code }) {
  const isFullDoc = code.toLowerCase().includes('<!doctype') || code.toLowerCase().includes('<html');
  const srcDoc = isFullDoc
    ? code
    : `<!DOCTYPE html>
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
  <body>${code || '<p style="color:#888; font-style:italic;">Ketik kode HTML di sebelah kiri untuk melihat hasil di sini...</p>'}</body>
</html>`;

  return (
    <iframe
      title="html-bonus-preview"
      srcDoc={srcDoc}
      style={{ width: '100%', minHeight: '160px', border: 'none', display: 'block', background: 'white' }}
      sandbox="allow-scripts"
    />
  );
}

/* ===== CSS Preview for bonus ===== */
function CSSBonusPreview({ code }) {
  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 160px; background: #111827; font-family: Arial, sans-serif; }
          .box { font-size: 18px; font-weight: bold; padding: 16px 32px; transition: all 0.3s ease; ${code} }
        </style>
      </head>
      <body><div class="box">HELLO PIXEL — Desain Bebas!</div></body>
    </html>
  `;
  return (
    <iframe
      title="css-bonus-preview"
      srcDoc={srcDoc}
      style={{ width: '100%', minHeight: '160px', border: 'none', display: 'block', background: '#111827' }}
      sandbox="allow-scripts"
    />
  );
}

/* ===== JS Preview for bonus ===== */
function JSBonusPreview({ code, runKey }) {
  const srcDoc = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { margin: 0; padding: 12px; background: #0d0d1a; font-family: 'Courier New', monospace; font-size: 13px; color: #63f5a8; }
      .log-line { padding: 3px 0; border-bottom: 1px solid #1a1a2e; word-break: break-all; }
      .log-line.error { color: #ff667d; }
      .empty-hint { color: #555; font-style: italic; }
    </style>
  </head>
  <body>
    <div id="output">
      ${!code.trim() ? '<div class="empty-hint">&gt; Ketik kode JavaScript di sebelah kiri lalu klik JALANKAN JS...</div>' : ''}
    </div>
    <script>
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
    </script>
  </body>
</html>`;

  return (
    <iframe
      key={runKey}
      title="js-bonus-preview"
      srcDoc={srcDoc}
      style={{ minHeight: '160px', width: '100%', border: 'none', display: 'block', background: '#0d0d1a' }}
      sandbox="allow-scripts allow-modals"
    />
  );
}

/* ===== Python Preview for bonus ===== */
function PythonBonusPreview({ code, runKey }) {
  const { output, error } = runPythonCode(code);
  return (
    <div
      key={runKey}
      style={{
        padding: '14px',
        background: '#09090b',
        fontFamily: "'Courier New', monospace",
        fontSize: '11px',
        minHeight: '140px',
      }}
    >
      <div style={{ color: '#71717a', fontSize: '9px', marginBottom: '8px', letterSpacing: '0.05em' }}>
        $ python3 main.py (Live Terminal)
      </div>
      {!code.trim() && (
        <div style={{ color: '#52525b', fontStyle: 'italic', fontSize: '9px' }}>
          Ketik kode Python di sebelah kiri lalu klik JALANKAN PYTHON...
        </div>
      )}
      {output.map((line, idx) => (
        <div key={idx} style={{ color: '#4ADE80', lineHeight: 1.6, wordBreak: 'break-all' }}>
          &gt; {line}
        </div>
      ))}
      {error && (
        <div style={{ color: '#ff667d', marginTop: '6px', fontSize: '9px', lineHeight: 1.5 }}>
          {error}
        </div>
      )}
      {code.trim() && (
        <div style={{ marginTop: '10px', color: '#52525b', fontSize: '8px' }}>
          [Program dijalankan dengan sukses]
        </div>
      )}
    </div>
  );
}

/* ===== PHP Preview for bonus ===== */
function PHPBonusPreview({ code, runKey }) {
  const { output, error } = runPhpCode(code);
  return (
    <div
      key={runKey}
      style={{
        padding: '14px',
        background: '#0c0d1c',
        fontFamily: "'Courier New', monospace",
        fontSize: '11px',
        minHeight: '140px',
      }}
    >
      <div style={{ color: '#8892BF', fontSize: '9px', marginBottom: '8px', letterSpacing: '0.05em' }}>
        $ php -f index.php (Live PHP Engine)
      </div>
      {!code.trim() && (
        <div style={{ color: '#6366f1', fontStyle: 'italic', fontSize: '9px' }}>
          Ketik skrip PHP di sebelah kiri lalu klik JALANKAN PHP...
        </div>
      )}
      {output.map((line, idx) => (
        <div key={idx} style={{ color: '#A5B4FC', lineHeight: 1.6, wordBreak: 'break-all' }}>
          &gt; {line}
        </div>
      ))}
      {error && (
        <div style={{ color: '#ff667d', marginTop: '6px', fontSize: '9px', lineHeight: 1.5 }}>
          Fatal error: {error}
        </div>
      )}
      {code.trim() && (
        <div style={{ marginTop: '10px', color: '#4338ca', fontSize: '8px' }}>
          [PHP Response 200 OK]
        </div>
      )}
    </div>
  );
}

/* ===== TypeScript Preview for bonus ===== */
function TypeScriptBonusPreview({ code, runKey }) {
  const { output, typeCheck, error } = runTypeScriptCode(code);
  return (
    <div
      key={runKey}
      style={{
        padding: '14px',
        background: '#080e1a',
        fontFamily: "'Courier New', monospace",
        fontSize: '11px',
        minHeight: '140px',
      }}
    >
      <div style={{ color: '#60A5FA', fontSize: '9px', marginBottom: '6px', letterSpacing: '0.05em' }}>
        $ tsc main.ts &amp;&amp; node main.js (Live Transpiler)
      </div>
      <div style={{ color: error ? '#ff667d' : '#38bdf8', fontSize: '8px', marginBottom: '8px' }}>
        [{typeCheck}]
      </div>
      {!code.trim() && (
        <div style={{ color: '#38bdf8', fontStyle: 'italic', fontSize: '9px' }}>
          Ketik kode TypeScript di sebelah kiri lalu klik JALANKAN TS...
        </div>
      )}
      {output.map((line, idx) => (
        <div key={idx} style={{ color: '#93C5FD', lineHeight: 1.6, wordBreak: 'break-all' }}>
          &gt; {line}
        </div>
      ))}
      {error && (
        <div style={{ color: '#ff667d', marginTop: '6px', fontSize: '9px', lineHeight: 1.5 }}>
          TypeScript Error: {error}
        </div>
      )}
      {code.trim() && !error && (
        <div style={{ marginTop: '10px', color: '#1e3a8a', fontSize: '8px' }}>
          [Type check passed &amp; runtime finished]
        </div>
      )}
    </div>
  );
}

function BonusChallenge({ category, onBack, onComplete, completedLessons, soundEnabled }) {
  const textareaRef = useRef(null);
  const intro = categoryIntro[category];
  const bonusKey = `${category}-bonus`;
  const isAlreadyCompleted = completedLessons.includes(bonusKey);

  // Mulai kosong agar pengguna bisa mengetik sendiri dari awal
  const [code, setCode] = useState('');
  const [submitted, setSubmitted] = useState(isAlreadyCompleted);
  const [error, setError] = useState('');
  const [runKey, setRunKey] = useState(0);
  const [mobileTab, setMobileTab] = useState('editor'); // 'editor' | 'preview'

  const catColor = intro.color;
  const lines = code.split('\n');
  const lineCount = Math.max(lines.length, 6);

  const handleKeyDown = (e) => {
    handleEditorKeyDown(e, code, (newVal) => {
      setCode(newVal);
      setError('');
    }, category, textareaRef);
  };

  const handleSymbolClick = (sym) => {
    insertEditorSymbol(sym, code, (newVal) => {
      setCode(newVal);
      setError('');
    }, textareaRef, category);
  };

  function handleRun() {
    if (soundEnabled) soundRun();
    setRunKey((k) => k + 1);
  }

  function handleSubmit() {
    if (soundEnabled) soundRun();
    const trimmed = code.replace(/\s+/g, '').replace(/<!--.*?-->/g, '').replace(/\/\*.*?\*\//g, '');
    if (trimmed.length < 5) {
      setError('Ketik kodemu terlebih dahulu sebelum submit!');
      return;
    }
    setError('');
    if (category === 'javascript') {
      setRunKey((k) => k + 1);
    }
    if (soundEnabled) setTimeout(() => soundSuccess(), 200);
    setSubmitted(true);
    onComplete(bonusKey);
  }

  function handleReset() {
    if (soundEnabled) soundClick();
    setSubmitted(false);
    setCode('');
    setError('');
  }

  const mobileSymbols =
    category === 'html'
      ? ['<', '>', '/', '=', '"', "'", '!', '-', 'TAB']
      : category === 'css'
      ? [':', ';', '{', '}', '#', '%', 'px', 'TAB']
      : category === 'javascript'
      ? ['(', ')', '{', '}', ';', '=', '"', "'", '+', '>', 'TAB']
      : category === 'python'
      ? ['(', ')', ':', '=', '"', "'", '+', '-', '*', '#', '[', ']', 'TAB']
      : category === 'php'
      ? ['$', '(', ')', '{', '}', ';', '=', '"', "'", '.', '>', 'TAB']
      : [':', ';', '(', ')', '{', '}', '<', '>', '=', '"', '?', 'TAB'];

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
            <span className="hud-value" style={{ color: catColor, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <BrandIcon name={category} size={12} color={catColor} />
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

      {/* Hero */}
      <div className="bonus-hero" style={{ borderColor: catColor }}>
        <div className="bonus-badge" style={{ background: catColor, color: '#080C16' }}>
          ★ {intro.bonusTitle}
        </div>
        <h2 className="bonus-title">{intro.bonusTitle}</h2>
        <p className="bonus-instruction">{intro.bonusInstruction}</p>
        <p style={{ fontSize: '8px', color: 'var(--color-gray-light)', marginTop: '8px' }}>
          💡 Editor di bawah sengaja dikosongkan. Silakan berkreasi dan ketik kodemu sendiri sesuka hati!
        </p>
      </div>

      {/* Completed Banner */}
      {submitted && (
        <div className="bonus-completed-banner">
          <span style={{ fontSize: '18px' }}>🎉</span>
          <div>
            <strong>KARYA BEBAS BERHASIL DIKUMPULKAN!</strong><br />
            Hebat! Kamu telah berhasil menyelesaikan tugas bebas {category.toUpperCase()}.<br />
            <span style={{ fontSize: '7px', color: 'var(--color-gray-light)' }}>
              Kamu bisa terus mengedit dan menekan Reset jika ingin membuat karya baru.
            </span>
          </div>
          <button className="btn btn-secondary" onClick={handleReset} style={{ marginLeft: 'auto', fontSize: '8px' }}>
            RESET / BUAT BARU
          </button>
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="mobile-lesson-tabs">
        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'editor' ? 'active' : ''}`}
          onClick={() => {
            if (soundEnabled) soundClick();
            setMobileTab('editor');
          }}
          onMouseEnter={() => {
            if (soundEnabled) soundHover();
          }}
        >
          <Code2 size={13} className="tab-icon" />
          <span>EDITOR KODE</span>
          {mobileTab === 'editor' && <span className="tab-active-dot" style={{ backgroundColor: 'var(--color-blue)' }} />}
        </button>
        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'preview' ? 'active' : ''}`}
          onClick={() => {
            if (soundEnabled) soundClick();
            setMobileTab('preview');
          }}
          onMouseEnter={() => {
            if (soundEnabled) soundHover();
          }}
        >
          <Play size={13} className="tab-icon" />
          <span>LIVE PREVIEW & TIPS</span>
          {mobileTab === 'preview' && <span className="tab-active-dot" style={{ backgroundColor: 'var(--color-green)' }} />}
        </button>
      </div>

      {/* Main split */}
      <div className={`lesson-layout mobile-tab-${mobileTab}`}>
        {/* Left: Editor */}
        <div className="lesson-col-editor">
          <div className="editor-panel">
            <div className="pixel-card-inner">
              <div className="editor-header">
                <span className="editor-title">
                  {category.toUpperCase()} FREE EDITOR — {category === 'html' ? 'index.html' : category === 'css' ? 'style.css' : 'script.js'}
                </span>
                <div className="editor-dots">
                  <div className="editor-dot red" />
                  <div className="editor-dot yellow" />
                  <div className="editor-dot green" />
                </div>
              </div>

              {/* Shortcut simbol coding untuk HP */}
              <div className="mobile-symbol-bar">
                <span className="symbol-bar-label">SHORTCUT:</span>
                <div className="symbol-buttons">
                  {mobileSymbols.map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      className="symbol-btn"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSymbolClick(sym)}
                    >
                      {sym}
                    </button>
                  ))}
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
                  ref={textareaRef}
                  className="editor-textarea"
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setError(''); }}
                  onKeyDown={handleKeyDown}
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="none"
                  autoComplete="off"
                  rows={Math.max(lineCount, 6)}
                  style={{
                    color:
                      category === 'html' ? '#FF8B9A' :
                      category === 'css' ? '#4CC9F0' :
                      category === 'javascript' ? '#FFD166' :
                      '#4ADE80',
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
                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                  {(category === 'javascript' || category === 'python') && (
                    <button
                      className="btn btn-secondary"
                      onClick={handleRun}
                      style={{ fontSize: '8px', padding: '6px 12px' }}
                    >
                      ▶ JALANKAN {category === 'python' ? 'PYTHON' : 'JS'}
                    </button>
                  )}
                  {!submitted ? (
                    <button
                      className="btn-run btn"
                      onClick={handleSubmit}
                    >
                      ✓ SUBMIT TUGAS
                    </button>
                  ) : (
                    <span style={{ fontSize: '8px', color: 'var(--color-green)', alignSelf: 'center' }}>
                      ✓ TUGAS DIKUMPULKAN
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="lesson-col-preview">
          <div className="preview-panel" style={{ borderColor: catColor, boxShadow: `4px 4px 0px ${intro.colorDark}` }}>
            <div className="preview-header" style={{ background: catColor }}>
              <span className="preview-title" style={{ color: category === 'python' ? '#09090b' : undefined }}>
                LIVE PREVIEW — KARYA BEBAS
              </span>
              <span style={{ fontSize: '7px', color: category === 'python' ? '#09090b' : '#080C16' }}>
                PIXEL → REALITY
              </span>
            </div>

            {/* HTML Preview */}
            {category === 'html' && (
              <HTMLBonusPreview code={code} />
            )}

            {/* CSS Preview */}
            {category === 'css' && (
              <CSSBonusPreview code={code} />
            )}

            {/* JS Preview */}
            {category === 'javascript' && (
              <JSBonusPreview code={code} runKey={runKey} />
            )}

            {/* Python Preview */}
            {category === 'python' && (
              <PythonBonusPreview code={code} runKey={runKey} />
            )}

            {/* PHP Preview */}
            {category === 'php' && (
              <PHPBonusPreview code={code} runKey={runKey} />
            )}

            {/* TypeScript Preview */}
            {category === 'typescript' && (
              <TypeScriptBonusPreview code={code} runKey={runKey} />
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
                <li>alert() untuk popup asli browser</li>
                <li>if (kondisi) {'{ ... }'} untuk kondisi</li>
                <li>function nama() {'{ ... }'} untuk fungsi</li>
              </ul>
            )}
            {category === 'python' && (
              <ul className="bonus-tips-list">
                <li>print("teks") untuk mencetak ke terminal</li>
                <li>nama = "Budi" untuk variable tanpa let/const</li>
                <li>total = 10 + 20 untuk operasi matematika</li>
                <li>if kondisi: untuk percabangan dengan tanda titik dua :</li>
                <li>f"Halo {'{nama}'}" untuk penggabungan teks f-string modern</li>
              </ul>
            )}
            {category === 'php' && (
              <ul className="bonus-tips-list">
                <li>Gunakan tag {'<?php'} dan penutup {'?>'}</li>
                <li>$nama = "Budi" untuk membuat variable dengan $</li>
                <li>echo "teks" untuk menampilkan output</li>
                <li>Operator titik (.) untuk menyambung string</li>
                <li>if ($kondisi) {'{ ... }'} untuk percabangan</li>
              </ul>
            )}
            {category === 'typescript' && (
              <ul className="bonus-tips-list">
                <li>let nama: string = "Budi" untuk tipe data statis</li>
                <li>let angka: number[] = [1, 2, 3] untuk tipe array</li>
                <li>interface Objek {'{ prop: type }'} untuk struktur data</li>
                <li>function kali(a: number, b: number): number untuk fungsi bertipe</li>
                <li>enum Arah {'{ Atas, Bawah }'} untuk daftar konstanta</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BonusChallenge;
