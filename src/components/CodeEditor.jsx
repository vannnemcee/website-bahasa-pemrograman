import React, { useRef } from 'react';
import { handleEditorKeyDown, insertEditorSymbol } from '../utils/editorHelper';
import { soundTyping } from '../utils/sounds';

const IGNORED_KEYS = new Set([
  'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Home', 'End', 'PageUp', 'PageDown', 'Insert',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
]);

function CodeEditor({ value, onChange, category, soundEnabled = true }) {
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
      : category === 'python'
      ? '# Ketik kode Python kamu di sini'
      : category === 'php'
      ? '<?php // Ketik kode PHP kamu di sini ?>'
      : '// Ketik kode TypeScript kamu di sini';

  const handleKeyDown = (e) => {
    if (!IGNORED_KEYS.has(e.key)) {
      if (soundEnabled) {
        soundTyping(e.key);
      }
    }
    handleEditorKeyDown(e, value, onChange, category, textareaRef);
  };

  const handleSymbolClick = (sym) => {
    if (soundEnabled) {
      soundTyping(sym);
    }
    insertEditorSymbol(sym, value, onChange, textareaRef, category);
  };

  const handleChange = (e) => {
    const nextVal = e.target.value;
    if (soundEnabled && nextVal !== value) {
      soundTyping();
    }
    onChange(nextVal);
  };

  const syntaxColor =
    category === 'html'
      ? '#FF8B9A'
      : category === 'css'
      ? '#4CC9F0'
      : category === 'javascript'
      ? '#FFD166'
      : category === 'python'
      ? '#4ADE80'
      : category === 'php'
      ? '#8892BF'
      : '#3178C6';

  // Karakter penting untuk koding yang sulit diakses di keyboard HP
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
          onChange={handleChange}
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
