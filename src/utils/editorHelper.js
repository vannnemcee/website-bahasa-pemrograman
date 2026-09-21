/**
 * editorHelper.js
 * Utilitas cerdas untuk text editor koding (HTML, CSS, JS, Python):
 * - Auto-indentation saat tombol Enter ditekan (khususnya setelah '{' atau ':')
 * - Auto-closing & skipping kurung kurawal '{}', tanda kurung '()', kurung siku '[]', tanda kutip
 * - Auto-closing tag HTML (misal ketik <h2> langsung jadi <h2></h2> dengan kursor di tengah)
 * - Auto-complete tag penutup saat ketik '</'
 * - Smart backspace untuk menghapus pasangan kurung
 * - Penanganan tombol shortcut mobile tanpa kehilangan fokus
 */

// Tag HTML yang tidak memerlukan tag penutup (void elements)
const VOID_HTML_TAGS = new Set([
  'img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'
]);

/**
 * Mencari tag HTML pembuka terakhir yang belum ditutup sebelum posisi kursor
 */
function findLastUnclosedTag(text) {
  const tagRegex = /<\/?([a-zA-Z0-9]+)(?:\s+[^>]*)?(\/?)>/g;
  const stack = [];
  let match;

  while ((match = tagRegex.exec(text)) !== null) {
    const isClosing = match[0].startsWith('</');
    const isSelfClosing = match[2] === '/' || VOID_HTML_TAGS.has(match[1].toLowerCase());
    const tagName = match[1].toLowerCase();

    if (isSelfClosing) continue;

    if (isClosing) {
      if (stack.length > 0 && stack[stack.length - 1] === tagName) {
        stack.pop();
      }
    } else {
      stack.push(tagName);
    }
  }

  return stack.length > 0 ? stack[stack.length - 1] : null;
}

/**
 * Handler utama untuk keydown pada editor
 */
