/**
 * cppRunner.js — In-browser C++ simulator for educational coding quests
 */

function stripCppComments(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

function splitStreamParts(expr) {
  const parts = [];
  let cur = '';
  let quote = null;
  let parenDepth = 0;
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (!quote && (ch === '"' || ch === "'")) quote = ch;
    else if (quote && ch === quote && expr[i - 1] !== '\\') quote = null;
    else if (!quote) {
      if (ch === '(') parenDepth++;
      else if (ch === ')') parenDepth--;
      else if (ch === '<' && expr[i + 1] === '<' && parenDepth === 0) {
        parts.push(cur.trim());
        cur = '';
        i++;
        continue;
      }
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

export function runCppCode(sourceCode) {
  const output = [];
  if (!sourceCode || !sourceCode.trim()) {
    return { output: [], error: null };
  }

  try {
    let cleaned = stripCppComments(sourceCode)
      .replace(/^\s*#include\s+[<"][^>"]+[>"]/gm, '')
      .replace(/^\s*using\s+namespace\s+std\s*;/gm, '')
      .trim();

    // If user wrote int main() { ... return 0; }, extract or invoke main
    const hasMain = /\bint\s+main\s*\([^)]*\)\s*\{/.test(cleaned);
    if (hasMain) {
      cleaned = cleaned.replace(/\bint\s+main\s*\([^)]*\)/, 'function __cpp_main()');
    }

    // Transform cout << a << b << endl; statements
    cleaned = cleaned.replace(/(?:std::)?cout\s*<<\s*([^;]+);/g, (_, streamExpr) => {
      const parts = splitStreamParts(streamExpr).map((p) =>
        p === 'endl' || p === 'std::endl' ? '"\\n"' : p
      );
      return `__cout(${parts.join(', ')});`;
    });

    // Transform C++ structs: struct Siswa { string nama; int nilai; };
    cleaned = cleaned.replace(/\bstruct\s+([a-zA-Z_]\w*)\s*\{([^}]*)\}\s*;/g, (_, sName, body) => {
      const fields = body
        .split(';')
        .map((f) => f.trim())
        .filter(Boolean)
        .map((f) => {
          const m = f.match(/^(?:int|double|float|string|std::string|bool|char)\s+([a-zA-Z_]\w*)(?:\s*=\s*(.+))?$/);
          return m ? `this.${m[1]} = ${m[2] ?? 'null'};` : '';
        })
        .join(' ');
      return `class ${sName} { constructor() { ${fields} } }`;
    });

    // Transform C++ functions: int tambah(int a, int b) { ... }
    cleaned = cleaned.replace(
      /\b(?:void|int|double|float|string|std::string|bool)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*\{/g,
      (_, fnName, params) => {
        const cleanParams = params
          .split(',')
          .map((p) => p.trim().replace(/^(?:const\s+)?(?:int|double|float|string|std::string|bool|char)\s+&?\s*/, ''))
          .filter(Boolean)
          .join(', ');
        return `function ${fnName}(${cleanParams}) {`;
      }
    );

    // Transform C++ arrays: int angka[3] = {10, 20, 30}; -> let angka = [10, 20, 30];
    cleaned = cleaned.replace(
      /\b(?:int|double|float|string|std::string|bool|char)\s+([a-zA-Z_]\w*)\s*\[\s*\d*\s*\]\s*=\s*\{([^}]*)\}/g,
      'let $1 = [$2]'
    );

    // Transform variable declarations
    cleaned = cleaned.replace(
      /\b(?:const\s+)?(?:int|double|float|long|string|std::string|bool|char)\s+([a-zA-Z_]\w*)/g,
      'let $1'
    );

    if (hasMain) {
      cleaned += '\n__cpp_main();';
    }

    let lineBuffer = '';
    const __cout = (...args) => {
      for (const arg of args) {
        if (arg === '\n') {
          output.push(lineBuffer);
          lineBuffer = '';
        } else {
          const s = String(arg);
          if (s.includes('\n')) {
            const pieces = s.split('\n');
            lineBuffer += pieces[0];
            for (let k = 1; k < pieces.length; k++) {
              output.push(lineBuffer);
              lineBuffer = pieces[k];
            }
          } else {
            lineBuffer += s;
          }
        }
      }
    };

    const fn = new Function('__cout', cleaned);
    fn(__cout);
    if (lineBuffer !== '') output.push(lineBuffer);

    return { output, error: null };
  } catch (err) {
    return { output, error: err.message };
  }
}
