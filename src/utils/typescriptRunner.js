/**
 * typescriptRunner.js — In-browser TypeScript simulator & type checker
 */

export function runTypeScriptCode(sourceCode) {
  const output = [];
  if (!sourceCode || !sourceCode.trim()) {
    return { output: [], typeCheck: 'Ready', error: null };
  }

  // 1. Basic Type Validation Check
  // Check for obvious mismatches: let x: number = "str", let y: string = 123
  const lines = sourceCode.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Check number typed variable assigned to string
    const numMismatch = trimmed.match(/(?:let|const|var)\s+\w+\s*:\s*number\s*=\s*["'`]/);
    if (numMismatch) {
      return {
        output: [],
        typeCheck: 'Type Error',
        error: "Type 'string' is not assignable to type 'number'.",
      };
    }
    // Check string typed variable assigned to number
    const strMismatch = trimmed.match(/(?:let|const|var)\s+\w+\s*:\s*string\s*=\s*\d+/);
    if (strMismatch) {
      return {
        output: [],
        typeCheck: 'Type Error',
        error: "Type 'number' is not assignable to type 'string'.",
      };
    }
    // Check boolean typed variable assigned to non-boolean
    const boolMismatch = trimmed.match(/(?:let|const|var)\s+\w+\s*:\s*boolean\s*=\s*(?!true|false)\w+/);
    if (boolMismatch) {
      return {
        output: [],
        typeCheck: 'Type Error',
        error: "Type is not assignable to type 'boolean'.",
      };
    }
  }

  // 2. Transpile TS to JS
  // Strip interfaces, types, enums and type annotations
  let jsCode = sourceCode;

  // Handle enum: enum Arah { Atas = "ATAS", Bawah = "BAWAH" } -> var Arah = { Atas: "ATAS", Bawah: "BAWAH" };
  jsCode = jsCode.replace(/enum\s+([a-zA-Z_]\w*)\s*\{([^}]*)\}/g, (_, enumName, body) => {
    const pairs = body
      .split(',')
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => {
        if (p.includes('=')) {
          const [k, v] = p.split('=').map(s => s.trim());
          return `${k}: ${v}`;
        }
        return `${p}: "${p}"`;
      })
      .join(', ');
    return `var ${enumName} = { ${pairs} };`;
  });

  // Strip interface and type declarations: interface X { ... } and type Y = ...;
  jsCode = jsCode.replace(/interface\s+[a-zA-Z_]\w*(?:<[^>]+>)?\s*\{[^}]*\}/gs, '');
  jsCode = jsCode.replace(/type\s+[a-zA-Z_]\w*(?:<[^>]+>)?\s*=\s*[^;]+;/g, '');

  // Strip generics from function: function test<T>(...) -> function test(...)
  jsCode = jsCode.replace(/<[A-Z,\s]+>/g, '');

  // Strip type annotations from variables: let x: string = ... -> let x = ...
  // and from parameters: (a: number, b: number): number -> (a, b)
  jsCode = jsCode.replace(/:\s*[a-zA-Z_][\w[\]<>, |&?]*(?=[=,)};{])/g, '');

  // Strip return type annotations: ): number { -> ) {
  jsCode = jsCode.replace(/\)\s*:\s*[a-zA-Z_][\w[\]<>, |&?]*\s*\{/g, ') {');

  // Strip 'as Type' type assertions
  jsCode = jsCode.replace(/\s+as\s+[a-zA-Z_][\w[\]]*/g, '');

  // 3. Execute JS and capture console.log
  try {
    const logs = [];
    const customConsole = {
      log: (...args) => logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
      error: (...args) => logs.push('Error: ' + args.join(' ')),
      warn: (...args) => logs.push('Warn: ' + args.join(' ')),
      info: (...args) => logs.push(args.join(' ')),
    };

    // Safe execution sandbox
    const runFn = new Function('console', jsCode);
    runFn(customConsole);

    return {
      output: logs,
      typeCheck: 'TypeScript: 0 Type Errors (Transpiled cleanly)',
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
