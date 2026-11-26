/**
 * javaRunner.js — In-browser Java simulator for educational coding quests
 */

function stripJavaComments(code) {
  let out = '';
  let inStr = false;
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    const next = code[i + 1] || '';
    const prev = i > 0 ? code[i - 1] : '';
    if (ch === '"' && prev !== '\\') {
      inStr = !inStr;
      out += ch;
    } else if (!inStr && ch === '/' && next === '/') {
      while (i < code.length && code[i] !== '\n') i++;
      out += '\n';
    } else if (!inStr && ch === '/' && next === '*') {
      i += 2;
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) i++;
      i++;
    } else {
      out += ch;
    }
  }
  return out;
}

function extractMatchingBlock(str, openBraceIdx) {
  let depth = 0;
  let inStr = false;
  for (let i = openBraceIdx; i < str.length; i++) {
    const ch = str[i];
    const prev = i > 0 ? str[i - 1] : '';
    if (ch === '"' && prev !== '\\') {
      inStr = !inStr;
      continue;
    }
    if (inStr) continue;
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return { inner: str.slice(openBraceIdx + 1, i), endIdx: i };
      }
    }
  }
  return null;
}

function unwrapMainClass(code) {
  const mainHeader = /\bpublic\s+static\s+void\s+main\s*\([^)]*\)\s*\{/;
  const match = mainHeader.exec(code);
  if (!match) return code;

  const openBraceIdx = match.index + match[0].length - 1;
  const block = extractMatchingBlock(code, openBraceIdx);
  if (!block) return code;

  // Also keep any helper static methods declared outside main inside the class
  const beforeMain = code.slice(0, match.index).replace(/\b(?:public\s+)?class\s+\w+\s*\{/, '');
  const afterMain = code.slice(block.endIdx + 1).replace(/\}\s*$/, '');
  return `${beforeMain}\n${block.inner}\n${afterMain}`.trim();
}

export function runJavaCode(sourceCode) {
  const output = [];
  if (!sourceCode || !sourceCode.trim()) {
    return { output: [], error: null };
  }

  try {
    let cleaned = stripJavaComments(sourceCode).trim();
    cleaned = unwrapMainClass(cleaned);

    let js = cleaned
      .replace(/System\.out\.println\s*\(/g, '__println(')
      .replace(/System\.out\.print\s*\(/g, '__print(')
      .replace(/\b(?:int|double|float|String|boolean|char)\s*\[\s*\]\s*([a-zA-Z_]\w*)\s*=\s*\{([^}]*)\}/g, 'let $1 = [$2]')
      .replace(/\b(?:int|double|float|String|boolean|char)\s+([a-zA-Z_]\w*)\s*\[\s*\]\s*=\s*\{([^}]*)\}/g, 'let $1 = [$2]')
      .replace(/\b(?:public|private|protected)?\s*static\s+(?:void|int|double|String|boolean)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)/g, (_, fnName, params) => {
        const cleanParams = params
          .split(',')
          .map((p) => p.trim().replace(/^(?:int|double|float|String|boolean|char)\s+/, ''))
          .filter(Boolean)
          .join(', ');
        return `function ${fnName}(${cleanParams})`;
      })
      .replace(/\bclass\s+([a-zA-Z_]\w*)\s*\{([^}]*)\}/g, (_, clsName, body) => {
        const props = body
          .replace(/\b(?:public|private|protected)\s+/g, '')
          .replace(/\b(?:int|double|float|String|boolean|char)\s+([a-zA-Z_]\w*)\s*=\s*([^;]+);/g, 'this.$1 = $2;')
          .replace(/\b(?:int|double|float|String|boolean|char)\s+([a-zA-Z_]\w*)\s*;/g, 'this.$1 = null;');
        return `class ${clsName} { constructor() { ${props} } }`;
      })
      .replace(/\b(?:final\s+)?(?:int|double|float|long|String|boolean|char)\s+([a-zA-Z_]\w*)/g, 'let $1');

    let inlineBuffer = '';
    const __println = (...args) => {
      const text = inlineBuffer + args.map((a) => (Array.isArray(a) ? `[${a.join(', ')}]` : String(a))).join(' ');
      inlineBuffer = '';
      output.push(text);
    };
    const __print = (...args) => {
      inlineBuffer += args.map(String).join(' ');
    };

    const fn = new Function('__println', '__print', js);
    fn(__println, __print);
    if (inlineBuffer) output.push(inlineBuffer);

    return { output, error: null };
  } catch (err) {
    return { output, error: err.message };
  }
}
