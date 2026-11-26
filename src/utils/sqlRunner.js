/**
 * sqlRunner.js — In-browser relational SQL engine for educational quests
 */

function createInitialTables() {
  return {
    siswa: [
      { id: 1, nama: 'Budi', kelas: 'XI RPL', nilai: 88, kota: 'Bandung' },
      { id: 2, nama: 'Siti', kelas: 'XI RPL', nilai: 94, kota: 'Jakarta' },
      { id: 3, nama: 'Andi', kelas: 'XI TKJ', nilai: 76, kota: 'Surabaya' },
      { id: 4, nama: 'Dewi', kelas: 'XI RPL', nilai: 85, kota: 'Yogyakarta' },
      { id: 5, nama: 'Rafi', kelas: 'XI TKJ', nilai: 72, kota: 'Semarang' },
    ],
    produk: [
      { id: 1, nama: 'Keyboard Mekanikal', kategori: 'Hardware', harga: 450000, stok: 12 },
      { id: 2, nama: 'Mouse Wireless', kategori: 'Hardware', harga: 180000, stok: 25 },
      { id: 3, nama: 'Kursus JS Dasar', kategori: 'Edukasi', harga: 120000, stok: 99 },
      { id: 4, nama: 'Monitor 24 Inch', kategori: 'Hardware', harga: 1850000, stok: 6 },
    ],
  };
}

function parseSqlValue(raw) {
  const t = raw.trim();
  if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) {
    return t.slice(1, -1);
  }
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  if (t.toLowerCase() === 'null') return null;
  return t;
}

