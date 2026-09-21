/**
 * phpRunner.js — In-browser PHP simulator for educational coding quests
 */

export function runPhpCode(sourceCode) {
  const output = [];
  if (!sourceCode || !sourceCode.trim()) {
    return { output: [], error: null };
  }

  // Pre-process: strip <?php and ?>
  let code = sourceCode.trim();
  code = code.replace(/^\s*<\?(?:php)?/i, '').replace(/\?>\s*$/i, '');

  const variables = {};
  const functions = {};

  function evaluatePhpExpr(expr) {
    let trimmed = expr.trim();
    if (!trimmed) return '';

    // Handle concatenation with '.'
    const dotParts = splitTopLevel(trimmed, '.');
    if (dotParts.length > 1) {
      return dotParts.map(p => String(evaluatePhpExpr(p))).join('');
    }

    // String literal "..." or '...'
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      let content = trimmed.slice(1, -1);
      // Replace inline variables in double quotes like "Halo $nama"
      if (trimmed.startsWith('"')) {
        content = content.replace(/\$([a-zA-Z_]\w*)/g, (_, varName) => {
          return variables[varName] !== undefined ? variables[varName] : '$' + varName;
        });
      }
      return content;
    }

    // Number literal
    if (!isNaN(Number(trimmed)) && trimmed !== '') {
      return Number(trimmed);
    }

    // Boolean
    if (trimmed.toLowerCase() === 'true') return true;
    if (trimmed.toLowerCase() === 'false') return false;

    // Array: [...] or array(...)
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('array(') && trimmed.endsWith(')'))
    ) {
      const itemsStr = trimmed.startsWith('[')
        ? trimmed.slice(1, -1).trim()
        : trimmed.slice(6, -1).trim();
      if (!itemsStr) return [];
      const parts = splitTopLevel(itemsStr, ',');
      return parts.map(p => evaluatePhpExpr(p));
    }

    // Variable: $varName
    if (trimmed.startsWith('$')) {
      const varName = trimmed.slice(1);
      if (Object.prototype.hasOwnProperty.call(variables, varName)) {
        return variables[varName];
      }
      return null;
    }

    // Binary Math: + - * / %
    const mathOps = ['+', '-', '*', '/', '%'];
    for (const op of mathOps) {
      if (trimmed.includes(op)) {
        const parts = splitTopLevel(trimmed, op);
        if (parts.length === 2) {
          const left = evaluatePhpExpr(parts[0]);
          const right = evaluatePhpExpr(parts[1]);
          if (typeof left === 'number' && typeof right === 'number') {
            if (op === '+') return left + right;
            if (op === '-') return left - right;
            if (op === '*') return left * right;
            if (op === '/') return right !== 0 ? left / right : 0;
            if (op === '%') return right !== 0 ? left % right : 0;
          }
          if (op === '+') return String(left) + String(right);
        }
      }
    }

    // Comparison
    const compOps = ['===', '!==', '==', '!=', '>=', '<=', '>', '<'];
    for (const op of compOps) {
      if (trimmed.includes(op)) {
        const parts = splitTopLevel(trimmed, op);
        if (parts.length === 2) {
          const left = evaluatePhpExpr(parts[0]);
          const right = evaluatePhpExpr(parts[1]);
          if (op === '===' || op === '==') return left == right;
          if (op === '!==' || op === '!=') return left != right;
          if (op === '>=') return left >= right;
          if (op === '<=') return left <= right;
          if (op === '>') return left > right;
          if (op === '<') return left < right;
        }
      }
    }

    // Function call: sapa($nama)
    const fnMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*\((.*)\)$/s);
    if (fnMatch) {
      const fnName = fnMatch[1];
      const argsStr = fnMatch[2].trim();
      const argValues = argsStr ? splitTopLevel(argsStr, ',').map(a => evaluatePhpExpr(a)) : [];
      if (functions[fnName]) {
        return executeFunction(functions[fnName], argValues);
      }
    }

    return trimmed;
  }

  function executeFunction(fnDef, argValues) {
    const prevVars = { ...variables };
    fnDef.paramNames.forEach((name, i) => {
      variables[name] = argValues[i] !== undefined ? argValues[i] : null;
    });

    let returnVal = null;
    for (const statement of fnDef.bodyStatements) {
      if (statement.startsWith('return ')) {
        const retExpr = statement.slice(7).trim();
        returnVal = evaluatePhpExpr(retExpr);
        break;
      }
      executeStatement(statement);
    }

    Object.keys(variables).forEach(k => delete variables[k]);
    Object.assign(variables, prevVars);
    return returnVal;
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
          parts.push(current.trim());
          current = '';
          i += separator.length - 1;
          continue;
        }
      }
      current += char;
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
  }

  function executeStatement(line) {
    let stmt = line.trim();
    if (!stmt || stmt.startsWith('//') || stmt.startsWith('#')) return;
    if (stmt.endsWith(';')) stmt = stmt.slice(0, -1).trim();

    // echo or print
    if (stmt.startsWith('echo ') || stmt.startsWith('print ')) {
      const expr = stmt.replace(/^(echo|print)\s+/, '');
      const val = evaluatePhpExpr(expr);
      output.push(String(val));
      return;
    }

    // Variable assignment: $var = expr
    if (stmt.startsWith('$')) {
      const eqIdx = stmt.indexOf('=');
      if (eqIdx !== -1) {
        const varName = stmt.slice(1, eqIdx).trim();
        const expr = stmt.slice(eqIdx + 1).trim();
        variables[varName] = evaluatePhpExpr(expr);
        return;
      }
    }
  }

  try {
    // Process code blocks like if, foreach, functions
    const lines = code.split('\n');
    let i = 0;
    while (i < lines.length) {
      let line = lines[i].trim();
      if (!line || line.startsWith('//') || line.startsWith('#')) {
        i++;
        continue;
      }

      // Function definition: function sapa($nama) { ... }
      if (line.startsWith('function ')) {
        const headerMatch = line.match(/function\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)/);
        if (headerMatch) {
          const fnName = headerMatch[1];
          const rawParams = headerMatch[2].split(',').map(p => p.trim().replace(/^\$/, '')).filter(Boolean);
          const bodyStatements = [];
          i++;
          while (i < lines.length && !lines[i].includes('}')) {
            const bodyLine = lines[i].trim().replace(/;$/, '');
            if (bodyLine) bodyStatements.push(bodyLine);
            i++;
          }
          functions[fnName] = { paramNames: rawParams, bodyStatements };
          i++;
          continue;
        }
      }

      // Foreach loop: foreach ($buah as $item) { ... }
      if (line.startsWith('foreach')) {
        const feMatch = line.match(/foreach\s*\(\s*\$([a-zA-Z_]\w*)\s+as\s+\$([a-zA-Z_]\w*)\s*\)/);
        if (feMatch) {
          const arrName = feMatch[1];
          const itemVar = feMatch[2];
          const arr = Array.isArray(variables[arrName]) ? variables[arrName] : [];
          const loopLines = [];
          i++;
          while (i < lines.length && !lines[i].includes('}')) {
            const l = lines[i].trim();
            if (l) loopLines.push(l);
            i++;
          }
          for (const val of arr) {
            variables[itemVar] = val;
            for (const l of loopLines) {
              executeStatement(l);
            }
          }
          i++;
          continue;
        }
      }

      // If statement: if (...) { ... }
      if (line.startsWith('if')) {
        const condMatch = line.match(/if\s*\((.*)\)/);
        if (condMatch) {
          const cond = evaluatePhpExpr(condMatch[1]);
          const ifLines = [];
          i++;
          while (i < lines.length && !lines[i].includes('}')) {
            const l = lines[i].trim();
            if (l) ifLines.push(l);
            i++;
          }
          if (cond) {
            for (const l of ifLines) {
              executeStatement(l);
            }
          }
          i++;
          continue;
        }
      }

      // Single statements ending in ;
      executeStatement(line);
      i++;
    }

    return { output, error: null };
  } catch (err) {
    return { output, error: err.message };
  }
}
