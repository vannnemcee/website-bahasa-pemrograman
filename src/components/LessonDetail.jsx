import React, { useState } from 'react';
import { lessons, categoryInfo } from '../data/lessons';
import CodeEditor from './CodeEditor';
import ResultModal from './ResultModal';
import BrandIcon from './BrandIcon';
import { soundRun, soundSuccess, soundError, soundHint, soundBack, soundClick, soundHover } from '../utils/sounds';
import { runPythonCode } from '../utils/pythonRunner';
import { runPhpCode } from '../utils/phpRunner';
import { runTypeScriptCode } from '../utils/typescriptRunner';
import { BookOpen, Code2 } from 'lucide-react';

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

  if (checkType === 'html-input') {
    const { type, placeholder } = checkConfig;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, 'text/html');
      const input = doc.querySelector('input');
      if (!input) return false;
      const typeMatch = !type || (input.getAttribute('type') || 'text').toLowerCase() === type.toLowerCase();
      const phMatch = !placeholder || (input.getAttribute('placeholder') || '').toLowerCase().includes(placeholder.toLowerCase());
      return typeMatch && phMatch;
    } catch {
      return false;
    }
  }

  if (checkType === 'html-list') {
    const { parent, child, text } = checkConfig;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, 'text/html');
      const p = doc.querySelector(parent || 'ul');
      if (!p) return false;
      const c = p.querySelector(child || 'li');
      if (!c) return false;
      if (text) {
        return c.textContent.trim().toLowerCase().includes(text.toLowerCase());
      }
      return true;
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

    // Periksa loop for (termasuk toleransi jika pengguna typo angka 1 menggantikan huruf i, seperti: let 1 = 0)
    if (normPat.includes('for(')) {
      const fixedNorm = norm.replace(/for\(let1=0/g, 'for(leti=0').replace(/for\(1=0/g, 'for(i=0');
      const hasForLoop = (fixedNorm.includes('leti=0') || fixedNorm.includes('i=0')) &&
                         (fixedNorm.includes('i<5') || fixedNorm.includes('i<=4')) &&
                         (fixedNorm.includes('i++') || fixedNorm.includes('++i') || fixedNorm.includes('i+=1'));
      const hasLog = fixedNorm.includes('console.log(i)');
      if (hasForLoop && hasLog) return true;
    }

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
    if (normPat.includes('nama="budi"')) {
      return norm.includes('nama="budi"') || norm.includes("nama='budi'");
    }

    return false;
  }

  if (checkType === 'python-pattern') {
    const { pattern } = checkConfig;
    const norm = normalizeCode(code);
    const normPat = normalizeCode(pattern);
    if (norm.includes(normPat)) return true;

    if (normPat.includes('print("helloworld")') && norm.includes('print("helloworld")')) return true;
    if (normPat.includes('print(2026)') && norm.includes('print(2026)')) return true;
    if (normPat.includes('nama="budi"') && (norm.includes('nama="budi"') || norm.includes("nama='budi'"))) return true;
    if (normPat.includes('hasil=10+5') && (norm.includes('hasil=10+5') || norm.includes('hasil=15'))) return true;
    if (normPat.includes('print(nama)') && norm.includes('print(nama)')) return true;
    if (normPat.includes('10>5') && norm.includes('print("benar")')) return true;
    if (normPat.includes('buah=') && norm.includes('buah=[') && norm.includes('"apel"') && norm.includes('"jeruk"')) return true;
    if (normPat.includes('range(5)') && norm.includes('print(i)')) return true;
    if (normPat.includes('defsapa') && norm.includes('defsapa()') && norm.includes('print("halo!")')) return true;
    if (normPat.includes('f"halo') && norm.includes('{nama}')) return true;

    return false;
  }

  if (checkType === 'php-pattern') {
    const { pattern } = checkConfig;
    const cleanCode = code.replace(/<\?(?:php)?/gi, '').replace(/\?>/gi, '');
    const cleanPat = pattern.replace(/<\?(?:php)?/gi, '').replace(/\?>/gi, '');
    const norm = normalizeCode(cleanCode);
    const normPat = normalizeCode(cleanPat);

    if (norm.includes(normPat)) return true;

    if (normPat.includes('echo"halodunia!"') && (norm.includes('echo"halodunia!"') || norm.includes("echo'halodunia!'"))) return true;
    if (normPat.includes('belajarphp') && norm.includes('belajarphp')) return true;
    if (normPat.includes('$nama="budi"') && (norm.includes('$nama="budi"') || norm.includes("$nama='budi'"))) return true;
    if (normPat.includes('echo$nama') && norm.includes('echo$nama')) return true;
    if (normPat.includes('10+5') && norm.includes('echo$hasil')) return true;
    if (normPat.includes('echo"halo".$nama') || normPat.includes('echo"halo"')) {
      return norm.includes('echo"halo".$nama') || norm.includes("echo'halo'.$nama") || norm.includes('echo"halo"');
    }
    if (normPat.includes('if($nilai>=75)') && norm.includes('echo"lulus"')) return true;
    if (normPat.includes('$buah=') && norm.includes('"apel"') && norm.includes('"jeruk"')) return true;
    if (normPat.includes('foreach($buahas$item)') && norm.includes('echo$item')) return true;
    if (normPat.includes('functionsapa') && norm.includes('return"halo".$nama')) return true;

    return false;
  }

  if (checkType === 'ts-pattern') {
    const { pattern } = checkConfig;
    const norm = normalizeCode(code);
    const normPat = normalizeCode(pattern);

    if (norm.includes(normPat)) return true;

    if (normPat.includes('pesan:string') && norm.includes('pesan:string') && norm.includes('halotypescript')) return true;
    if (normPat.includes('tahun:number') && norm.includes('tahun:number') && norm.includes('2026')) return true;
    if (normPat.includes('aktif:boolean') && norm.includes('aktif:boolean') && norm.includes('true')) return true;
    if (normPat.includes('angka:number[]') && norm.includes('angka:number[]') && norm.includes('[1,2,3]')) return true;
    if (normPat.includes('functionkali') && norm.includes('returna*b')) return true;
    if (normPat.includes('interfaceuser') && norm.includes('id:number') && norm.includes('nama:string')) return true;
    if (normPat.includes('typestatus') && norm.includes('sukses') && norm.includes('gagal')) return true;
    if (normPat.includes('interfacesiswa') && norm.includes('nama:string') && norm.includes('umur?:number')) return true;
    if (normPat.includes('identitas<t>') && norm.includes('returnarg')) return true;
    if (normPat.includes('enumarah') && norm.includes('atas="atas"') && norm.includes('bawah="bawah"')) return true;

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
  // Wrap kode JS user di dalam HTML dengan console.log redirect ke UI & tangkap parse error
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

      // Tangkap parse-time SyntaxError (misal typo: let 1 = 0)
      window.onerror = function(msg, url, lineNo) {
        var errLine = document.createElement('div');
        errLine.className = 'log-line error';
        var text = 'Error: ' + msg;
        if (msg && msg.toLowerCase().indexOf('unexpected number') !== -1) {
          text += ' (Tips: periksa penulisan variabel, gunakan huruf "i", bukan angka "1")';
        }
        errLine.textContent = text;
        out.appendChild(errLine);
        return true;
      };
    </script>
    <script>
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
      title="js-preview"
      srcDoc={srcDoc}
      className="preview-iframe"
      style={{ minHeight: '120px', width: '100%', border: 'none', display: 'block', background: '#0d0d1a' }}
      sandbox="allow-scripts allow-modals"
    />
  );
}

