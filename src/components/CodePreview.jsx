import React from 'react';
import { runPythonCode } from '../utils/pythonRunner';
import { runPhpCode } from '../utils/phpRunner';
import { runTypeScriptCode } from '../utils/typescriptRunner';
import { runJavaCode } from '../utils/javaRunner';
import { runCppCode } from '../utils/cppRunner';
import { runGoCode } from '../utils/goRunner';
import { runSqlCode } from '../utils/sqlRunner';
import { categoryInfo } from '../data/lessons';

const TERMINAL_COMMANDS = {
  typescript: 'tsc main.ts && node main.js',
  python: 'python3 main.py',
  php: 'php -f index.php',
  java: 'javac Main.java && java Main',
  cpp: 'g++ main.cpp -o main && ./main',
  go: 'go run main.go',
  sql: 'sqlite3 latihan.db < query.sql',
};

function HtmlFrame({ code, emptyHint }) {
  const trimmed = code.trim();
  const isFullDoc = trimmed.toLowerCase().includes('<!doctype') || trimmed.toLowerCase().includes('<html');
  const srcDoc = isFullDoc
    ? trimmed
    : `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>
      body {
        margin: 16px;
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        font-size: 15px;
        line-height: 1.5;
        color: #0f172a;
        background: #ffffff;
      }
      h1 { font-size: 1.85em; margin: 0 0 0.35em; }
      h2 { font-size: 1.4em; margin: 0 0 0.35em; }
      p { margin: 0.35em 0; }
      button {
        padding: 7px 14px;
        border-radius: 6px;
        border: 1px solid #0284c7;
        background: #0284c7;
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
      }
      input {
        padding: 7px 10px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 14px;
      }
      a { color: #0284c7; }
      ul, ol { padding-left: 20px; margin: 0.4em 0; }
      img { max-width: 100%; border-radius: 6px; }
    </style>
  </head>
  <body>${trimmed || `<p style="color:#64748b;font-size:14px;">${emptyHint}</p>`}</body>
</html>`;

  return (
    <iframe
      title="html-preview"
      srcDoc={srcDoc}
      className="preview-iframe"
      style={{ background: '#ffffff', minHeight: '150px' }}
      sandbox="allow-scripts"
    />
  );
}

