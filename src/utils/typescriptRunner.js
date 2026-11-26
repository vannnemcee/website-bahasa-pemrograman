/**
 * typescriptRunner.js — In-browser TypeScript simulator & type checker
 */

function stripBlocksByKeyword(code, keyword) {
  let out = '';
  let i = 0;
  while (i < code.length) {
    const rest = code.slice(i);
    const prev = i > 0 ? code[i - 1] : ' ';
    if (
      !/[a-zA-Z0-9_$]/.test(prev) &&
      new RegExp(`^${keyword}\\s+[a-zA-Z_]\\w*`).test(rest)
    ) {
      // Find opening '{'
      let j = i;
      let inStr = null;
      while (j < code.length) {
        const ch = code[j];
        if (!inStr && (ch === '"' || ch === "'" || ch === '`')) inStr = ch;
        else if (inStr && ch === inStr && code[j - 1] !== '\\') inStr = null;
        else if (!inStr && ch === '{') break;
        j++;
      }
      if (j < code.length && code[j] === '{') {
        let depth = 0;
        inStr = null;
        while (j < code.length) {
          const ch = code[j];
          if (!inStr && (ch === '"' || ch === "'" || ch === '`')) inStr = ch;
          else if (inStr && ch === inStr && code[j - 1] !== '\\') inStr = null;
          else if (!inStr) {
            if (ch === '{') depth++;
            else if (ch === '}') {
              depth--;
              if (depth === 0) {
                j++;
                break;
              }
            }
          }
          j++;
        }
        i = j;
        continue;
      }
    }
    out += code[i];
    i++;
  }
  return out;
}

function stripTypeAliases(code) {
  // Strip `type Foo = ...;` or `type Foo = ...` at end of line without corrupting strings
  const lines = code.split('\n');
  return lines
    .map((line) => {
      if (/^\s*(?:export\s+)?type\s+[a-zA-Z_]\w*(?:<[^>]+>)?\s*=/.test(line)) {
        return '';
      }
      return line;
    })
    .join('\n');
}

function transpileTsToJs(sourceCode) {
  // Mask string/template literals and comments so type-stripping never touches text inside strings
  const literals = [];
  let masked = '';
  let i = 0;
  while (i < sourceCode.length) {
    const ch = sourceCode[i];
    const next = sourceCode[i + 1] || '';

    // Line comment
    if (ch === '/' && next === '/') {
      const start = i;
      while (i < sourceCode.length && sourceCode[i] !== '\n') i++;
      literals.push(sourceCode.slice(start, i));
      masked += `__LIT_${literals.length - 1}__`;
      continue;
    }
    // Block comment
    if (ch === '/' && next === '*') {
      const start = i;
      i += 2;
      while (i < sourceCode.length && !(sourceCode[i] === '*' && sourceCode[i + 1] === '/')) i++;
      i += 2;
      literals.push(sourceCode.slice(start, i));
      masked += `__LIT_${literals.length - 1}__`;
      continue;
    }
    // String or template literal
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      const start = i;
      i++;
      while (i < sourceCode.length) {
        if (sourceCode[i] === '\\') {
          i += 2;
          continue;
        }
        if (sourceCode[i] === quote) {
          i++;
          break;
        }
        i++;
      }
      literals.push(sourceCode.slice(start, i));
      masked += `__LIT_${literals.length - 1}__`;
      continue;
    }

    masked += ch;
    i++;
  }

  let js = masked;

  // 1. Convert enum Name { A = __LIT_0__, B } -> var Name = { A: __LIT_0__, B: "B" };
  js = js.replace(/enum\s+([a-zA-Z_]\w*)\s*\{([^}]*)\}/g, (_, enumName, body) => {
    const pairs = body
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => {
        if (p.includes('=')) {
          const [k, v] = p.split('=').map((s) => s.trim());
          return `${k}: ${v}`;
        }
        return `${p}: "${p}"`;
      })
      .join(', ');
    return `var ${enumName} = { ${pairs} };`;
  });

  // 2. Strip interface declarations (supports nested braces)
  js = stripBlocksByKeyword(js, '(?:export\\s+)?interface');

  // 3. Strip type alias declarations
  js = stripTypeAliases(js);

  // 4. Strip function generics like function identitas<T>(...)
  js = js.replace(/(function\s+[a-zA-Z_]\w*)\s*<[^>]+>/g, '$1');

  // 5. Strip variable declaration type annotations: let/const/var x: Type = ... -> let/const/var x = ...
  js = js.replace(
    /\b(let|const|var)\s+([a-zA-Z_]\w*)\s*\??\s*:\s*[^=;]+(?=[=;])/g,
    '$1 $2'
  );

  // 6. Strip function/arrow return type annotations: ): Type { or ): Type =>
  js = js.replace(/\)\s*:\s*[a-zA-Z_][\w[\]<>, |&?]*\s*(?=\{|=>)/g, ') ');

  // 7. Strip parameter type annotations inside function(...) or (...) =>
  js = js.replace(/\(([^()]*)\)/g, (full, inner) => {
    // Only strip if it looks like typed params (contains : followed by identifier/type)
    if (!/:\s*(?:string|number|boolean|any|void|unknown|never|object|[A-Z][\w<>[\]]*)/.test(inner)) {
      return full;
    }
    const cleanedParams = inner
      .split(',')
      .map((param) => param.replace(/\??\s*:\s*[^,=]+/g, '').trim())
      .join(', ');
    return `(${cleanedParams})`;
  });

  // 8. Strip 'as Type' assertions
  js = js.replace(/\s+as\s+[a-zA-Z_][\w[\]<>|& ]*/g, '');

  // Restore literals
  js = js.replace(/__LIT_(\d+)__/g, (_, idx) => literals[Number(idx)]);
  return js;
}