/* ========= PYTHON PREVIEW — In-Browser Simulator ========= */
function PythonPreview({ code, runKey, hasRun }) {
  if (!hasRun) {
    return (
      <div style={{ padding: '16px', background: '#09090b', minHeight: '80px', display: 'flex', alignItems: 'center' }}>
        <p style={{ fontSize: '8px', color: 'var(--color-gray-light)', lineHeight: 2.2, margin: 0 }}>
          ▶ Klik tombol <strong style={{ color: '#4ADE80' }}>RUN</strong> untuk mengeksekusi kode Python!<br />
          • <code style={{ color: '#4ADE80' }}>print(...)</code> → output langsung tampil di terminal<br />
          • <code style={{ color: '#FACC15' }}>nama = "Budi"</code> → simpan variable dinamis
        </p>
      </div>
    );
  }

  const { output, error } = runPythonCode(code);

  return (
    <div
      key={runKey}
      style={{
        padding: '12px 14px',
        background: '#09090b',
        fontFamily: "'Courier New', monospace",
        fontSize: '11px',
        minHeight: '90px',
      }}
    >
      <div style={{ color: '#71717a', fontSize: '9px', marginBottom: '8px', letterSpacing: '0.05em' }}>
        $ python3 main.py
      </div>
      {output.length === 0 && !error && (
        <div style={{ color: '#71717a', fontStyle: 'italic', fontSize: '9px' }}>
          (Program selesai dijalankan tanpa output)
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
      <div style={{ marginTop: '10px', color: '#52525b', fontSize: '8px' }}>
        [Proses selesai dengan kode keluar 0]
      </div>
    </div>
  );
}

/* ========= PHP PREVIEW — In-Browser Simulator ========= */
function PHPPreview({ code, runKey, hasRun }) {
  if (!hasRun) {
    return (
      <div style={{ padding: '16px', background: '#0c0d1c', minHeight: '80px', display: 'flex', alignItems: 'center' }}>
        <p style={{ fontSize: '8px', color: 'var(--color-gray-light)', lineHeight: 2.2, margin: 0 }}>
          ▶ Klik tombol <strong style={{ color: '#8892BF' }}>RUN</strong> untuk menjalankan skrip PHP!<br />
          • <code style={{ color: '#8892BF' }}>echo ...</code> → cetak respons ke browser/terminal<br />
          • <code style={{ color: '#A5B4FC' }}>$nama = "Budi"</code> → variabel server-side
        </p>
      </div>
    );
  }

  const { output, error } = runPhpCode(code);

  return (
    <div
      key={runKey}
      style={{
        padding: '12px 14px',
        background: '#0c0d1c',
        fontFamily: "'Courier New', monospace",
        fontSize: '11px',
        minHeight: '90px',
      }}
    >
      <div style={{ color: '#8892BF', fontSize: '9px', marginBottom: '8px', letterSpacing: '0.05em' }}>
        $ php -f index.php
      </div>
      {output.length === 0 && !error && (
        <div style={{ color: '#71717a', fontStyle: 'italic', fontSize: '9px' }}>
          (Skrip PHP selesai tanpa output)
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
      <div style={{ marginTop: '10px', color: '#4338ca', fontSize: '8px' }}>
        [PHP Engine: Response HTTP 200 OK]
      </div>
    </div>
  );
}

/* ========= TYPESCRIPT PREVIEW — In-Browser Simulator ========= */
function TypeScriptPreview({ code, runKey, hasRun }) {
  if (!hasRun) {
    return (
      <div style={{ padding: '16px', background: '#080e1a', minHeight: '80px', display: 'flex', alignItems: 'center' }}>
        <p style={{ fontSize: '8px', color: 'var(--color-gray-light)', lineHeight: 2.2, margin: 0 }}>
          ▶ Klik tombol <strong style={{ color: '#3178C6' }}>RUN</strong> untuk kompilasi & eksekusi TypeScript!<br />
          • <code style={{ color: '#3178C6' }}>let x: number</code> → static type checking<br />
          • <code style={{ color: '#60A5FA' }}>console.log(...)</code> → output runtime
        </p>
      </div>
    );
  }

  const { output, typeCheck, error } = runTypeScriptCode(code);

  return (
    <div
      key={runKey}
      style={{
        padding: '12px 14px',
        background: '#080e1a',
        fontFamily: "'Courier New', monospace",
        fontSize: '11px',
        minHeight: '90px',
      }}
    >
      <div style={{ color: '#60A5FA', fontSize: '9px', marginBottom: '6px', letterSpacing: '0.05em' }}>
        $ tsc main.ts &amp;&amp; node main.js
      </div>
      <div style={{ color: error ? '#ff667d' : '#38bdf8', fontSize: '8px', marginBottom: '8px' }}>
        [{typeCheck}]
      </div>
      {output.length === 0 && !error && (
        <div style={{ color: '#71717a', fontStyle: 'italic', fontSize: '9px' }}>
          (Program selesai dijalankan tanpa output)
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
      <div style={{ marginTop: '10px', color: '#1e3a8a', fontSize: '8px' }}>
        [Compiler: Transpiled Cleanly]
      </div>
    </div>
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
  const [prevLessonId, setPrevLessonId] = useState(lesson.id);

  if (lesson.id !== prevLessonId) {
    setPrevLessonId(lesson.id);
    setCode(lesson.starterCode || '');
    setResult(null);
    setShowHint(false);
    setMobileTab('quest');
    setHasRun(false);
  }

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
    python: '#4ADE80',
    php: '#8892BF',
    typescript: '#3178C6',
  };
  const catColor = catColorMap[category] || '#4CC9F0';

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

        {/* Compact info pill for mobile */}
        <div className="mobile-hud-badge">
          <BrandIcon name={category} size={12} color={catColor} style={{ marginRight: '4px' }} />
          <span className="mobile-hud-cat" style={{ color: catColor }}>{info.label}</span>
          <span className="mobile-hud-sep">//</span>
          <span className="mobile-hud-num">Q{String(currentIndex + 1).padStart(2, '0')}</span>
          <span className={`mobile-hud-status-dot ${isCleared ? 'cleared' : 'learning'}`} title={isCleared ? 'Cleared' : 'Learning'} />
        </div>

        <div className="quest-hud">
          <div className="hud-item">
            <span className="hud-label">LEVEL</span>
            <span className="hud-value" style={{ color: catColor, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <BrandIcon name={category} size={12} color={catColor} />
              {info.label}
            </span>
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

      {/* Mobile Tab Switcher untuk mempermudah layar sentuh / HP / viewport responsif */}
      <div className="mobile-lesson-tabs" style={{ '--cat-accent': catColor }}>
        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'quest' ? 'active' : ''}`}
          onClick={() => {
            if (soundEnabled) soundClick();
            setMobileTab('quest');
          }}
          onMouseEnter={() => {
            if (soundEnabled) soundHover();
          }}
        >
          <BookOpen size={13} className="tab-icon" />
          <span>MATERI & SOAL</span>
          {mobileTab === 'quest' && <span className="tab-active-dot" style={{ backgroundColor: catColor }} />}
        </button>
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
          <span>KODING & PREVIEW</span>
          {mobileTab === 'editor' && <span className="tab-active-dot" style={{ backgroundColor: catColor }} />}
        </button>
      </div>

      <div className={`lesson-layout mobile-tab-${mobileTab}`}>
        {/* LEFT: Quest Panel */}
        <div className="lesson-col-quest">
          <div className="quest-panel">
            <div className="quest-panel-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BrandIcon name={category} size={15} color={catColor} />
                {info.label} QUEST {String(currentIndex + 1).padStart(2, '0')}
              </h2>
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

          {category === 'python' && (
            <div className="preview-panel" style={{ marginTop: '16px' }}>
              <div className="preview-header" style={{ background: 'var(--color-green)' }}>
                <span className="preview-title" style={{ color: '#09090b' }}>
                  PYTHON TERMINAL — {hasRun ? 'EXECUTED ✓' : 'TEKAN ▶ RUN'}
                </span>
                <span style={{ fontSize: '7px', color: '#09090b' }}>PIXEL → REALITY</span>
              </div>
              <PythonPreview code={code} runKey={runKey} hasRun={hasRun} />
            </div>
          )}

          {category === 'php' && (
            <div className="preview-panel" style={{ marginTop: '16px' }}>
              <div className="preview-header" style={{ background: '#8892BF' }}>
                <span className="preview-title" style={{ color: '#ffffff' }}>
                  PHP SERVER — {hasRun ? 'EXECUTED ✓' : 'TEKAN ▶ RUN'}
                </span>
                <span style={{ fontSize: '7px', color: '#ffffff' }}>PIXEL → REALITY</span>
              </div>
              <PHPPreview code={code} runKey={runKey} hasRun={hasRun} />
            </div>
          )}

          {category === 'typescript' && (
            <div className="preview-panel" style={{ marginTop: '16px' }}>
              <div className="preview-header" style={{ background: '#3178C6' }}>
                <span className="preview-title" style={{ color: '#ffffff' }}>
                  TS COMPILER &amp; RUNTIME — {hasRun ? 'EXECUTED ✓' : 'TEKAN ▶ RUN'}
                </span>
                <span style={{ fontSize: '7px', color: '#ffffff' }}>PIXEL → REALITY</span>
              </div>
              <TypeScriptPreview code={code} runKey={runKey} hasRun={hasRun} />
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
