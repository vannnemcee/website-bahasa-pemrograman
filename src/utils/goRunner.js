/**
 * goRunner.js — In-browser Go (Golang) simulator for educational coding quests
 */

function stripGoComments(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

export function runGoCode(sourceCode) {
  const output = [];
  if (!sourceCode || !sourceCode.trim()) {
    return { output: [], error: null };
  }

  try {
    let cleaned = stripGoComments(sourceCode)
      .replace(/^\s*package\s+[a-zA-Z_]\w*\s*$/gm, '')
      .replace(/^\s*import\s+(?:"[^"]+"|\([\s\S]*?\))\s*$/gm, '')
      .trim();

    const hasMain = /\bfunc\s+main\s*\(\s*\)\s*\{/.test(cleaned);

    // Go structs: type Siswa struct { Nama string; Nilai int }
    cleaned = cleaned.replace(
      /\btype\s+([a-zA-Z_]\w*)\s+struct\s*\{([^}]*)\}/g,
      (_, sName, body) => {
        const fields = body
          .split(/[\n;]+/)
          .map((f) => f.trim())
          .filter(Boolean)
          .map((f) => {
            const parts = f.split(/\s+/);
            return parts[0] ? `this.${parts[0]} = null;` : '';
          })
          .join(' ');
        return `class ${sName} { constructor(init = {}) { ${fields} Object.assign(this, init); } }`;
      }
    );

    // Go functions: func tambah(a int, b int) int { ... }
    cleaned = cleaned.replace(
      /\bfunc\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)(?:\s*[a-zA-Z_[\]\w]*)?\s*\{/g,
      (_, fnName, params) => {
        const cleanParams = params
          .split(',')
          .map((p) => p.trim().split(/\s+/)[0])
          .filter(Boolean)
          .join(', ');
        return `function ${fnName}(${cleanParams}) {`;
      }
    );

    // Go slices: []string{"apel", "jeruk"} or []int{1, 2, 3} -> ["apel", "jeruk"]
    cleaned = cleaned.replace(/\[\]\s*(?:string|int|float64|bool)\s*\{([^}]*)\}/g, '[$1]');

    // for _, item := range buah { ... }
    cleaned = cleaned.replace(
      /\bfor\s+(?:[a-zA-Z_]\w*)\s*,\s*([a-zA-Z_]\w*)\s*:=\s*range\s+([a-zA-Z_]\w*)\s*\{/g,
      'for (const $1 of $2) {'
    );
    // for i, item := range buah { ... }
    cleaned = cleaned.replace(
      /\bfor\s+([a-zA-Z_]\w*)\s*:=\s*range\s+([a-zA-Z_]\w*)\s*\{/g,
      'for (let $1 = 0; $1 < $2.length; $1++) {'
    );

    // for i := 0; i < 5; i++ { ... } -> for (let i = 0; i < 5; i++) {
    cleaned = cleaned.replace(/\bfor\s+([^{;]+;[^{;]+;[^{]+)\{/g, 'for ($1) {');

    // if cond { ... } -> if (cond) { ... }
    cleaned = cleaned.replace(/\bif\s+([^{]+)\{/g, (_, cond) => `if (${cond.trim()}) {`);

    // Short declaration: nama := "Budi" -> let nama = "Budi"
    cleaned = cleaned.replace(/\b([a-zA-Z_]\w*)\s*:=\s*/g, 'let $1 = ');

    // var tahun int = 2026 -> let tahun = 2026
    cleaned = cleaned.replace(
      /\bvar\s+([a-zA-Z_]\w*)(?:\s+(?:string|int|float64|bool))?\s*=/g,
      'let $1 ='
    );

    // fmt.Println / fmt.Printf / fmt.Print
    cleaned = cleaned
      .replace(/\bfmt\.Println\s*\(/g, '__println(')
      .replace(/\bfmt\.Print\s*\(/g, '__println(')
      .replace(/\bfmt\.Printf\s*\(/g, '__printf(');

    if (hasMain) {
      cleaned += '\nmain();';
    }

    const __println = (...args) => {
      output.push(args.map((a) => (Array.isArray(a) ? `[${a.join(' ')}]` : String(a))).join(' '));
    };
    const __printf = (fmtStr, ...args) => {
      let idx = 0;
      const formatted = String(fmtStr).replace(/%[vsdf]/g, () =>
        idx < args.length ? String(args[idx++]) : ''
      );
      output.push(formatted.replace(/\n$/, ''));
    };

    const fn = new Function('__println', '__printf', cleaned);
    fn(__println, __printf);

    return { output, error: null };
  } catch (err) {
    return { output, error: err.message };
  }
}