function CssFrame({ code, previewLabel }) {
  const srcDoc = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>
      body {
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 150px;
        padding: 16px;
        background: #0f172a;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      }
      .preview-box {
        font-size: 16px;
        font-weight: 600;
        padding: 14px 22px;
        border: 1px solid #334155;
        border-radius: 8px;
        color: #f8fafc;
        background: #1e293b;
        ${code}
      }
    </style>
  </head>
  <body>
    <div class="preview-box">${previewLabel || 'Pratinjau Elemen CSS'}</div>
  </body>
</html>`;

  return (
    <iframe
      title="css-preview"
      srcDoc={srcDoc}
      className="preview-iframe"
      style={{ background: '#0f172a', minHeight: '150px' }}
      sandbox="allow-scripts"
    />
  );
}

function JsFrame({ code, runKey }) {
  const srcDoc = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>
      body {
        margin: 0;
        padding: 14px 16px;
        background: #090d14;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 13px;
        line-height: 1.6;
        color: #86efac;
      }
      .log-line {
        padding: 2px 0;
        word-break: break-word;
      }
      .log-line.error {
        color: #fca5a5;
      }
      .empty-hint {
        color: #94a3b8;
        font-family: system-ui, sans-serif;
      }
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
        line.textContent = '> ' + args.map(function(a) {
          return typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a);
        }).join(' ');
        out.appendChild(line);
        origLog.apply(console, args);
      };
      window.onerror = function(msg) {
        var errLine = document.createElement('div');
        errLine.className = 'log-line error';
        errLine.textContent = 'Error: ' + msg;
        out.appendChild(errLine);
        return true;
      };
    </script>
    <script>
      try {
        ${code}
        if (out.children.length === 0) {
          var hint = document.createElement('div');
          hint.className = 'empty-hint';
          hint.textContent = 'Kode dieksekusi tanpa output console.log().';
          out.appendChild(hint);
        }
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
      style={{ background: '#090d14', minHeight: '130px' }}
      sandbox="allow-scripts allow-modals"
    />
  );
}

function SqlResultView({ code }) {
  const { columns, rows, message, error } = runSqlCode(code);

  if (error) {
    return (
      <div className="terminal-output">
        <div className="terminal-error">SQL Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="sql-table-wrap">
      {columns.length > 0 && (
        <table className="sql-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  (0 baris hasil query)
                </td>
              </tr>
            ) : (
              rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((col) => (
                    <td key={col}>{row[col] === null || row[col] === undefined ? 'NULL' : String(row[col])}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
      {message && <div className="sql-table-message">{message}</div>}
    </div>
  );
}

function TerminalResultView({ category, code }) {
  let result = { output: [], error: null };
  let typeNote = null;

  if (category === 'python') {
    result = runPythonCode(code);
  } else if (category === 'php') {
    result = runPhpCode(code);
  } else if (category === 'typescript') {
    result = runTypeScriptCode(code);
    typeNote = result.typeCheck;
  } else if (category === 'java') {
    result = runJavaCode(code);
  } else if (category === 'cpp') {
    result = runCppCode(code);
  } else if (category === 'go') {
    result = runGoCode(code);
  }

  return (
    <div className="terminal-output">
      <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>
        $ {TERMINAL_COMMANDS[category] || category}
      </div>
      {typeNote && (
        <div
          style={{
            color: result.error ? '#fca5a5' : '#7dd3fc',
            fontSize: '12px',
            marginBottom: '8px',
          }}
        >
          [{typeNote}]
        </div>
      )}
      {result.output.length === 0 && !result.error && (
        <div className="terminal-placeholder">Program selesai dijalankan tanpa output.</div>
      )}
      {result.output.map((line, idx) => (
        <div key={idx} className="terminal-line">
          &gt; {line}
        </div>
      ))}
      {result.error && (
        <div className="terminal-error">Error: {result.error}</div>
      )}
    </div>
  );
}

export function CodePreview({
  category,
  code,
  runKey = 0,
  hasRun = true,
  previewLabel = '',
  alwaysShowHtml = false,
}) {
  const info = categoryInfo[category] || categoryInfo.html;
  const trimmed = code.trim();

  if (category === 'html') {
    if (!alwaysShowHtml && !trimmed) return null;
    return (
      <div className="preview-panel">
        <div className="preview-header">
          <span className="preview-title">Pratinjau {info.label}</span>
          <span className="preview-status ok">Live DOM</span>
        </div>
        <HtmlFrame code={code} emptyHint="Ketik kode HTML di editor untuk melihat hasil tampilan di sini." />
      </div>
    );
  }

  if (category === 'css') {
    return (
      <div className="preview-panel">
        <div className="preview-header">
          <span className="preview-title">Pratinjau {info.label}</span>
          <span className="preview-status ok">Live Style</span>
        </div>
        <CssFrame code={code} previewLabel={previewLabel} />
      </div>
    );
  }

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <span className="preview-title">
          {category === 'sql' ? 'Hasil Query SQL' : `Output ${info.label}`}
        </span>
        <span className={`preview-status ${hasRun ? 'ok' : ''}`}>
          {hasRun ? 'Dijalankan' : 'Siap dijalankan'}
        </span>
      </div>

      {!hasRun ? (
        <div className="terminal-output">
          <div className="terminal-placeholder">
            Tekan tombol <strong>Jalankan</strong> untuk mengeksekusi kode {info.label} dan melihat hasilnya di sini.
          </div>
        </div>
      ) : category === 'javascript' ? (
        <JsFrame code={code} runKey={runKey} />
      ) : category === 'sql' ? (
        <SqlResultView key={runKey} code={code} />
      ) : (
        <TerminalResultView key={runKey} category={category} code={code} />
      )}
    </div>
  );
}

export default CodePreview;
