import React, { useRef } from 'react';

function CodeEditor({ value, onChange, category }) {
  const textareaRef = useRef(null);
  const lines = value.split('\n');
  const lineCount = Math.max(lines.length, 5);

  const placeholder =
    category === 'html'
      ? '<!-- Ketik kode HTML kamu di sini -->'
      : category === 'css'
      ? '/* Ketik property CSS di sini */'
      : category === 'javascript'
      ? '// Ketik kode JavaScript di sini'
      : '# Ketik kode Python kamu di sini';

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      insertText('  ');
    }
  };

  const insertText = (str) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const newVal = value.substring(0, start) + str + value.substring(end);
    onChange(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + str.length;
      textarea.selectionEnd = start + str.length;
    }, 0);
  };

  const syntaxColor =
    category === 'html'
      ? '#FF8B9A'
      : category === 'css'
      ? '#4CC9F0'
      : category === 'javascript'
      ? '#FFD166'
      : '#4ADE80';

  // Karakter penting untuk koding yang sulit diakses di keyboard HP
  const mobileSymbols =
    category === 'html'
      ? ['<', '>', '/', '=', '"', "'", '!', '-', 'TAB']
      : category === 'css'
      ? [':', ';', '{', '}', '#', '%', 'px', 'TAB']
      : category === 'javascript'
      ? ['(', ')', '{', '}', ';', '=', '"', "'", '+', '>', 'TAB']
      : ['(', ')', ':', '=', '"', "'", '+', '-', '*', '#', '[', ']', 'TAB'];

  return (
    <div className="editor-wrapper">
      {/* Quick Toolbar untuk HP / Tablet */}
      <div className="mobile-symbol-bar">
        <span className="symbol-bar-label">SHORTCUT:</span>
        <div className="symbol-buttons">
          {mobileSymbols.map((sym) => (
            <button
              key={sym}
              type="button"
              className="symbol-btn"
              onClick={() => insertText(sym === 'TAB' ? '  ' : sym)}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      <div className="editor-body">
        <div className="editor-line-numbers">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="line-number">{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="none"
          autoComplete="off"
          style={{ color: syntaxColor }}
          rows={Math.max(lineCount, 5)}
        />
      </div>
    </div>
  );
}

export default CodeEditor;
