import React, { useState, useMemo } from 'react';

function CodeEditor({ value, onChange, category, language }) {
  const lines = value.split('\n');
  const lineCount = Math.max(lines.length, 5);

  const placeholder =
    category === 'html'
      ? '<!-- Ketik kode HTML kamu di sini -->'
      : category === 'css'
      ? '/* Ketik property CSS di sini */'
      : '// Ketik kode JavaScript di sini';

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newVal = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newVal);
      setTimeout(() => {
        e.target.selectionStart = start + 2;
        e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const syntaxColor =
    category === 'html'
      ? '#FF8B9A'
      : category === 'css'
      ? '#4CC9F0'
      : '#FFD166';

  return (
    <div className="editor-body">
      <div className="editor-line-numbers">
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="line-number">{i + 1}</div>
        ))}
      </div>
      <textarea
        className="editor-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        style={{ color: syntaxColor }}
        rows={Math.max(lineCount, 5)}
      />
    </div>
  );
}

export default CodeEditor;
