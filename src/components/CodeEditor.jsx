import React, { useRef } from 'react';
import { handleEditorKeyDown, insertEditorSymbol } from '../utils/editorHelper';
import { soundTyping } from '../utils/sounds';

const IGNORED_KEYS = new Set([
  'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Home', 'End', 'PageUp', 'PageDown', 'Insert',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
]);

const PLACEHOLDERS = {
  html: '<!-- Ketik kode HTML di sini -->',
  css: '/* Ketik properti CSS di sini */',
  javascript: '// Ketik kode JavaScript di sini',
  typescript: '// Ketik kode TypeScript di sini',
  python: '# Ketik kode Python di sini',
  php: '<?php // Ketik kode PHP di sini ?>',
  java: '// Ketik kode Java di sini',
  cpp: '// Ketik kode C++ di sini',
  go: '// Ketik kode Go di sini',
  sql: '-- Ketik query SQL di sini',
};

const SYMBOLS_BY_LANG = {
  html: ['<', '>', '/', '=', '"', "'", '!', '-', 'TAB'],
  css: [':', ';', '{', '}', '#', '%', 'px', 'TAB'],
  javascript: ['(', ')', '{', '}', ';', '=', '"', "'", '+', '>', 'TAB'],
  typescript: [':', ';', '(', ')', '{', '}', '<', '>', '=', '"', '?', 'TAB'],
  python: ['(', ')', ':', '=', '"', "'", '+', '-', '*', '#', '[', ']', 'TAB'],
  php: ['$', '(', ')', '{', '}', ';', '=', '"', "'", '.', '>', 'TAB'],
  java: ['(', ')', '{', '}', ';', '=', '"', '[', ']', '.', 'TAB'],
  cpp: ['#', '<', '>', '(', ')', '{', '}', ';', '=', '"', '&', 'TAB'],
  go: [':=', '(', ')', '{', '}', '"', '[', ']', '=', '.', 'TAB'],
  sql: ['*', '=', "'", '(', ')', ',', ';', '>=', '<=', 'LIKE', 'TAB'],
};

function CodeEditor({
  value,
  onChange,
  category,
  soundEnabled = true,
  placeholder,
  disabled = false,
  minRows = 7,
}) {
  const textareaRef = useRef(null);
  const lastKeyDownRef = useRef(0);
  const lines = value.split('\n');
  const lineCount = Math.max(lines.length, minRows);

  const symbols = SYMBOLS_BY_LANG[category] || SYMBOLS_BY_LANG.javascript;
  const effectivePlaceholder = placeholder || PLACEHOLDERS[category] || '// Ketik kode di sini';

  const handleKeyDown = (e) => {
    if (!IGNORED_KEYS.has(e.key) && e.key !== 'Unidentified' && soundEnabled) {
      lastKeyDownRef.current = performance.now();
      soundTyping(e.key);
    }
    handleEditorKeyDown(e, value, onChange, category, textareaRef);
  };

  const handleSymbolClick = (sym) => {
    if (disabled) return;
    if (soundEnabled) {
      soundTyping(sym);
    }
    insertEditorSymbol(sym, value, onChange, textareaRef, category);
  };

  const handleChange = (e) => {
    const nextVal = e.target.value;
    if (soundEnabled && nextVal !== value) {
      if (performance.now() - lastKeyDownRef.current > 40) {
        soundTyping();
      }
    }
    onChange(nextVal);
  };

  return (
    <div className="editor-wrapper">
      <div className="mobile-symbol-bar" role="toolbar" aria-label="Pintasan simbol kode">
        {symbols.map((sym) => (
          <button
            key={sym}
            type="button"
            className="symbol-btn"
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleSymbolClick(sym)}
          >
            {sym}
          </button>
        ))}
      </div>

      <div className="editor-body">
        <div className="editor-line-numbers" aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="line-number">
              {i + 1}
            </div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={effectivePlaceholder}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="none"
          autoComplete="off"
          disabled={disabled}
          rows={lineCount}
          aria-label={`Editor kode ${category}`}
        />
      </div>
    </div>
  );
}

export default CodeEditor;
