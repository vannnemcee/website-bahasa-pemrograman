/**
 * pythonRunner.js — In-browser Python simulator for educational coding quests
 */

export function runPythonCode(sourceCode) {
  const output = [];
  if (!sourceCode || !sourceCode.trim()) {
    return { output: [], error: null };
  }

  const variables = {};
  const functions = {};
  const rawLines = sourceCode.split('\n');

  // Helper: evaluate an expression in current variable scope
  function evaluateExpr(expr) {
    let trimmed = expr.trim();
    if (!trimmed) return '';

    // String literal "..." or '...'
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }

    // F-string: f"..." or f'...'
    if (
      (trimmed.startsWith('f"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("f'") && trimmed.endsWith("'"))
    ) {
      let content = trimmed.slice(2, -1);
      return content.replace(/\{([^}]+)\}/g, (_, varName) => {
        const v = varName.trim();
        return evaluateExpr(v);
      });
    }

    // Number literal
    if (!isNaN(Number(trimmed)) && trimmed !== '') {
      return Number(trimmed);
    }

    // List literal: [...]
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const itemsStr = trimmed.slice(1, -1).trim();
      if (!itemsStr) return [];
      const parts = splitTopLevel(itemsStr, ',');
      return parts.map((p) => evaluateExpr(p));
    }

    // Variable lookup
    if (Object.prototype.hasOwnProperty.call(variables, trimmed)) {
      return variables[trimmed];
    }

    // Simple binary operations: + - * / // %
    const mathOps = ['+', '-', '*', '/', '%'];
    for (const op of mathOps) {
      if (trimmed.includes(op)) {
        const parts = splitTopLevel(trimmed, op);
        if (parts.length === 2) {
          const left = evaluateExpr(parts[0]);
          const right = evaluateExpr(parts[1]);
          if (typeof left === 'number' && typeof right === 'number') {
            if (op === '+') return left + right;
            if (op === '-') return left - right;
            if (op === '*') return left * right;
            if (op === '/') return right !== 0 ? left / right : 0;
            if (op === '%') return right !== 0 ? left % right : 0;
          }
          if (typeof left === 'string' && op === '+') {
            return left + String(right);
          }
        }
      }
    }

    // Simple comparisons: >, <, >=, <=, ==, !=
    const compOps = ['==', '!=', '>=', '<=', '>', '<'];
    for (const op of compOps) {
      if (trimmed.includes(op)) {
        const parts = splitTopLevel(trimmed, op);
        if (parts.length === 2) {
          const left = evaluateExpr(parts[0]);
          const right = evaluateExpr(parts[1]);
          if (op === '==') return left == right;
          if (op === '!=') return left != right;
          if (op === '>=') return left >= right;
          if (op === '<=') return left <= right;
          if (op === '>') return left > right;
          if (op === '<') return left < right;
        }
      }
    }

    return trimmed;
  }

  function splitTopLevel(str, delimiter) {
    const result = [];
    let current = '';
    let inDoubleQuote = false;
    let inSingleQuote = false;
    let bracketDepth = 0;
    let parenDepth = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
      else if (char === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
      else if (char === '[' && !inDoubleQuote && !inSingleQuote) bracketDepth++;
      else if (char === ']' && !inDoubleQuote && !inSingleQuote) bracketDepth--;
      else if (char === '(' && !inDoubleQuote && !inSingleQuote) parenDepth++;
      else if (char === ')' && !inDoubleQuote && !inSingleQuote) parenDepth--;
      else if (
        char === delimiter &&
        !inDoubleQuote &&
        !inSingleQuote &&
        bracketDepth === 0 &&
        parenDepth === 0
      ) {
        result.push(current.trim());
        current = '';
        continue;
      }
      current += char;
    }
    result.push(current.trim());
    return result;
  }

  function getIndent(line) {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
  }

  function executeStatement(line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    // Handle print(...)
    if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
      const inside = trimmed.slice(6, -1);
      if (!inside.trim()) {
        output.push('');
        return;
      }
      const args = splitTopLevel(inside, ',');
      const evaluatedArgs = args.map((arg) => {
        const val = evaluateExpr(arg);
        if (Array.isArray(val)) {
          return `[${val.map((x) => (typeof x === 'string' ? `'${x}'` : x)).join(', ')}]`;
        }
        return String(val);
      });
      output.push(evaluatedArgs.join(' '));
      return;
    }

    // Function call like sapa()
    if (trimmed.endsWith('()')) {
      const fnName = trimmed.slice(0, -2).trim();
      if (functions[fnName]) {
        for (const fLine of functions[fnName]) {
          executeStatement(fLine);
        }
        return;
      }
    }

    // Assignment: var = val
    if (trimmed.includes('=')) {
      const eqIdx = trimmed.indexOf('=');
      // Ensure not ==, >=, <=, !=
      const prevChar = trimmed[eqIdx - 1];
      const nextChar = trimmed[eqIdx + 1];
      if (prevChar !== '!' && prevChar !== '>' && prevChar !== '<' && nextChar !== '=') {
        const varName = trimmed.slice(0, eqIdx).trim();
        const expr = trimmed.slice(eqIdx + 1).trim();
        variables[varName] = evaluateExpr(expr);
        return;
      }
    }
  }

  try {
    let lineIdx = 0;
    while (lineIdx < rawLines.length) {
      const line = rawLines[lineIdx];
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        lineIdx++;
        continue;
      }

      // Check for inline if statement: if cond: stmt
      if (trimmed.startsWith('if ') && trimmed.includes(':') && !trimmed.endsWith(':')) {
        const colonIdx = trimmed.indexOf(':');
        const cond = trimmed.slice(3, colonIdx).trim();
        const stmt = trimmed.slice(colonIdx + 1).trim();
        if (evaluateExpr(cond)) {
          executeStatement(stmt);
        }
        lineIdx++;
        continue;
      }

      // Block if statement: if cond:
      if (trimmed.startsWith('if ') && trimmed.endsWith(':')) {
        const cond = trimmed.slice(3, -1).trim();
        const isTrue = Boolean(evaluateExpr(cond));
        const parentIndent = getIndent(line);

        lineIdx++;
        const ifBlock = [];
        while (lineIdx < rawLines.length && (rawLines[lineIdx].trim() === '' || getIndent(rawLines[lineIdx]) > parentIndent)) {
          if (rawLines[lineIdx].trim() !== '') {
            ifBlock.push(rawLines[lineIdx]);
          }
          lineIdx++;
        }

        // Check for else: block
        let elseBlock = [];
        if (lineIdx < rawLines.length && rawLines[lineIdx].trim() === 'else:') {
          lineIdx++;
          while (lineIdx < rawLines.length && (rawLines[lineIdx].trim() === '' || getIndent(rawLines[lineIdx]) > parentIndent)) {
            if (rawLines[lineIdx].trim() !== '') {
              elseBlock.push(rawLines[lineIdx]);
            }
            lineIdx++;
          }
        }

        const blockToRun = isTrue ? ifBlock : elseBlock;
        for (const bLine of blockToRun) {
          executeStatement(bLine);
        }
        continue;
      }

      // For loop: for i in range(n):
      if (trimmed.startsWith('for ') && trimmed.endsWith(':')) {
        const match = trimmed.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+range\(([^)]+)\):$/);
        const parentIndent = getIndent(line);
        lineIdx++;

        const loopBlock = [];
        while (lineIdx < rawLines.length && (rawLines[lineIdx].trim() === '' || getIndent(rawLines[lineIdx]) > parentIndent)) {
          if (rawLines[lineIdx].trim() !== '') {
            loopBlock.push(rawLines[lineIdx]);
          }
          lineIdx++;
        }

        if (match) {
          const varName = match[1];
          const rangeArgs = match[2].split(',').map((x) => evaluateExpr(x.trim()));
          let start = 0;
          let end = 0;
          if (rangeArgs.length === 1) {
            end = Number(rangeArgs[0]) || 0;
          } else {
            start = Number(rangeArgs[0]) || 0;
            end = Number(rangeArgs[1]) || 0;
          }

          // Safety guard for loops
          const maxLoops = Math.min(Math.max(0, end - start), 100);
          for (let step = 0; step < maxLoops; step++) {
            variables[varName] = start + step;
            for (const bLine of loopBlock) {
              executeStatement(bLine);
            }
          }
        }
        continue;
      }

      // Function definition: def fn():
      if (trimmed.startsWith('def ') && trimmed.endsWith(':')) {
        const match = trimmed.match(/^def\s+([a-zA-Z_]\w*)\s*\([^)]*\):$/);
        const parentIndent = getIndent(line);
        lineIdx++;

        const fnBlock = [];
        while (lineIdx < rawLines.length && (rawLines[lineIdx].trim() === '' || getIndent(rawLines[lineIdx]) > parentIndent)) {
          if (rawLines[lineIdx].trim() !== '') {
            fnBlock.push(rawLines[lineIdx]);
          }
          lineIdx++;
        }

        if (match) {
          const fnName = match[1];
          functions[fnName] = fnBlock;
        }
        continue;
      }

      // Standard top-level statement
      executeStatement(line);
      lineIdx++;
    }

    return { output, error: null };
  } catch (err) {
    return {
      output,
      error: `SyntaxError or RuntimeError: ${err.message}`,
    };
  }
}