function splitCsv(str) {
  const out = [];
  let cur = '';
  let quote = null;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (!quote && (ch === "'" || ch === '"')) quote = ch;
    else if (quote && ch === quote && str[i - 1] !== '\\') quote = null;
    else if (!quote && ch === ',') {
      out.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function evalWhere(row, whereClause) {
  if (!whereClause) return true;
  const orParts = whereClause.split(/\s+OR\s+/i);
  return orParts.some((orPart) => {
    const andParts = orPart.split(/\s+AND\s+/i);
    return andParts.every((cond) => {
      const likeMatch = cond.trim().match(/^([a-zA-Z_]\w*)\s+LIKE\s+(['"].*['"])$/i);
      if (likeMatch) {
        const col = likeMatch[1];
        const pat = parseSqlValue(likeMatch[2]).replace(/%/g, '.*').replace(/_/g, '.');
        return new RegExp(`^${pat}$`, 'i').test(String(row[col] ?? ''));
      }
      const m = cond.trim().match(/^([a-zA-Z_]\w*)\s*(!=|<>|>=|<=|=|>|<)\s*(.+)$/);
      if (!m) return true;
      const [, col, op, rhsRaw] = m;
      const left = row[col];
      const right = parseSqlValue(rhsRaw);
      if (op === '=') return String(left).toLowerCase() === String(right).toLowerCase() || left === right;
      if (op === '!=' || op === '<>') return left != right;
      if (op === '>=') return Number(left) >= Number(right);
      if (op === '<=') return Number(left) <= Number(right);
      if (op === '>') return Number(left) > Number(right);
      if (op === '<') return Number(left) < Number(right);
      return false;
    });
  });
}

export function runSqlCode(sourceCode) {
  if (!sourceCode || !sourceCode.trim()) {
    return { columns: [], rows: [], message: '', error: null };
  }

  const tables = createInitialTables();
  // Strip SQL comments (-- ... and /* ... */)
  const cleanSql = sourceCode
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((l) => l.replace(/--.*$/, ''))
    .join(' ')
    .trim();

  const statements = cleanSql
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  let lastResult = { columns: [], rows: [], message: 'Query berhasil dijalankan.', error: null };

  try {
    for (const stmt of statements) {
      // SELECT ...
      if (/^SELECT\s+/i.test(stmt)) {
        const match = stmt.match(
          /^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z_]\w*)(?:\s+WHERE\s+(.+?))?(?:\s+GROUP\s+BY\s+([a-zA-Z_]\w*))?(?:\s+ORDER\s+BY\s+([a-zA-Z_]\w*)(?:\s+(ASC|DESC))?)?(?:\s+LIMIT\s+(\d+))?$/i
        );
        if (!match) {
          return { columns: [], rows: [], message: '', error: 'Sintaks SELECT tidak valid. Contoh: SELECT * FROM siswa;' };
        }
        const [, selectRaw, tableNameRaw, whereClause, groupCol, orderCol, orderDir, limitRaw] = match;
        const tableName = tableNameRaw.toLowerCase();
        if (!tables[tableName]) {
          return { columns: [], rows: [], message: '', error: `Tabel '${tableNameRaw}' tidak ditemukan. Tabel tersedia: siswa, produk.` };
        }

        let dataset = tables[tableName].filter((row) => evalWhere(row, whereClause));
        const selectItems = splitCsv(selectRaw);
        const hasAggregate = selectItems.some((item) => /^(COUNT|AVG|SUM|MIN|MAX)\s*\(/i.test(item));

        if (groupCol || hasAggregate) {
          const groups = new Map();
          if (groupCol) {
            dataset.forEach((row) => {
              const key = row[groupCol];
              if (!groups.has(key)) groups.set(key, []);
              groups.get(key).push(row);
            });
          } else {
            groups.set('__all__', dataset);
          }

          const outRows = [];
          const cols = selectItems.map((item) => {
            const alias = item.match(/\s+AS\s+([a-zA-Z_]\w*)$/i);
            return alias ? alias[1] : item;
          });

          for (const [, grpRows] of groups.entries()) {
            const outRow = {};
            selectItems.forEach((item, idx) => {
              const colName = cols[idx];
              const cleanItem = item.replace(/\s+AS\s+[a-zA-Z_]\w*$/i, '').trim();
              const agg = cleanItem.match(/^(COUNT|AVG|SUM|MIN|MAX)\s*\(\s*(\*|[a-zA-Z_]\w*)\s*\)$/i);
              if (agg) {
                const fn = agg[1].toUpperCase();
                const target = agg[2];
                if (fn === 'COUNT') outRow[colName] = grpRows.length;
                else {
                  const vals = grpRows.map((r) => Number(r[target]) || 0);
                  if (fn === 'SUM') outRow[colName] = vals.reduce((a, b) => a + b, 0);
                  if (fn === 'AVG') outRow[colName] = vals.length ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : 0;
                  if (fn === 'MAX') outRow[colName] = vals.length ? Math.max(...vals) : 0;
                  if (fn === 'MIN') outRow[colName] = vals.length ? Math.min(...vals) : 0;
                }
              } else {
                outRow[colName] = grpRows[0]?.[cleanItem] ?? null;
              }
            });
            outRows.push(outRow);
          }

          lastResult = {
            columns: cols,
            rows: outRows,
            message: `${outRows.length} baris dikembalikan.`,
            error: null,
          };
          continue;
        }

        if (orderCol) {
          const dir = (orderDir || 'ASC').toUpperCase() === 'DESC' ? -1 : 1;
          dataset = [...dataset].sort((a, b) => {
            const va = a[orderCol];
            const vb = b[orderCol];
            if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
            return String(va).localeCompare(String(vb)) * dir;
          });
        }

        if (limitRaw) {
          dataset = dataset.slice(0, Number(limitRaw));
        }

        const columns =
          selectRaw.trim() === '*'
            ? Object.keys(tables[tableName][0] || {})
            : selectItems.map((c) => c.replace(/\s+AS\s+[a-zA-Z_]\w*$/i, '').trim());

        const rows = dataset.map((r) => {
          const obj = {};
          columns.forEach((c) => {
            obj[c] = r[c];
          });
          return obj;
        });

        lastResult = {
          columns,
          rows,
          message: `${rows.length} baris ditemukan.`,
          error: null,
        };
        continue;
      }

      // INSERT INTO table (cols) VALUES (vals)
      if (/^INSERT\s+INTO\s+/i.test(stmt)) {
        const m = stmt.match(/^INSERT\s+INTO\s+([a-zA-Z_]\w*)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)$/i);
        if (!m) {
          return { columns: [], rows: [], message: '', error: 'Sintaks INSERT tidak valid. Contoh: INSERT INTO siswa (nama, kelas, nilai, kota) VALUES (\'Rina\', \'XI RPL\', 92, \'Bandung\');' };
        }
        const tableName = m[1].toLowerCase();
        if (!tables[tableName]) {
          return { columns: [], rows: [], message: '', error: `Tabel '${m[1]}' tidak ditemukan.` };
        }
        const cols = splitCsv(m[2]);
        const vals = splitCsv(m[3]).map(parseSqlValue);
        const newRow = { id: tables[tableName].length + 1 };
        cols.forEach((c, idx) => {
          newRow[c] = vals[idx] ?? null;
        });
        tables[tableName].push(newRow);
        const allCols = Object.keys(tables[tableName][0] || newRow);
        lastResult = {
          columns: allCols,
          rows: tables[tableName],
          message: `1 baris berhasil ditambahkan ke tabel '${tableName}'.`,
          error: null,
        };
        continue;
      }

      // UPDATE table SET col = val WHERE ...
      if (/^UPDATE\s+/i.test(stmt)) {
        const m = stmt.match(/^UPDATE\s+([a-zA-Z_]\w*)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
        if (!m) {
          return { columns: [], rows: [], message: '', error: 'Sintaks UPDATE tidak valid.' };
        }
        const tableName = m[1].toLowerCase();
        if (!tables[tableName]) {
          return { columns: [], rows: [], message: '', error: `Tabel '${m[1]}' tidak ditemukan.` };
        }
        const assignments = splitCsv(m[2]).map((a) => {
          const [col, val] = a.split('=');
          return { col: col.trim(), val: parseSqlValue(val) };
        });
        let updated = 0;
        tables[tableName] = tables[tableName].map((row) => {
          if (evalWhere(row, m[3])) {
            updated++;
            const copy = { ...row };
            assignments.forEach(({ col, val }) => {
              copy[col] = val;
            });
            return copy;
          }
          return row;
        });
        const allCols = Object.keys(tables[tableName][0] || {});
        lastResult = {
          columns: allCols,
          rows: tables[tableName],
          message: `${updated} baris berhasil diperbarui di tabel '${tableName}'.`,
          error: null,
        };
        continue;
      }

      // DELETE FROM table WHERE ...
      if (/^DELETE\s+FROM\s+/i.test(stmt)) {
        const m = stmt.match(/^DELETE\s+FROM\s+([a-zA-Z_]\w*)(?:\s+WHERE\s+(.+))?$/i);
        if (!m) {
          return { columns: [], rows: [], message: '', error: 'Sintaks DELETE tidak valid.' };
        }
        const tableName = m[1].toLowerCase();
        if (!tables[tableName]) {
          return { columns: [], rows: [], message: '', error: `Tabel '${m[1]}' tidak ditemukan.` };
        }
        const beforeCount = tables[tableName].length;
        tables[tableName] = tables[tableName].filter((r) => !evalWhere(r, m[2]));
        const deleted = beforeCount - tables[tableName].length;
        const allCols = Object.keys(tables[tableName][0] || {});
        lastResult = {
          columns: allCols,
          rows: tables[tableName],
          message: `${deleted} baris dihapus dari tabel '${tableName}'.`,
          error: null,
        };
        continue;
      }

      return { columns: [], rows: [], message: '', error: `Perintah SQL tidak dikenali: ${stmt}` };
    }

    return lastResult;
  } catch (err) {
    return { columns: [], rows: [], message: '', error: err.message };
  }
}
