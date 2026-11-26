/**
 * validators.js — Validasi jawaban kode yang akurat namun fleksibel terhadap variasi sintaks yang sah.
 * Mengembalikan { valid: boolean, reason?: string }
 */
import { runPythonCode } from './pythonRunner.js';
import { runPhpCode } from './phpRunner.js';
import { runTypeScriptCode } from './typescriptRunner.js';
import { runJavaCode } from './javaRunner.js';
import { runCppCode } from './cppRunner.js';
import { runGoCode } from './goRunner.js';
import { runSqlCode } from './sqlRunner.js';

function stripSlashComments(code) {
  let out = '';
  let inStr = null;
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    const next = code[i + 1] || '';
    const prev = i > 0 ? code[i - 1] : '';
    if (!inStr && (ch === '"' || ch === "'" || ch === '`')) {
      inStr = ch;
      out += ch;
    } else if (inStr && ch === inStr && prev !== '\\') {
      inStr = null;
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

function stripHashComments(code) {
  return code
    .split('\n')
    .map((line) => {
      let inStr = null;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        const prev = i > 0 ? line[i - 1] : '';
        if (!inStr && (ch === '"' || ch === "'")) inStr = ch;
        else if (inStr && ch === inStr && prev !== '\\') inStr = null;
        else if (!inStr && ch === '#') return line.slice(0, i);
      }
      return line;
    })
    .join('\n');
}

function stripSqlComments(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((line) => line.replace(/--.*$/, ''))
    .join(' ');
}

function normalizeCode(str, { normalizeVarKeywords = false } = {}) {
  let s = str;
  if (normalizeVarKeywords) {
    // PENTING: ganti let/const/var SEBELUM menghapus spasi agar word boundary (\b) tetap bekerja!
    s = s.replace(/\b(var|const)\b/g, 'let');
  }
  return s
    .replace(/\s+/g, '')
    .replace(/;/g, '')
    .replace(/['"`]/g, '"')
    .toLowerCase();
}

function collapseWs(str) {
  return String(str || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

/* ================= CSS VALIDATION ================= */
const CSS_COLOR_ALIASES = {
  red: ['red', '#ff0000', '#f00', 'rgb(255,0,0)'],
  blue: ['blue', '#0000ff', '#00f', 'rgb(0,0,255)'],
  black: ['black', '#000000', '#000', 'rgb(0,0,0)'],
  white: ['white', '#ffffff', '#fff', 'rgb(255,255,255)'],
  green: ['green', '#008000', 'rgb(0,128,0)'],
};

function normalizeCssValue(val) {
  return val
    .replace(/!important/gi, '')
    .trim()
    .toLowerCase()
    .replace(/\b0(?:px|em|rem|pt|%)\b/g, '0')
    .replace(/\s*,\s*/g, ',')
    .replace(/\s+/g, ' ');
}

function cssValuesMatch(actualRaw, expectedRaw, prop) {
  const actual = normalizeCssValue(actualRaw);
  const expected = normalizeCssValue(expectedRaw);
  if (actual === expected) return true;

  // Color alias match
  for (const aliases of Object.values(CSS_COLOR_ALIASES)) {
    const aNorm = actual.replace(/\s+/g, '');
    const eNorm = expected.replace(/\s+/g, '');
    if (aliases.includes(eNorm) && aliases.includes(aNorm)) return true;
  }

  // Token-order / color-alias match for shorthand like `border: 2px solid black` or `box-shadow: 4px 4px 0 black`
  if (prop === 'border' || prop === 'box-shadow') {
    const normalizeTokens = (str) =>
      str.split(' ').map((tok) => {
        for (const [canon, aliases] of Object.entries(CSS_COLOR_ALIASES)) {
          if (aliases.includes(tok.replace(/\s+/g, ''))) return canon;
        }
        return tok;
      });
    const actualTokens = normalizeTokens(actual);
    const expectedTokens = normalizeTokens(expected);

    if (prop === 'border') {
      return (
        actualTokens.length === expectedTokens.length &&
        expectedTokens.every((t) => actualTokens.includes(t))
      );
    }
    if (prop === 'box-shadow') {
      return actualTokens.join(' ') === expectedTokens.join(' ');
    }
  }

  return false;
}

function parseCssDeclarations(code) {
  const clean = code.replace(/\/\*[\s\S]*?\*\//g, '').trim();
  // Support both bare declarations (`color: red;`) and selector blocks (`p { color: red; }`)
  const inner = clean.includes('{')
    ? clean
        .replace(/[^{}]*\{/g, '')
        .replace(/\}/g, ';')
    : clean;

  const decls = [];
  inner.split(';').forEach((part) => {
    const idx = part.indexOf(':');
    if (idx !== -1) {
      const prop = part.slice(0, idx).trim().toLowerCase();
      const val = part.slice(idx + 1).trim();
      if (prop && val) decls.push({ prop, val });
    }
  });
  return decls;
}

/* ================= MAIN CHECKER ================= */
export function checkAnswer(code, lesson) {
  if (!code || !code.trim()) {
    return { valid: false, reason: 'Editor masih kosong. Ketik kode sesuai instruksi misi.' };
  }

  const { checkType, checkConfig } = lesson;

  /* ---- HTML ---- */
  if (checkType === 'html-element') {
    const { tag, text, requireAttr } = checkConfig;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, 'text/html');
      const elements = Array.from(doc.querySelectorAll(tag));
      if (elements.length === 0) {
        return { valid: false, reason: `Tag <${tag}> belum ditemukan.` };
      }

      const matched = elements.some((el) => {
        if (requireAttr && !el.hasAttribute(requireAttr)) return false;
        if (tag === 'form' && checkConfig.requireButton) {
          const btn = el.querySelector('button, input[type="submit"]');
          if (!btn) return false;
        }
        if (!text) return true;
        const elText = collapseWs(el.textContent);
        if (Array.isArray(text)) {
          return text.some((t) => elText === t.toLowerCase() || elText.includes(t.toLowerCase()));
        }
        const target = collapseWs(text);
        return elText === target || elText.includes(target);
      });

      if (!matched) {
        return {
          valid: false,
          reason: `Pastikan tag <${tag}> berisi teks "${text}"${requireAttr ? ` dan memiliki atribut ${requireAttr}` : ''}.`,
        };
      }
      return { valid: true };
    } catch {
      return { valid: false, reason: 'Kode HTML gagal diparsing.' };
    }
  }

  if (checkType === 'html-img') {
    const { src, alt } = checkConfig;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, 'text/html');
      const img = doc.querySelector('img');
      if (!img) return { valid: false, reason: 'Tag <img> belum ditemukan.' };
      const actualSrc = (img.getAttribute('src') || '').trim().replace(/^\.\//, '').toLowerCase();
      const actualAlt = collapseWs(img.getAttribute('alt'));
      if (actualSrc !== src.toLowerCase()) {
        return { valid: false, reason: `Atribut src harus bernilai "${src}".` };
      }
      if (alt && actualAlt !== collapseWs(alt)) {
        return { valid: false, reason: `Atribut alt harus bernilai "${alt}".` };
      }
      return { valid: true };
    } catch {
      return { valid: false, reason: 'Tag <img> tidak valid.' };
    }
  }

  if (checkType === 'html-input') {
    const { type, placeholder } = checkConfig;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, 'text/html');
      const input = doc.querySelector('input');
      if (!input) return { valid: false, reason: 'Tag <input> belum ditemukan.' };
      const typeMatch =
        !type || (input.getAttribute('type') || 'text').trim().toLowerCase() === type.toLowerCase();
      const phMatch =
        !placeholder || collapseWs(input.getAttribute('placeholder')).includes(collapseWs(placeholder));
      if (!typeMatch || !phMatch) {
        return {
          valid: false,
          reason: `Pastikan <input> bertipe "${type}" dengan placeholder "${placeholder}".`,
        };
      }
      return { valid: true };
    } catch {
      return { valid: false, reason: 'Tag <input> tidak valid.' };
    }
  }

  if (checkType === 'html-list') {
    const { parent, child, text } = checkConfig;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, 'text/html');
      const p = doc.querySelector(parent || 'ul');
      if (!p) return { valid: false, reason: `Tag <${parent || 'ul'}> belum ditemukan.` };
      const items = Array.from(p.querySelectorAll(child || 'li'));
      if (items.length === 0) return { valid: false, reason: `Tag <${child || 'li'}> di dalam <${parent || 'ul'}> belum ada.` };
      if (text && !items.some((c) => collapseWs(c.textContent).includes(collapseWs(text)))) {
        return { valid: false, reason: `Isi <li> harus memuat teks "${text}".` };
      }
      return { valid: true };
    } catch {
      return { valid: false, reason: 'Struktur list HTML tidak valid.' };
    }
  }

  /* ---- CSS ---- */
  if (checkType === 'css-property') {
    const { property, value } = checkConfig;
    const decls = parseCssDeclarations(code);
    const matched = decls.some((d) => {
      const propMatches =
        d.prop === property.toLowerCase() ||
        (property === 'background-color' && d.prop === 'background');
      return propMatches && cssValuesMatch(d.val, value, property);
    });
    if (!matched) {
      return { valid: false, reason: `Pastikan properti "${property}: ${value};" ditulis dengan benar.` };
    }
    return { valid: true };
  }

  /* ---- JAVASCRIPT ---- */
  if (checkType === 'js-pattern') {
    const { pattern } = checkConfig;
    const cleanCode = stripSlashComments(code);

    // Check JS syntax validity via Function constructor
    try {
      new Function(cleanCode);
    } catch (err) {
      return { valid: false, reason: `SyntaxError JavaScript: ${err.message}` };
    }

    const norm = normalizeCode(cleanCode, { normalizeVarKeywords: true });
    const normPat = normalizeCode(pattern, { normalizeVarKeywords: true });

    if (norm.includes(normPat)) return { valid: true };

    // Lesson 1: console.log("Hello World")
    if (normPat.includes('console.log("helloworld")')) {
      if (norm.includes('console.log("helloworld")') || norm.includes('console.log("hello","world")')) {
        return { valid: true };
      }
    }

    // Lesson 3: variable nama = "Budi" (supports let/const/var)
    if (normPat.includes('letnama="budi"')) {
      if (norm.includes('letnama="budi"') || norm.includes('nama="budi"')) return { valid: true };
    }

    // Lesson 4: hasil = 5 + 3 (supports let/const/var & commutative 3 + 5)
    if (normPat.includes('lethasil=5+3')) {
      if (
        norm.includes('lethasil=5+3') ||
        norm.includes('lethasil=3+5') ||
        norm.includes('hasil=5+3') ||
        norm.includes('hasil=3+5')
      ) {
        return { valid: true };
      }
    }

    // Lesson 5: if statement (with or without braces, supports 3 < 5)
    if (normPat.includes('if(5>3)')) {
      const hasIf = norm.includes('if(5>3)') || norm.includes('if(3<5)');
      const hasLog = norm.includes('console.log("benar")');
      if (hasIf && hasLog) return { valid: true };
    }

    // Lesson 6: function sapa() { console.log("Halo!"); }
    if (normPat.includes('functionsapa()')) {
      if (norm.includes('functionsapa()') && norm.includes('console.log("halo!")')) return { valid: true };
    }

    // Lesson 7: Arrow function (supports block {} and concise expression body, const/let/var)
    if (normPat.includes('letsapa=()=>')) {
      const hasArrow = norm.includes('letsapa=()=>');
      const hasLog = norm.includes('console.log("halo!")');
      if (hasArrow && hasLog) return { valid: true };
    }

    // Lesson 8: Array buah = ["apel", "jeruk"]
    if (normPat.includes('letbuah=["apel","jeruk"]')) {
      if (norm.includes('buah=["apel","jeruk"]')) return { valid: true };
    }

    // Lesson 9: Template literals with backtick and ${...}
    if (normPat.includes('console.log("halo${nama}")')) {
      const usesBacktick = cleanCode.includes('`') && /\$\{[^}]+\}/.test(cleanCode);
      if (usesBacktick && norm.includes('console.log(') && norm.includes('halo')) {
        return { valid: true };
      }
    }

    // Lesson 10: For loop (supports var/let, i<5 or i<=4, i++ / ++i / i+=1 / i=i+1, with or without braces)
    if (normPat.includes('for(')) {
      const hasForLoop =
        (norm.includes('for(leti=0') || norm.includes('for(i=0')) &&
        (norm.includes('i<5') || norm.includes('i<=4')) &&
        (norm.includes('i++') || norm.includes('++i') || norm.includes('i+=1') || norm.includes('i=i+1'));
      const hasLog = norm.includes('console.log(i)');
      if (hasForLoop && hasLog) return { valid: true };
    }

    return { valid: false, reason: 'Kode JavaScript belum sesuai dengan instruksi misi.' };
  }

  /* ---- TYPESCRIPT ---- */
  if (checkType === 'ts-pattern') {
    const { pattern } = checkConfig;
    const cleanCode = stripSlashComments(code);

    // Check TS compiler/runner errors first
    const runRes = runTypeScriptCode(code);
    if (runRes.error) {
      return { valid: false, reason: `TypeScript Error: ${runRes.error}` };
    }

    const norm = normalizeCode(cleanCode, { normalizeVarKeywords: true });
    const normPat = normalizeCode(pattern, { normalizeVarKeywords: true });

    if (norm.includes(normPat)) return { valid: true };

    if (normPat.includes('pesan:string') && norm.includes('pesan:string') && norm.includes('halotypescript')) {
      return { valid: true };
    }
    if (normPat.includes('tahun:number') && norm.includes('tahun:number') && norm.includes('2026')) {
      return { valid: true };
    }
    if (normPat.includes('aktif:boolean') && norm.includes('aktif:boolean') && norm.includes('true')) {
      return { valid: true };
    }
    if (normPat.includes('angka:number[]') && (norm.includes('angka:number[]=[1,2,3]') || norm.includes('angka:array<number>=[1,2,3]'))) {
      return { valid: true };
    }
    if (normPat.includes('functionkali')) {
      // Allow function declaration OR typed arrow function with any parameter names returning a*b
      const fnMatch = cleanCode.match(
        /(?:function\s+kali\s*\(\s*(\w+)\s*:\s*number\s*,\s*(\w+)\s*:\s*number\s*\)\s*:\s*number|(?:const|let)\s+kali\s*=\s*\(\s*(\w+)\s*:\s*number\s*,\s*(\w+)\s*:\s*number\s*\)\s*:\s*number\s*=>)/
      );
      if (fnMatch) {
        const p1 = (fnMatch[1] || fnMatch[3]).toLowerCase();
        const p2 = (fnMatch[2] || fnMatch[4]).toLowerCase();
        if (norm.includes(`${p1}*${p2}`) || norm.includes(`${p2}*${p1}`)) return { valid: true };
      }
    }
    if (normPat.includes('interfaceuser') && norm.includes('interfaceuser{') && norm.includes('id:number') && norm.includes('nama:string')) {
      return { valid: true };
    }
    if (normPat.includes('typestatus') && norm.includes('typestatus=') && norm.includes('"sukses"') && norm.includes('"gagal"')) {
      return { valid: true };
    }
    if (normPat.includes('interfacesiswa') && norm.includes('interfacesiswa{') && norm.includes('nama:string') && norm.includes('umur?:number')) {
      return { valid: true };
    }
    if (normPat.includes('identitas<t>')) {
      const genMatch = cleanCode.match(/function\s+identitas\s*<\s*T\s*>\s*\(\s*(\w+)\s*:\s*T\s*\)\s*:\s*T/i);
      if (genMatch && norm.includes(`return${genMatch[1].toLowerCase()}`)) return { valid: true };
    }
    if (normPat.includes('enumarah') && norm.includes('enumarah{') && norm.includes('atas="atas"') && norm.includes('bawah="bawah"')) {
      return { valid: true };
    }

    return { valid: false, reason: 'Sintaks atau anotasi tipe TypeScript belum sesuai dengan misi.' };
  }

  /* ---- PYTHON ---- */
  if (checkType === 'python-pattern') {
    const { pattern } = checkConfig;
    const cleanCode = stripHashComments(code);
    const runRes = runPythonCode(code);
    if (runRes.error) {
      return { valid: false, reason: runRes.error };
    }

    const norm = normalizeCode(cleanCode);
    const normPat = normalizeCode(pattern);

    if (norm.includes(normPat)) return { valid: true };

    if (normPat.includes('print("helloworld")') && runRes.output.some((l) => l.trim().toLowerCase() === 'hello world')) {
      return { valid: true };
    }
    if (normPat.includes('print(2026)') && runRes.output.some((l) => l.trim() === '2026')) {
      return { valid: true };
    }
    if (normPat.includes('nama="budi"') && norm.includes('nama="budi"')) return { valid: true };
    if (normPat.includes('hasil=10+5') && (norm.includes('hasil=10+5') || norm.includes('hasil=5+10'))) return { valid: true };
    if (normPat.includes('print(nama)') && norm.includes('print(nama)')) return { valid: true };
    if (normPat.includes('10>5') && (norm.includes('if10>5:') || norm.includes('if5<10:')) && norm.includes('print("benar")')) {
      return { valid: true };
    }
    if (normPat.includes('buah=') && norm.includes('buah=["apel","jeruk"]')) return { valid: true };
    if (normPat.includes('range(5)')) {
      const hasRange = norm.includes('range(5)') || norm.includes('range(0,5)');
      const outputs0to4 = runRes.output.slice(0, 5).join(',') === '0,1,2,3,4';
      if (hasRange && (outputs0to4 || norm.includes('print('))) return { valid: true };
    }
    if (normPat.includes('defsapa') && norm.includes('defsapa():') && norm.includes('print("halo!")')) return { valid: true };
    if (normPat.includes('f"halo')) {
      const usesFString = /print\s*\(\s*f["'][^"']*\{[^}]+\}[^"']*["']\s*\)/i.test(cleanCode);
      if (usesFString && norm.includes('halo')) return { valid: true };
    }

    return { valid: false, reason: 'Kode Python belum sesuai dengan instruksi misi.' };
  }

  /* ---- PHP ---- */
  if (checkType === 'php-pattern') {
    const { pattern } = checkConfig;
    const runRes = runPhpCode(code);
    if (runRes.error) {
      return { valid: false, reason: `PHP Error: ${runRes.error}` };
    }

    const hasOpeningTag = /<\?(?:php)?/i.test(code);
    const cleanCode = stripSlashComments(stripHashComments(code))
      .replace(/<\?(?:php)?/gi, '')
      .replace(/\?>/gi, '');
    const cleanPat = pattern.replace(/<\?(?:php)?/gi, '').replace(/\?>/gi, '');
    const norm = normalizeCode(cleanCode);
    const normPat = normalizeCode(cleanPat);

    // Lesson 2 explicitly requires <?php opening tag
    if (pattern.includes('<?php')) {
      if (!hasOpeningTag) {
        return { valid: false, reason: 'Tag pembuka <?php belum ditulis.' };
      }
      if ((norm.includes('echo"belajarphp"') || norm.includes('print"belajarphp"')) || runRes.output.join(' ').toLowerCase().includes('belajar php')) {
        return { valid: true };
      }
      return { valid: false, reason: 'Pastikan menampilkan "Belajar PHP" di dalam tag <?php.' };
    }

    if (norm.includes(normPat)) return { valid: true };

    if (normPat.includes('echo"halodunia!"') && ((norm.includes('echo"halodunia!"') || norm.includes('print"halodunia!"')) || runRes.output.join(' ').toLowerCase().includes('halo dunia!'))) {
      return { valid: true };
    }
    if (normPat.includes('$nama="budi"') && norm.includes('$nama="budi"')) return { valid: true };
    if (normPat.includes('echo$nama') && (norm.includes('echo$nama') || norm.includes('print$nama'))) return { valid: true };
    if (normPat.includes('10+5') && (norm.includes('$hasil=10+5') || norm.includes('$hasil=5+10')) && (norm.includes('echo$hasil') || norm.includes('print$hasil'))) {
      return { valid: true };
    }
    if (normPat.includes('echo"halo".$nama')) {
      if ((norm.includes('echo"halo".$nama') || norm.includes('print"halo".$nama')) && norm.includes('.$nama')) {
        return { valid: true };
      }
    }
    if (normPat.includes('if($nilai>=75)') && norm.includes('if($nilai>=75)') && (norm.includes('echo"lulus"') || norm.includes('print"lulus"'))) {
      return { valid: true };
    }
    if (normPat.includes('$buah=') && norm.includes('$buah=["apel","mangga","jeruk"]')) return { valid: true };
    if (normPat.includes('foreach($buahas$item)') && /foreach\s*\(\s*\$buah\s+as\s+\$([a-zA-Z_]\w*)\s*\)/i.test(cleanCode)) {
      const m = cleanCode.match(/foreach\s*\(\s*\$buah\s+as\s+\$([a-zA-Z_]\w*)\s*\)/i);
      const itemVar = m[1].toLowerCase();
      if (norm.includes(`echo$${itemVar}`) || norm.includes(`print$${itemVar}`)) return { valid: true };
    }
    if (normPat.includes('functionsapa') && norm.includes('functionsapa($nama)') && norm.includes('return"halo".$nama')) {
      return { valid: true };
    }

    return { valid: false, reason: 'Kode PHP belum sesuai dengan instruksi misi.' };
  }

  /* ---- JAVA ---- */
  if (checkType === 'java-pattern') {
    const { pattern } = checkConfig;
    const cleanCode = stripSlashComments(code);
    const runRes = runJavaCode(code);
    if (runRes.error) {
      return { valid: false, reason: `Java Error: ${runRes.error}` };
    }

    const norm = normalizeCode(cleanCode);
    const normPat = normalizeCode(pattern);

    if (norm.includes(normPat)) return { valid: true };

    if (normPat.includes('system.out.println("helloworld")') && runRes.output.some((l) => l.trim().toLowerCase() === 'hello world')) {
      return { valid: true };
    }
    if (normPat.includes('intumur=17') && norm.includes('intumur=17')) return { valid: true };
    if (normPat.includes('stringnama="budi"') && norm.includes('stringnama="budi"')) return { valid: true };
    if (normPat.includes('booleanaktif=true') && norm.includes('booleanaktif=true')) return { valid: true };
    if (normPat.includes('inthasil=10+5') && (norm.includes('inthasil=10+5') || norm.includes('inthasil=5+10'))) return { valid: true };
    if (normPat.includes('if(nilai>=75)') && norm.includes('if(nilai>=75)') && norm.includes('system.out.println("lulus")')) return { valid: true };
    if (normPat.includes('int[]angka={10,20,30}') && (norm.includes('int[]angka={10,20,30}') || norm.includes('intangka[]={10,20,30}'))) {
      return { valid: true };
    }
    if (normPat.includes('for(inti=0')) {
      const hasLoop = norm.includes('for(inti=0') && (norm.includes('i<5') || norm.includes('i<=4')) && (norm.includes('i++') || norm.includes('++i') || norm.includes('i+=1'));
      if (hasLoop && norm.includes('system.out.println(i)')) return { valid: true };
    }
    if (normPat.includes('staticvoidsapa()') && norm.includes('staticvoidsapa()') && norm.includes('system.out.println("halojava!")')) {
      return { valid: true };
    }
    if (normPat.includes('classsiswa') && norm.includes('classsiswa{') && norm.includes('stringnama="budi"')) {
      return { valid: true };
    }

    return { valid: false, reason: 'Kode Java belum sesuai dengan instruksi misi.' };
  }

  /* ---- C++ ---- */
  if (checkType === 'cpp-pattern') {
    const { pattern } = checkConfig;
    const cleanCode = stripSlashComments(code);
    const runRes = runCppCode(code);
    if (runRes.error) {
      return { valid: false, reason: `C++ Error: ${runRes.error}` };
    }

    const norm = normalizeCode(cleanCode).replace(/std::/g, '');
    const normPat = normalizeCode(pattern).replace(/std::/g, '');

    if (norm.includes(normPat)) return { valid: true };

    if (normPat.includes('cout<<"helloworld"') && norm.includes('cout<<"helloworld"')) return { valid: true };
    if (normPat.includes('cout<<"belajarc++"<<endl') && (norm.includes('cout<<"belajarc++"<<endl') || norm.includes('cout<<"belajarc++\\n"'))) return { valid: true };
    if (normPat.includes('intskor=100') && norm.includes('intskor=100')) return { valid: true };
    if (normPat.includes('stringnama="budi"') && norm.includes('stringnama="budi"')) return { valid: true };
    if (normPat.includes('inthasil=8*5') && (norm.includes('inthasil=8*5') || norm.includes('inthasil=5*8'))) return { valid: true };
    if (normPat.includes('if(skor>=75)') && norm.includes('if(skor>=75)') && norm.includes('cout<<"lulus"')) return { valid: true };
    if (normPat.includes('intangka[3]={10,20,30}') && (norm.includes('intangka[3]={10,20,30}') || norm.includes('intangka[]={10,20,30}'))) {
      return { valid: true };
    }
    if (normPat.includes('for(inti=0')) {
      const hasLoop = norm.includes('for(inti=0') && (norm.includes('i<5') || norm.includes('i<=4')) && (norm.includes('i++') || norm.includes('++i') || norm.includes('i+=1'));
      if (hasLoop && norm.includes('cout<<i')) return { valid: true };
    }
    if (normPat.includes('inttambah(inta,intb)') && norm.includes('inttambah(inta,intb)') && (norm.includes('returna+b') || norm.includes('returnb+a'))) {
      return { valid: true };
    }
    if (normPat.includes('structsiswa') && norm.includes('structsiswa{') && norm.includes('stringnama') && norm.includes('intnilai')) {
      return { valid: true };
    }

    return { valid: false, reason: 'Kode C++ belum sesuai dengan instruksi misi.' };
  }

  /* ---- GO ---- */
  if (checkType === 'go-pattern') {
    const { pattern } = checkConfig;
    const cleanCode = stripSlashComments(code);
    const runRes = runGoCode(code);
    if (runRes.error) {
      return { valid: false, reason: `Go Error: ${runRes.error}` };
    }

    const norm = normalizeCode(cleanCode);
    const normPat = normalizeCode(pattern);

    if (norm.includes(normPat)) return { valid: true };

    if (normPat.includes('fmt.println("hellogo!")') && runRes.output.some((l) => l.trim().toLowerCase() === 'hello go!')) {
      return { valid: true };
    }
    if (normPat.includes('nama:="budi"') && (norm.includes('nama:="budi"') || norm.includes('varnamastring="budi"'))) {
      return { valid: true };
    }
    if (normPat.includes('vartahunint=2026') && (norm.includes('vartahunint=2026') || norm.includes('vartahun=2026'))) {
      return { valid: true };
    }
    if (normPat.includes('hasil:=15+10') && (norm.includes('hasil:=15+10') || norm.includes('hasil:=10+15'))) {
      return { valid: true };
    }
    if (normPat.includes('ifnilai>=80') && norm.includes('ifnilai>=80') && norm.includes('fmt.println("lulus")')) {
      return { valid: true };
    }
    if (normPat.includes('buah:=[]string{"apel","jeruk"}') && norm.includes('buah:=[]string{"apel","jeruk"}')) {
      return { valid: true };
    }
    if (normPat.includes('fori:=0')) {
      const hasLoop = norm.includes('fori:=0') && (norm.includes('i<5') || norm.includes('i<=4')) && (norm.includes('i++') || norm.includes('i+=1'));
      if (hasLoop && norm.includes('fmt.println(i)')) return { valid: true };
    }
    if (normPat.includes('rangebuah') && norm.includes('rangebuah') && norm.includes('fmt.println(')) {
      return { valid: true };
    }
    if (normPat.includes('functambah(') && (norm.includes('functambah(aint,bint)int') || norm.includes('functambah(a,bint)int')) && (norm.includes('returna+b') || norm.includes('returnb+a'))) {
      return { valid: true };
    }
    if (normPat.includes('typesiswastruct') && norm.includes('typesiswastruct{') && norm.includes('namastring') && norm.includes('nilaiint')) {
      return { valid: true };
    }

    return { valid: false, reason: 'Kode Go belum sesuai dengan instruksi misi.' };
  }

  /* ---- SQL ---- */
  if (checkType === 'sql-pattern') {
    const { pattern } = checkConfig;
    const sqlRes = runSqlCode(code);
    if (sqlRes.error) {
      return { valid: false, reason: sqlRes.error };
    }

    const cleanCode = stripSqlComments(code);
    const norm = normalizeCode(cleanCode);
    const normPat = normalizeCode(pattern);

    if (norm.includes(normPat)) return { valid: true };

    if (normPat === 'select*fromsiswa' && norm.includes('select*fromsiswa')) return { valid: true };
    if (normPat === 'selectnama,nilaifromsiswa' && (norm.includes('selectnama,nilaifromsiswa') || norm.includes('selectnilai,namafromsiswa'))) return { valid: true };
    if (normPat.includes('wherekelas="xirpl"') && norm.includes('fromsiswa') && norm.includes('wherekelas="xirpl"')) return { valid: true };
    if (normPat.includes('wherenilai>=85') && norm.includes('fromsiswa') && norm.includes('wherenilai>=85')) return { valid: true };
    if (normPat.includes('orderbynilaidesc') && norm.includes('fromsiswa') && norm.includes('orderbynilaidesc')) return { valid: true };
    if (normPat.includes('limit3') && norm.includes('fromsiswa') && norm.includes('limit3')) return { valid: true };
    if (normPat.includes('count(*)') && norm.includes('count(*)') && norm.includes('fromsiswa')) return { valid: true };
    if (normPat.includes('groupbykelas') && norm.includes('avg(nilai)') && norm.includes('groupbykelas')) return { valid: true };
    if (normPat.includes('insertintosiswa') && norm.includes('insertintosiswa') && norm.includes('values(') && norm.includes('"rina"')) return { valid: true };
    if (normPat.includes('updatesiswasetnilai=95') && norm.includes('updatesiswa') && norm.includes('setnilai=95') && norm.includes('wherenama="budi"')) return { valid: true };

    return { valid: false, reason: 'Query SQL belum sesuai dengan instruksi misi.' };
  }

  return { valid: false, reason: 'Tipe validasi tidak dikenali.' };
}
