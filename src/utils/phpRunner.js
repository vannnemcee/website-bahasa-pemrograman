/**
 * phpRunner.js — In-browser PHP simulator for educational coding quests
 */

function stripPhpComments(code) {
  let out = '';
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    const next = code[i + 1] || '';
    const prev = i > 0 ? code[i - 1] : '';

    if (ch === "'" && !inDouble && prev !== '\\') {
      inSingle = !inSingle;
      out += ch;
    } else if (ch === '"' && !inSingle && prev !== '\\') {
      inDouble = !inDouble;
      out += ch;
    } else if (!inSingle && !inDouble && ((ch === '/' && next === '/') || ch === '#')) {
      while (i < code.length && code[i] !== '\n') i++;
      out += '\n';
    } else if (!inSingle && !inDouble && ch === '/' && next === '*') {
      i += 2;
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) i++;
      i++;
    } else {
      out += ch;
    }
  }
  return out;
}

function splitTopLevel(str, separator) {
  const parts = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  let parenDepth = 0;
  let braceDepth = 0;
  let bracketDepth = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if ((char === '"' || char === "'") && (i === 0 || str[i - 1] !== '\\')) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (quoteChar === char) {
        inQuotes = false;
      }
    }
    if (!inQuotes) {
      if (char === '(') parenDepth++;
      else if (char === ')') parenDepth--;
      else if (char === '{') braceDepth++;
      else if (char === '}') braceDepth--;
      else if (char === '[') bracketDepth++;
      else if (char === ']') bracketDepth--;
      else if (
        str.slice(i, i + separator.length) === separator &&
        parenDepth === 0 &&
        braceDepth === 0 &&
        bracketDepth === 0
      ) {
        // Do not split decimal numbers like 3.14 on '.'
        const isDecimalDot =
          separator === '.' &&
          /\d$/.test(current) &&
          /^\d/.test(str.slice(i + 1));
        if (!isDecimalDot) {
          parts.push(current.trim());
          current = '';
          i += separator.length - 1;
          continue;
        }
      }
    }
    current += char;
  }
  if (current.trim() !== '') parts.push(current.trim());
  return parts;
}

