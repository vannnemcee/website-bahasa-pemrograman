/**
 * pythonRunner.js — In-browser Python simulator for educational coding quests
 */

function stripInlineComment(line) {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const prev = i > 0 ? line[i - 1] : '';
    if (ch === "'" && !inDouble && prev !== '\\') inSingle = !inSingle;
    else if (ch === '"' && !inSingle && prev !== '\\') inDouble = !inDouble;
    else if (ch === '#' && !inSingle && !inDouble) {
      return line.slice(0, i);
    }
  }
  return line;
}

function splitTopLevel(str, delimiter) {
  const result = [];
  let current = '';
  let inDouble = false;
  let inSingle = false;
  let bracketDepth = 0;
  let parenDepth = 0;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const prev = i > 0 ? str[i - 1] : '';
    if (ch === '"' && !inSingle && prev !== '\\') inDouble = !inDouble;
    else if (ch === "'" && !inDouble && prev !== '\\') inSingle = !inSingle;
    else if (!inDouble && !inSingle) {
      if (ch === '[') bracketDepth++;
      else if (ch === ']') bracketDepth--;
      else if (ch === '(') parenDepth++;
      else if (ch === ')') parenDepth--;
      else if (
        str.slice(i, i + delimiter.length) === delimiter &&
        bracketDepth === 0 &&
        parenDepth === 0
      ) {
        result.push(current.trim());
        current = '';
        i += delimiter.length - 1;
        continue;
      }
    }
    current += ch;
  }
  result.push(current.trim());
  return result;
}

function findTopLevelOperator(str, ops) {
  let inDouble = false;
  let inSingle = false;
  let bracketDepth = 0;
  let parenDepth = 0;

  // Scan right-to-left so left-associative ops evaluate properly
  for (let i = str.length - 1; i >= 0; i--) {
    const ch = str[i];
    const prev = i > 0 ? str[i - 1] : '';
    if (ch === '"' && !inSingle && prev !== '\\') inDouble = !inDouble;
    else if (ch === "'" && !inDouble && prev !== '\\') inSingle = !inSingle;
    else if (!inDouble && !inSingle) {
      if (ch === ']') bracketDepth++;
      else if (ch === '[') bracketDepth--;
      else if (ch === ')') parenDepth++;
      else if (ch === '(') parenDepth--;
      else if (bracketDepth === 0 && parenDepth === 0) {
        for (const op of ops) {
          const startIdx = i - op.length + 1;
          if (startIdx >= 0 && str.slice(startIdx, i + 1) === op) {
            // Avoid matching unary + / - at start or right after another operator
            const leftPart = str.slice(0, startIdx).trim();
            if ((op === '+' || op === '-') && !leftPart) continue;
            // Avoid matching '/' inside '//'
            if (op === '/' && (str[startIdx - 1] === '/' || str[i + 1] === '/')) continue;
            // Avoid matching '*' inside '**'
            if (op === '*' && (str[startIdx - 1] === '*' || str[i + 1] === '*')) continue;
            // Avoid matching '=' inside '==', '!=', '>=', '<='
            if ((op === '<' || op === '>') && str[i + 1] === '=') continue;
            return {
              op,
              left: leftPart,
              right: str.slice(i + 1).trim(),
            };
          }
        }
      }
    }
  }
  return null;
}