export function handleEditorKeyDown(e, value, onChange, category, textareaRef) {
  const textarea = textareaRef.current;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = value.substring(0, start);
  const after = value.substring(end);
  const indentUnit = category === 'python' ? '    ' : '  ';

  // 1. TOMBOL TAB: Indentasi spasi
  if (e.key === 'Tab') {
    e.preventDefault();
    if (e.shiftKey) {
      // Shift+Tab: kurangi indentasi baris saat ini
      const lastNl = before.lastIndexOf('\n');
      const lineStart = lastNl === -1 ? 0 : lastNl + 1;
      const currentLine = value.substring(lineStart, end);
      if (currentLine.startsWith('  ')) {
        const newVal = value.substring(0, lineStart) + currentLine.slice(2);
        onChange(newVal);
        setTimeout(() => {
          textarea.selectionStart = Math.max(lineStart, start - 2);
          textarea.selectionEnd = Math.max(lineStart, end - 2);
        }, 0);
      }
    } else {
      const newVal = before + indentUnit + after;
      onChange(newVal);
      setTimeout(() => {
        textarea.selectionStart = start + indentUnit.length;
        textarea.selectionEnd = start + indentUnit.length;
      }, 0);
    }
    return;
  }

  // 2. TOMBOL ENTER: Auto-indentation sesuai kurung kurawal atau indentasi baris sebelumnya
  if (e.key === 'Enter') {
    e.preventDefault();
    const lastNl = before.lastIndexOf('\n');
    const currentLine = lastNl === -1 ? before : before.substring(lastNl + 1);
    const indentMatch = currentLine.match(/^(\s*)/);
    const currentIndent = indentMatch ? indentMatch[1] : '';

    const charBefore = before.trimEnd().slice(-1);
    const immediateBefore = before.slice(-1);
    const immediateAfter = after.charAt(0);

    // Kasus A: Kursor berada tepat di antara '{' dan '}'
    // Contoh: if (5 > 3) {|} -> tekan Enter
    // Hasil:
    // if (5 > 3) {
    //   |
    // }
    if (immediateBefore === '{' && immediateAfter === '}') {
      const newIndent = currentIndent + indentUnit;
      const insert = '\n' + newIndent + '\n' + currentIndent;
      const newVal = before + insert + after;
      onChange(newVal);
      setTimeout(() => {
        const cursorPos = start + 1 + newIndent.length;
        textarea.selectionStart = cursorPos;
        textarea.selectionEnd = cursorPos;
      }, 0);
      return;
    }

    // Kasus B: Baris diakhiri dengan '{' (JS/CSS) atau ':' (Python)
    const shouldIncreaseIndent =
      (category === 'python' && charBefore === ':') ||
      (category !== 'python' && (charBefore === '{' || charBefore === '(' || charBefore === '['));

    if (shouldIncreaseIndent) {
      const newIndent = currentIndent + indentUnit;
      const newVal = before + '\n' + newIndent + after;
      onChange(newVal);
      setTimeout(() => {
        const cursorPos = start + 1 + newIndent.length;
        textarea.selectionStart = cursorPos;
        textarea.selectionEnd = cursorPos;
      }, 0);
      return;
    }

    // Kasus C: Enter biasa — pertahankan indentasi baris sebelumnya
    const newVal = before + '\n' + currentIndent + after;
    onChange(newVal);
    setTimeout(() => {
      const cursorPos = start + 1 + currentIndent.length;
      textarea.selectionStart = cursorPos;
      textarea.selectionEnd = cursorPos;
    }, 0);
    return;
  }

  // 3. AUTO-PAIRING KURUNG DAN TANDA KUTIP
  // Kurung kurawal {}
  if (e.key === '{') {
    e.preventDefault();
    const newVal = before + '{}' + after;
    onChange(newVal);
    setTimeout(() => {
      textarea.selectionStart = start + 1;
      textarea.selectionEnd = start + 1;
    }, 0);
    return;
  }

  // Kurung biasa ()
  if (e.key === '(') {
    e.preventDefault();
    const newVal = before + '()' + after;
    onChange(newVal);
    setTimeout(() => {
      textarea.selectionStart = start + 1;
      textarea.selectionEnd = start + 1;
    }, 0);
    return;
  }

  // Kurung siku []
  if (e.key === '[') {
    e.preventDefault();
    const newVal = before + '[]' + after;
    onChange(newVal);
    setTimeout(() => {
      textarea.selectionStart = start + 1;
      textarea.selectionEnd = start + 1;
    }, 0);
    return;
  }

  // Tanda kutip dua ""
  if (e.key === '"') {
    if (after.startsWith('"')) {
      // Lewati kutip yang sudah ada
      e.preventDefault();
      textarea.selectionStart = start + 1;
      textarea.selectionEnd = start + 1;
      return;
    }
    e.preventDefault();
    const newVal = before + '""' + after;
    onChange(newVal);
    setTimeout(() => {
      textarea.selectionStart = start + 1;
      textarea.selectionEnd = start + 1;
    }, 0);
    return;
  }

  // Tanda kutip satu ''
  if (e.key === "'") {
    if (after.startsWith("'")) {
      e.preventDefault();
      textarea.selectionStart = start + 1;
      textarea.selectionEnd = start + 1;
      return;
    }
    e.preventDefault();
    const newVal = before + "''" + after;
    onChange(newVal);
    setTimeout(() => {
      textarea.selectionStart = start + 1;
      textarea.selectionEnd = start + 1;
    }, 0);
    return;
  }

  // Melewati karakter penutup '}', ')', ']' jika sudah ada di depan kursor
  if (e.key === '}' && after.startsWith('}')) {
    e.preventDefault();
    textarea.selectionStart = start + 1;
    textarea.selectionEnd = start + 1;
    return;
  }
  if (e.key === ')' && after.startsWith(')')) {
    e.preventDefault();
    textarea.selectionStart = start + 1;
    textarea.selectionEnd = start + 1;
    return;
  }
  if (e.key === ']' && after.startsWith(']')) {
    e.preventDefault();
    textarea.selectionStart = start + 1;
    textarea.selectionEnd = start + 1;
    return;
  }

  // 4. SMART HTML TAG CLOSING (Khusus kategori HTML)
  if (category === 'html') {
    // Saat mengetik '>' untuk tag pembuka: otomatis buatkan tag penutup </tag>
    if (e.key === '>') {
      // Cek apakah karakter tepat di depan kursor sudah '>'
      if (after.startsWith('>')) {
        e.preventDefault();
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = start + 1;
        return;
      }

      // Cari tag yang baru saja diketik sebelum kursor, misal '<h2' atau '<div class="box"'
      const tagMatch = before.match(/<([a-zA-Z0-9]+)(?:\s+[^>]*)?$/);
      if (tagMatch) {
        const tagName = tagMatch[1].toLowerCase();
        // Hanya auto-close jika bukan void element dan bukan tag penutup
        if (!VOID_HTML_TAGS.has(tagName) && !before.endsWith('/')) {
          const closingTag = `</${tagName}>`;
          // Jika tag penutup belum ada tepat di depan kursor, tambahkan
          if (!after.startsWith(closingTag)) {
            e.preventDefault();
            const insert = '>' + closingTag;
            const newVal = before + insert + after;
            onChange(newVal);
            setTimeout(() => {
              textarea.selectionStart = start + 1;
              textarea.selectionEnd = start + 1;
            }, 0);
            return;
          }
        }
      }
    }

    // Saat mengetik '/' setelah '<': otomatis lengkapi dengan nama tag pembuka yang unclosed
    if (e.key === '/' && before.endsWith('<')) {
      const lastTag = findLastUnclosedTag(before.slice(0, -1));
      if (lastTag) {
        e.preventDefault();
        const insert = `/${lastTag}>`;
        const newVal = before + insert + after;
        onChange(newVal);
        setTimeout(() => {
          textarea.selectionStart = start + insert.length;
          textarea.selectionEnd = start + insert.length;
        }, 0);
        return;
      }
    }
  }

  // 5. TOMBOL BACKSPACE CERDAS
  if (e.key === 'Backspace' && start === end && start > 0) {
    const charBefore = before.slice(-1);
    const charAfter = after.charAt(0);

    // Hapus pasangan kurung/kutip sekaligus jika kursor di antaranya
    const isPair =
      (charBefore === '{' && charAfter === '}') ||
      (charBefore === '(' && charAfter === ')') ||
      (charBefore === '[' && charAfter === ']') ||
      (charBefore === '"' && charAfter === '"') ||
      (charBefore === "'" && charAfter === "'");

    if (isPair) {
      e.preventDefault();
      const newVal = before.slice(0, -1) + after.slice(1);
      onChange(newVal);
      setTimeout(() => {
        textarea.selectionStart = start - 1;
        textarea.selectionEnd = start - 1;
      }, 0);
      return;
    }

    // Unindent jika baris hanya berisi spasi kelipatan 2 atau 4
    if (before.endsWith('  ')) {
      const lastNl = before.lastIndexOf('\n');
      const lineBeforeCursor = lastNl === -1 ? before : before.substring(lastNl + 1);
      if (/^\s+$/.test(lineBeforeCursor)) {
        e.preventDefault();
        const deleteCount = category === 'python' && lineBeforeCursor.length >= 4 ? 4 : 2;
        const newVal = before.slice(0, -deleteCount) + after;
        onChange(newVal);
        setTimeout(() => {
          textarea.selectionStart = start - deleteCount;
          textarea.selectionEnd = start - deleteCount;
        }, 0);
        return;
      }
    }
  }
}