function parsePhpNodes(src) {
  const nodes = [];
  let i = 0;
  const len = src.length;

  function skipWs() {
    while (i < len && /\s/.test(src[i])) i++;
  }

  function readBalanced(openCh, closeCh) {
    let depth = 0;
    let inSingle = false;
    let inDouble = false;
    const start = i;
    while (i < len) {
      const ch = src[i];
      const prev = i > 0 ? src[i - 1] : '';
      if (ch === "'" && !inDouble && prev !== '\\') inSingle = !inSingle;
      else if (ch === '"' && !inSingle && prev !== '\\') inDouble = !inDouble;
      else if (!inSingle && !inDouble) {
        if (ch === openCh) depth++;
        else if (ch === closeCh) {
          depth--;
          if (depth === 0) {
            i++;
            return src.slice(start + 1, i - 1);
          }
        }
      }
      i++;
    }
    return src.slice(start + 1);
  }

  while (i < len) {
    skipWs();
    if (i >= len) break;

    const rest = src.slice(i);

    // function name(params) { ... }
    const fnMatch = rest.match(/^function\s+([a-zA-Z_]\w*)\s*\(/);
    if (fnMatch) {
      i += rest.indexOf('(');
      const paramsRaw = readBalanced('(', ')');
      skipWs();
      if (src[i] === '{') {
        const bodyRaw = readBalanced('{', '}');
        nodes.push({
          type: 'function',
          name: fnMatch[1],
          params: paramsRaw.split(',').map((p) => p.trim().replace(/^\$/, '')).filter(Boolean),
          body: parsePhpNodes(bodyRaw),
        });
        continue;
      }
    }

    // foreach (...) { ... }
    if (/^foreach\s*\(/.test(rest)) {
      i += rest.indexOf('(');
      const condRaw = readBalanced('(', ')');
      skipWs();
      if (src[i] === '{') {
        const bodyRaw = readBalanced('{', '}');
        nodes.push({
          type: 'foreach',
          header: condRaw.trim(),
          body: parsePhpNodes(bodyRaw),
        });
        continue;
      }
    }

    // for (...) { ... }
    if (/^for\s*\(/.test(rest)) {
      i += rest.indexOf('(');
      const condRaw = readBalanced('(', ')');
      skipWs();
      if (src[i] === '{') {
        const bodyRaw = readBalanced('{', '}');
        nodes.push({
          type: 'for',
          header: condRaw.trim(),
          body: parsePhpNodes(bodyRaw),
        });
        continue;
      }
    }

    // if (...) { ... } [else { ... }]
    if (/^if\s*\(/.test(rest)) {
      i += rest.indexOf('(');
      const condRaw = readBalanced('(', ')');
      skipWs();
      let thenBody = [];
      let elseBody = [];
      if (src[i] === '{') {
        thenBody = parsePhpNodes(readBalanced('{', '}'));
      }
      skipWs();
      if (/^else\b/.test(src.slice(i))) {
        i += 4;
        skipWs();
        if (src[i] === '{') {
          elseBody = parsePhpNodes(readBalanced('{', '}'));
        }
      }
      nodes.push({ type: 'if', cond: condRaw.trim(), thenBody, elseBody });
      continue;
    }

    // Regular statement until ; or newline if omitted
    let stmt = '';
    let inSingle = false;
    let inDouble = false;
    let parenDepth = 0;
    let bracketDepth = 0;
    while (i < len) {
      const ch = src[i];
      const prev = i > 0 ? src[i - 1] : '';
      if (ch === "'" && !inDouble && prev !== '\\') inSingle = !inSingle;
      else if (ch === '"' && !inSingle && prev !== '\\') inDouble = !inDouble;
      else if (!inSingle && !inDouble) {
        if (ch === '(') parenDepth++;
        else if (ch === ')') parenDepth--;
        else if (ch === '[') bracketDepth++;
        else if (ch === ']') bracketDepth--;
        else if (ch === ';' && parenDepth === 0 && bracketDepth === 0) {
          i++;
          break;
        } else if (ch === '\n' && parenDepth === 0 && bracketDepth === 0 && stmt.trim()) {
          i++;
          break;
        }
      }
      stmt += ch;
      i++;
    }
    if (stmt.trim()) {
      nodes.push({ type: 'stmt', code: stmt.trim() });
    }
  }
  return nodes;
}

export function runPhpCode(sourceCode) {
  const output = [];
  if (!sourceCode || !sourceCode.trim()) {
    return { output: [], error: null };
  }

  let code = sourceCode.trim();
  code = code.replace(/^\s*<\?(?:php)?/i, '').replace(/\?>\s*$/i, '');
  code = stripPhpComments(code);

  const variables = {};
  const functions = {};

  function evaluatePhpExpr(expr) {
    let trimmed = expr.trim();
    if (!trimmed) return '';

    // Number literal (check before '.' concatenation so 3.14 stays 3.14)
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return Number(trimmed);
    }

    // String concatenation with '.'
    const dotParts = splitTopLevel(trimmed, '.');
    if (dotParts.length > 1) {
      return dotParts.map((p) => String(evaluatePhpExpr(p))).join('');
    }

    // String literal "..." or '...'
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      let content = trimmed.slice(1, -1);
      content = content.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
      if (trimmed.startsWith('"')) {
        content = content.replace(/\$([a-zA-Z_]\w*)/g, (_, varName) =>
          variables[varName] !== undefined ? String(variables[varName]) : '$' + varName
        );
      }
      return content;
    }

    if (trimmed.toLowerCase() === 'true') return true;
    if (trimmed.toLowerCase() === 'false') return false;
    if (trimmed.toLowerCase() === 'null') return null;

    // Array: [...] or array(...)
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('array(') && trimmed.endsWith(')'))
    ) {
      const itemsStr = trimmed.startsWith('[')
        ? trimmed.slice(1, -1).trim()
        : trimmed.slice(6, -1).trim();
      if (!itemsStr) return [];
      return splitTopLevel(itemsStr, ',').map((p) => evaluatePhpExpr(p));
    }

    // Comparisons
    const compOps = ['===', '!==', '==', '!=', '>=', '<=', '>', '<'];
    for (const op of compOps) {
      const parts = splitTopLevel(trimmed, op);
      if (parts.length === 2) {
        const left = evaluatePhpExpr(parts[0]);
        const right = evaluatePhpExpr(parts[1]);
        if (op === '===') return left === right;
        if (op === '!==') return left !== right;
        if (op === '==') return left == right;
        if (op === '!=') return left != right;
        if (op === '>=') return left >= right;
        if (op === '<=') return left <= right;
        if (op === '>') return left > right;
        if (op === '<') return left < right;
      }
    }

    // Math: + - * / %
    for (const op of ['+', '-', '*', '/', '%']) {
      const parts = splitTopLevel(trimmed, op);
      if (parts.length === 2 && parts[0] !== '') {
        const left = evaluatePhpExpr(parts[0]);
        const right = evaluatePhpExpr(parts[1]);
        if (op === '+') return Number(left) + Number(right);
        if (op === '-') return Number(left) - Number(right);
        if (op === '*') return Number(left) * Number(right);
        if (op === '/') return Number(right) !== 0 ? Number(left) / Number(right) : 0;
        if (op === '%') return Number(right) !== 0 ? Number(left) % Number(right) : 0;
      }
    }

    // Array index: $arr[0]
    const arrIdxMatch = trimmed.match(/^\$([a-zA-Z_]\w*)\[(.+)\]$/);
    if (arrIdxMatch && Array.isArray(variables[arrIdxMatch[1]])) {
      const idx = evaluatePhpExpr(arrIdxMatch[2]);
      return variables[arrIdxMatch[1]][idx];
    }

    // Variable: $varName
    if (/^\$[a-zA-Z_]\w*$/.test(trimmed)) {
      const varName = trimmed.slice(1);
      return Object.prototype.hasOwnProperty.call(variables, varName) ? variables[varName] : null;
    }

    // Function call: count($x) or user function sapa($nama)
    const fnMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*\((.*)\)$/s);
    if (fnMatch) {
      const fnName = fnMatch[1];
      const argsStr = fnMatch[2].trim();
      const argValues = argsStr ? splitTopLevel(argsStr, ',').map((a) => evaluatePhpExpr(a)) : [];
      if (fnName === 'count') return Array.isArray(argValues[0]) ? argValues[0].length : 0;
      if (fnName === 'strlen') return String(argValues[0] ?? '').length;
      if (fnName === 'strtoupper') return String(argValues[0] ?? '').toUpperCase();
      if (fnName === 'strtolower') return String(argValues[0] ?? '').toLowerCase();
      if (functions[fnName]) {
        return executeFunction(functions[fnName], argValues);
      }
    }

    return trimmed;
  }

  function executeFunction(fnDef, argValues) {
    const prevVars = { ...variables };
    fnDef.params.forEach((name, idx) => {
      variables[name] = argValues[idx] !== undefined ? argValues[idx] : null;
    });
    const res = executeNodes(fnDef.body);
    Object.keys(variables).forEach((k) => delete variables[k]);
    Object.assign(variables, prevVars);
    return res.returned ? res.value : null;
  }

  function executeStatement(stmt) {
    if (!stmt) return { returned: false };

    if (stmt === 'return' || stmt.startsWith('return ')) {
      const expr = stmt.slice(6).trim();
      return { returned: true, value: expr ? evaluatePhpExpr(expr) : null };
    }

    if (stmt.startsWith('echo ') || stmt.startsWith('print ')) {
      const expr = stmt.replace(/^(echo|print)\s+/, '');
      const val = evaluatePhpExpr(expr);
      const str = Array.isArray(val) ? `[${val.join(', ')}]` : String(val ?? '');
      str.split('\n').forEach((line, idx, arr) => {
        if (idx === arr.length - 1 && line === '' && arr.length > 1) return;
        output.push(line);
      });
      return { returned: false };
    }

    // $i++ or $i--
    const incMatch = stmt.match(/^\$([a-zA-Z_]\w*)(\+\+|--)$/);
    if (incMatch) {
      const [, name, op] = incMatch;
      variables[name] = (Number(variables[name]) || 0) + (op === '++' ? 1 : -1);
      return { returned: false };
    }

    // Assignment: $var = expr
    if (stmt.startsWith('$')) {
      const eqIdx = stmt.indexOf('=');
      if (eqIdx !== -1) {
        const varName = stmt.slice(1, eqIdx).trim();
        const expr = stmt.slice(eqIdx + 1).trim();
        variables[varName] = evaluatePhpExpr(expr);
        return { returned: false };
      }
    }

    evaluatePhpExpr(stmt);
    return { returned: false };
  }

  function executeNodes(nodes) {
    for (const node of nodes) {
      if (node.type === 'function') {
        functions[node.name] = { params: node.params, body: node.body };
      } else if (node.type === 'if') {
        const condVal = Boolean(evaluatePhpExpr(node.cond));
        const res = executeNodes(condVal ? node.thenBody : node.elseBody);
        if (res.returned) return res;
      } else if (node.type === 'foreach') {
        const feMatch = node.header.match(/^\$([a-zA-Z_]\w*)\s+as\s+\$([a-zA-Z_]\w*)$/);
        if (feMatch) {
          const arr = Array.isArray(variables[feMatch[1]]) ? variables[feMatch[1]] : [];
          for (const val of arr) {
            variables[feMatch[2]] = val;
            const res = executeNodes(node.body);
            if (res.returned) return res;
          }
        }
      } else if (node.type === 'for') {
        const parts = node.header.split(';').map((s) => s.trim());
        if (parts.length === 3) {
          executeStatement(parts[0]);
          let guard = 0;
          while (Boolean(evaluatePhpExpr(parts[1])) && guard < 200) {
            guard++;
            const res = executeNodes(node.body);
            if (res.returned) return res;
            executeStatement(parts[2]);
          }
        }
      } else if (node.type === 'stmt') {
        const res = executeStatement(node.code);
        if (res.returned) return res;
      }
    }
    return { returned: false };
  }

  try {
    const ast = parsePhpNodes(code);
    executeNodes(ast);
    return { output, error: null };
  } catch (err) {
    return { output, error: err.message };
  }
}