export function runPythonCode(sourceCode) {
  const output = [];
  if (!sourceCode || !sourceCode.trim()) {
    return { output: [], error: null };
  }

  const variables = {};
  const functions = {};
  const rawLines = sourceCode.split('\n');

  function formatValue(val) {
    if (val === true) return 'True';
    if (val === false) return 'False';
    if (val === null || val === undefined) return 'None';
    if (Array.isArray(val)) {
      return `[${val.map((x) => (typeof x === 'string' ? `'${x}'` : formatValue(x))).join(', ')}]`;
    }
    return String(val);
  }

  function evaluateExpr(expr) {
    let trimmed = expr.trim();
    if (!trimmed) return '';

    // Parenthesized expression
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      let depth = 0;
      let wrapsWhole = true;
      for (let i = 0; i < trimmed.length - 1; i++) {
        if (trimmed[i] === '(') depth++;
        else if (trimmed[i] === ')') depth--;
        if (depth === 0) {
          wrapsWhole = false;
          break;
        }
      }
      if (wrapsWhole) {
        return evaluateExpr(trimmed.slice(1, -1));
      }
    }

    // F-string: f"..." or f'...'
    if (
      (trimmed.startsWith('f"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("f'") && trimmed.endsWith("'"))
    ) {
      const content = trimmed.slice(2, -1);
      return content.replace(/\{([^}]+)\}/g, (_, inner) => formatValue(evaluateExpr(inner.trim())));
    }

    // String literal "..." or '...'
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"') && splitTopLevel(trimmed, '"').length <= 3) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'") && splitTopLevel(trimmed, "'").length <= 3)
    ) {
      // Ensure it is a single string literal, not "a" + "b"
      const quote = trimmed[0];
      let closedEarly = false;
      for (let i = 1; i < trimmed.length - 1; i++) {
        if (trimmed[i] === quote && trimmed[i - 1] !== '\\') {
          closedEarly = true;
          break;
        }
      }
      if (!closedEarly) {
        return trimmed.slice(1, -1);
      }
    }

    // Booleans / None
    if (trimmed === 'True') return true;
    if (trimmed === 'False') return false;
    if (trimmed === 'None') return null;

    // Number literal
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return Number(trimmed);
    }

    // List literal: [...]
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const itemsStr = trimmed.slice(1, -1).trim();
      if (!itemsStr) return [];
      return splitTopLevel(itemsStr, ',').map((p) => evaluateExpr(p));
    }

    // Logical: or / and
    const orSplit = splitTopLevel(trimmed, ' or ');
    if (orSplit.length > 1) {
      return orSplit.some((p) => Boolean(evaluateExpr(p)));
    }
    const andSplit = splitTopLevel(trimmed, ' and ');
    if (andSplit.length > 1) {
      return andSplit.every((p) => Boolean(evaluateExpr(p)));
    }
    if (trimmed.startsWith('not ')) {
      return !evaluateExpr(trimmed.slice(4));
    }

    // Comparisons
    const compMatch = findTopLevelOperator(trimmed, ['==', '!=', '>=', '<=', '>', '<']);
    if (compMatch) {
      const left = evaluateExpr(compMatch.left);
      const right = evaluateExpr(compMatch.right);
      if (compMatch.op === '==') return left === right;
      if (compMatch.op === '!=') return left !== right;
      if (compMatch.op === '>=') return left >= right;
      if (compMatch.op === '<=') return left <= right;
      if (compMatch.op === '>') return left > right;
      if (compMatch.op === '<') return left < right;
    }

    // Addition / Subtraction (lower precedence than * / %)
    const addMatch = findTopLevelOperator(trimmed, ['+', '-']);
    if (addMatch) {
      const left = evaluateExpr(addMatch.left);
      const right = evaluateExpr(addMatch.right);
      if (addMatch.op === '+') {
        if (typeof left === 'string' || typeof right === 'string') {
          return String(left) + String(right);
        }
        if (Array.isArray(left) && Array.isArray(right)) {
          return [...left, ...right];
        }
        return Number(left) + Number(right);
      }
      return Number(left) - Number(right);
    }

    // Multiplication / Division / Modulo / Power
    const mulMatch = findTopLevelOperator(trimmed, ['**', '//', '*', '/', '%']);
    if (mulMatch) {
      const left = evaluateExpr(mulMatch.left);
      const right = evaluateExpr(mulMatch.right);
      if (mulMatch.op === '*') {
        if (typeof left === 'string' && typeof right === 'number') return left.repeat(Math.max(0, right));
        if (typeof left === 'number' && typeof right === 'string') return right.repeat(Math.max(0, left));
        return Number(left) * Number(right);
      }
      if (mulMatch.op === '**') return Math.pow(Number(left), Number(right));
      if (mulMatch.op === '//') return Number(right) !== 0 ? Math.floor(Number(left) / Number(right)) : 0;
      if (mulMatch.op === '/') return Number(right) !== 0 ? Number(left) / Number(right) : 0;
      if (mulMatch.op === '%') return Number(right) !== 0 ? Number(left) % Number(right) : 0;
    }

    // Indexing: arr[idx]
    const idxMatch = trimmed.match(/^([a-zA-Z_]\w*)\[(.+)\]$/);
    if (idxMatch && Object.prototype.hasOwnProperty.call(variables, idxMatch[1])) {
      const target = variables[idxMatch[1]];
      let idx = Number(evaluateExpr(idxMatch[2]));
      if (idx < 0 && (Array.isArray(target) || typeof target === 'string')) {
        idx = target.length + idx;
      }
      return target?.[idx];
    }

    // String/list method calls like nama.upper(), nama.lower()
    const methodMatch = trimmed.match(/^([a-zA-Z_]\w*)\.(upper|lower|strip|title)\(\)$/);
    if (methodMatch && Object.prototype.hasOwnProperty.call(variables, methodMatch[1])) {
      const val = String(variables[methodMatch[1]]);
      if (methodMatch[2] === 'upper') return val.toUpperCase();
      if (methodMatch[2] === 'lower') return val.toLowerCase();
      if (methodMatch[2] === 'strip') return val.trim();
      if (methodMatch[2] === 'title') return val.replace(/\b\w/g, (c) => c.toUpperCase());
    }

    // Built-in / User function call: fn(arg1, arg2)
    const fnMatch = trimmed.match(/^([a-zA-Z_]\w*)\((.*)\)$/);
    if (fnMatch) {
      const fnName = fnMatch[1];
      const argsStr = fnMatch[2].trim();
      const argValues = argsStr ? splitTopLevel(argsStr, ',').map((a) => evaluateExpr(a)) : [];

      if (fnName === 'len') {
        const arg = argValues[0];
        return Array.isArray(arg) || typeof arg === 'string' ? arg.length : 0;
      }
      if (fnName === 'str') return formatValue(argValues[0]);
      if (fnName === 'int') return parseInt(argValues[0], 10) || 0;
      if (fnName === 'float') return parseFloat(argValues[0]) || 0;
      if (fnName === 'abs') return Math.abs(Number(argValues[0]) || 0);
      if (fnName === 'max') return Math.max(...argValues.map(Number));
      if (fnName === 'min') return Math.min(...argValues.map(Number));
      if (fnName === 'sum') return Array.isArray(argValues[0]) ? argValues[0].reduce((a, b) => a + Number(b), 0) : 0;
      if (fnName === 'type') {
        const v = argValues[0];
        if (typeof v === 'string') return "<class 'str'>";
        if (typeof v === 'boolean') return "<class 'bool'>";
        if (typeof v === 'number') return Number.isInteger(v) ? "<class 'int'>" : "<class 'float'>";
        if (Array.isArray(v)) return "<class 'list'>";
        return "<class 'NoneType'>";
      }
      if (functions[fnName]) {
        return invokeUserFunction(functions[fnName], argValues);
      }
    }

    // Variable lookup
    if (Object.prototype.hasOwnProperty.call(variables, trimmed)) {
      return variables[trimmed];
    }

    if (/^[a-zA-Z_]\w*$/.test(trimmed)) {
      throw new Error(`NameError: name '${trimmed}' is not defined`);
    }

    return trimmed;
  }

  function invokeUserFunction(fnDef, argValues) {
    const prevVars = { ...variables };
    fnDef.params.forEach((p, idx) => {
      variables[p] = argValues[idx] !== undefined ? argValues[idx] : null;
    });

    const res = executeBlock(fnDef.body);

    // Restore outer scope (keep globals created outside, restore params)
    fnDef.params.forEach((p) => {
      if (Object.prototype.hasOwnProperty.call(prevVars, p)) {
        variables[p] = prevVars[p];
      } else {
        delete variables[p];
      }
    });

    return res.returned ? res.value : null;
  }

  function getIndent(line) {
    const m = line.match(/^(\s*)/);
    return m ? m[1].length : 0;
  }

  function collectIndentedBlock(lines, startIdx, parentIndent) {
    const block = [];
    let idx = startIdx;
    while (idx < lines.length) {
      const raw = lines[idx];
      const cleaned = stripInlineComment(raw);
      if (!cleaned.trim()) {
        idx++;
        continue;
      }
      if (getIndent(raw) <= parentIndent) break;
      block.push(raw);
      idx++;
    }
    return { block, nextIdx: idx };
  }

  function executeStatement(trimmed) {
    if (!trimmed) return { returned: false };

    if (trimmed === 'return' || trimmed.startsWith('return ')) {
      const expr = trimmed.slice(6).trim();
      return { returned: true, value: expr ? evaluateExpr(expr) : null };
    }

    // print(...)
    if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
      const inside = trimmed.slice(6, -1);
      if (!inside.trim()) {
        output.push('');
        return { returned: false };
      }
      const args = splitTopLevel(inside, ',');
      const evaluatedArgs = args.map((arg) => formatValue(evaluateExpr(arg)));
      output.push(evaluatedArgs.join(' '));
      return { returned: false };
    }

    // list.append(val)
    const appendMatch = trimmed.match(/^([a-zA-Z_]\w*)\.append\((.+)\)$/);
    if (appendMatch && Array.isArray(variables[appendMatch[1]])) {
      variables[appendMatch[1]].push(evaluateExpr(appendMatch[2]));
      return { returned: false };
    }

    // Compound assignment: += -= *= /=
    const compAssign = trimmed.match(/^([a-zA-Z_]\w*)\s*(\+=|-=|\*=|\/=)\s*(.+)$/);
    if (compAssign) {
      const [, name, op, rhs] = compAssign;
      const cur = variables[name] ?? 0;
      const val = evaluateExpr(rhs);
      if (op === '+=') variables[name] = typeof cur === 'string' ? cur + String(val) : Number(cur) + Number(val);
      else if (op === '-=') variables[name] = Number(cur) - Number(val);
      else if (op === '*=') variables[name] = Number(cur) * Number(val);
      else if (op === '/=') variables[name] = Number(val) !== 0 ? Number(cur) / Number(val) : 0;
      return { returned: false };
    }

    // Assignment: var = val
    if (trimmed.includes('=')) {
      const eqIdx = trimmed.indexOf('=');
      const prevChar = trimmed[eqIdx - 1];
      const nextChar = trimmed[eqIdx + 1];
      if (prevChar !== '!' && prevChar !== '>' && prevChar !== '<' && nextChar !== '=') {
        const varName = trimmed.slice(0, eqIdx).trim();
        const expr = trimmed.slice(eqIdx + 1).trim();
        variables[varName] = evaluateExpr(expr);
        return { returned: false };
      }
    }

    // Standalone expression / function call
    evaluateExpr(trimmed);
    return { returned: false };
  }

  function executeBlock(lines) {
    let idx = 0;
    while (idx < lines.length) {
      const rawLine = lines[idx];
      const cleaned = stripInlineComment(rawLine);
      const trimmed = cleaned.trim();

      if (!trimmed) {
        idx++;
        continue;
      }

      const parentIndent = getIndent(rawLine);

      // Inline if: if cond: stmt
      if (trimmed.startsWith('if ') && trimmed.includes(':') && !trimmed.endsWith(':')) {
        const colonIdx = trimmed.indexOf(':');
        const cond = trimmed.slice(3, colonIdx).trim();
        const stmt = trimmed.slice(colonIdx + 1).trim();
        if (evaluateExpr(cond)) {
          const res = executeStatement(stmt);
          if (res.returned) return res;
        }
        idx++;
        continue;
      }

      // Block if / elif / else
      if (trimmed.startsWith('if ') && trimmed.endsWith(':')) {
        const branches = [];
        const cond = trimmed.slice(3, -1).trim();
        const first = collectIndentedBlock(lines, idx + 1, parentIndent);
        branches.push({ cond, block: first.block });
        idx = first.nextIdx;

        while (idx < lines.length) {
          const nextTrimmed = stripInlineComment(lines[idx]).trim();
          const nextIndent = getIndent(lines[idx]);
          if (nextIndent !== parentIndent) break;

          if (nextTrimmed.startsWith('elif ') && nextTrimmed.endsWith(':')) {
            const elifCond = nextTrimmed.slice(5, -1).trim();
            const collected = collectIndentedBlock(lines, idx + 1, parentIndent);
            branches.push({ cond: elifCond, block: collected.block });
            idx = collected.nextIdx;
          } else if (nextTrimmed === 'else:') {
            const collected = collectIndentedBlock(lines, idx + 1, parentIndent);
            branches.push({ cond: null, block: collected.block });
            idx = collected.nextIdx;
            break;
          } else {
            break;
          }
        }

        for (const br of branches) {
          if (br.cond === null || Boolean(evaluateExpr(br.cond))) {
            const res = executeBlock(br.block);
            if (res.returned) return res;
            break;
          }
        }
        continue;
      }

      // Inline for loop: for x in range(5): print(x)
      if (trimmed.startsWith('for ') && trimmed.includes(':') && !trimmed.endsWith(':')) {
        const colonIdx = trimmed.indexOf(':');
        const header = trimmed.slice(0, colonIdx + 1);
        const stmt = trimmed.slice(colonIdx + 1).trim();
        const synthetic = [header, '    ' + stmt];
        const res = executeBlock(synthetic);
        if (res.returned) return res;
        idx++;
        continue;
      }

      // Block for loop: for x in range(...) or for x in list:
      if (trimmed.startsWith('for ') && trimmed.endsWith(':')) {
        const collected = collectIndentedBlock(lines, idx + 1, parentIndent);
        idx = collected.nextIdx;

        const rangeMatch = trimmed.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+range\(([^)]+)\):$/);
        if (rangeMatch) {
          const varName = rangeMatch[1];
          const rangeArgs = splitTopLevel(rangeMatch[2], ',').map((x) => Number(evaluateExpr(x)) || 0);
          let start = 0;
          let end = 0;
          let step = 1;
          if (rangeArgs.length === 1) {
            end = rangeArgs[0];
          } else if (rangeArgs.length === 2) {
            start = rangeArgs[0];
            end = rangeArgs[1];
          } else if (rangeArgs.length >= 3) {
            start = rangeArgs[0];
            end = rangeArgs[1];
            step = rangeArgs[2] || 1;
          }

          let count = 0;
          for (let cur = start; step > 0 ? cur < end : cur > end; cur += step) {
            if (++count > 200) break;
            variables[varName] = cur;
            const res = executeBlock(collected.block);
            if (res.returned) return res;
          }
          continue;
        }

        const iterMatch = trimmed.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+(.+):$/);
        if (iterMatch) {
          const varName = iterMatch[1];
          const iterable = evaluateExpr(iterMatch[2]);
          const items = Array.isArray(iterable) ? iterable : typeof iterable === 'string' ? iterable.split('') : [];
          for (let k = 0; k < Math.min(items.length, 200); k++) {
            variables[varName] = items[k];
            const res = executeBlock(collected.block);
            if (res.returned) return res;
          }
          continue;
        }
        continue;
      }

      // While loop: while cond:
      if (trimmed.startsWith('while ') && trimmed.endsWith(':')) {
        const condExpr = trimmed.slice(6, -1).trim();
        const collected = collectIndentedBlock(lines, idx + 1, parentIndent);
        idx = collected.nextIdx;
        let guard = 0;
        while (Boolean(evaluateExpr(condExpr)) && guard < 200) {
          guard++;
          const res = executeBlock(collected.block);
          if (res.returned) return res;
        }
        continue;
      }

      // Inline def: def sapa(): print("Halo!")
      if (trimmed.startsWith('def ') && trimmed.includes(':') && !trimmed.endsWith(':')) {
        const colonIdx = trimmed.indexOf(':');
        const header = trimmed.slice(0, colonIdx).trim();
        const stmt = trimmed.slice(colonIdx + 1).trim();
        const fnMatch = header.match(/^def\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)$/);
        if (fnMatch) {
          const params = fnMatch[2]
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean);
          functions[fnMatch[1]] = { params, body: ['    ' + stmt] };
        }
        idx++;
        continue;
      }

      // Block def: def fn(args):
      if (trimmed.startsWith('def ') && trimmed.endsWith(':')) {
        const fnMatch = trimmed.match(/^def\s+([a-zA-Z_]\w*)\s*\(([^)]*)\):$/);
        const collected = collectIndentedBlock(lines, idx + 1, parentIndent);
        idx = collected.nextIdx;
        if (fnMatch) {
          const params = fnMatch[2]
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean);
          functions[fnMatch[1]] = { params, body: collected.block };
        }
        continue;
      }

      const res = executeStatement(trimmed);
      if (res.returned) return res;
      idx++;
    }
    return { returned: false };
  }

  try {
    executeBlock(rawLines);
    return { output, error: null };
  } catch (err) {
    return {
      output,
      error: err.message || 'RuntimeError',
    };
  }
}
