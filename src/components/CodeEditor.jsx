import React, { useRef } from 'react';
import { handleEditorKeyDown, insertEditorSymbol } from '../utils/editorHelper';

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
    handleEditorKeyDown(e, value, onChange, category, textareaRef);
  };

  const handleSymbolClick = (sym) => {
    insertEditorSymbol(sym, value, onChange, textareaRef, category);
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
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSymbolClick(sym)}
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