export function runTypeScriptCode(sourceCode) {
  const output = [];
  if (!sourceCode || !sourceCode.trim()) {
    return { output: [], typeCheck: 'Siap dijalankan', error: null };
  }

  // 1. Static Type Validation Checks
  const lines = sourceCode.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;

    if (/(?:let|const|var)\s+\w+\s*:\s*number\s*=\s*(?:["'`]|true\b|false\b)/.test(trimmed)) {
      return {
        output: [],
        typeCheck: 'Type Error',
        error: "Tipe data tidak cocok: nilai bukan bertipe 'number'.",
      };
    }
    if (/(?:let|const|var)\s+\w+\s*:\s*string\s*=\s*(?:\d+|true\b|false\b)/.test(trimmed)) {
      return {
        output: [],
        typeCheck: 'Type Error',
        error: "Tipe data tidak cocok: nilai bukan bertipe 'string'.",
      };
    }
    if (/(?:let|const|var)\s+\w+\s*:\s*boolean\s*=\s*(?:["'`]|\d+)/.test(trimmed)) {
      return {
        output: [],
        typeCheck: 'Type Error',
        error: "Tipe data tidak cocok: nilai bukan bertipe 'boolean'.",
      };
    }
    if (/(?:let|const|var)\s+\w+\s*:\s*number\[\]\s*=\s*\[[^\]]*["'`]/.test(trimmed)) {
      return {
        output: [],
        typeCheck: 'Type Error',
        error: "Tipe data tidak cocok: elemen array harus bertipe 'number'.",
      };
    }
  }

  // 2. Transpile TS to JS safely
  const jsCode = transpileTsToJs(sourceCode);

  // 3. Execute JS and capture console.log
  try {
    const logs = [];
    const customConsole = {
      log: (...args) =>
        logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
      error: (...args) => logs.push('Error: ' + args.join(' ')),
      warn: (...args) => logs.push('Warn: ' + args.join(' ')),
      info: (...args) => logs.push(args.join(' ')),
    };

    const runFn = new Function('console', jsCode);
    runFn(customConsole);

    return {
      output: logs,
      typeCheck: '0 Type Errors',
      error: null,
    };
  } catch (err) {
    return {
      output,
      typeCheck: 'Runtime Error',
      error: err.message,
    };
  }
}