/**
 * Memasukkan teks/simbol dari shortcut bar ke posisi kursor dengan cerdas
 */
export function insertEditorSymbol(sym, value, onChange, textareaRef, category) {
  const textarea = textareaRef.current;
  if (!textarea) return;

  const start = textarea.selectionStart || 0;
  const end = textarea.selectionEnd || 0;
  const before = value.substring(0, start);
  const after = value.substring(end);

  if (sym === 'TAB') {
    const indent = category === 'python' ? '    ' : '  ';
    const newVal = before + indent + after;
    onChange(newVal);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + indent.length;
      textarea.selectionEnd = start + indent.length;
    }, 0);
    return;
  }

  // Pasangan kurung otomatis saat tombol shortcut diklik
  if (sym === '{') {
    const newVal = before + '{}' + after;
    onChange(newVal);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + 1;
      textarea.selectionEnd = start + 1;
    }, 0);
    return;
  }

  if (sym === '(') {
    const newVal = before + '()' + after;
    onChange(newVal);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + 1;
      textarea.selectionEnd = start + 1;
    }, 0);
    return;
  }

  if (sym === '[') {
    const newVal = before + '[]' + after;
    onChange(newVal);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + 1;
      textarea.selectionEnd = start + 1;
    }, 0);
    return;
  }

  if (sym === '"') {
    const newVal = before + '""' + after;
    onChange(newVal);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + 1;
      textarea.selectionEnd = start + 1;
    }, 0);
    return;
  }

  if (sym === "'") {
    const newVal = before + "''" + after;
    onChange(newVal);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + 1;
      textarea.selectionEnd = start + 1;
    }, 0);
    return;
  }

  // Simbol biasa: masukkan langsung dan pertahankan fokus
  const newVal = before + sym + after;
  onChange(newVal);
  setTimeout(() => {
    textarea.focus();
    textarea.selectionStart = start + sym.length;
    textarea.selectionEnd = start + sym.length;
  }, 0);
}
