/**
 * Scanner do código-fonte do FRONTEND (React) — facilita a integração
 * frontend ↔ seletores quando os dois projetos estão no mesmo workspace.
 *
 * Lê os componentes e produz:
 *  - SELETORES PRONTOS: data-testid, aria-label, <label for>/id (usáveis já).
 *  - LACUNAS: elementos interativos (button/input/select/textarea) SEM gancho
 *    estável → candidatos a receber data-testid (contrato de testabilidade).
 *
 * Heurístico (scan textual, não AST): serve de primeira passada para conversar
 * com o time React. Não altera o frontend.
 *
 * Uso:
 *   node scripts/scan-frontend.cjs <caminho-do-frontend-src> [saida.md]
 *   FRONTEND_PATH=../frontend/src node scripts/scan-frontend.cjs
 */
const fs = require('node:fs');
const path = require('node:path');

const raiz = process.argv[2] || process.env.FRONTEND_PATH;
const saida = process.argv[3] || 'docs/FRONTEND_SELECTORS.md';

if (!raiz) {
  console.error('Informe o caminho do frontend. Ex: node scripts/scan-frontend.cjs ../frontend/src');
  process.exit(1);
}
if (!fs.existsSync(raiz)) {
  console.error(`Caminho não encontrado: ${raiz}. Coloque o frontend no workspace e aponte para o src.`);
  process.exit(1);
}

const EXT = new Set(['.tsx', '.jsx', '.ts', '.js']);
function walk(dir, acc = []) {
  for (const nome of fs.readdirSync(dir)) {
    if (nome === 'node_modules' || nome.startsWith('.')) continue;
    const p = path.join(dir, nome);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (EXT.has(path.extname(p))) acc.push(p);
  }
  return acc;
}

const testids = new Map();   // valor → [arquivos]
const ariaLabels = new Map();
const labelsFor = new Map(); // for → texto (quando capturável)
const gaps = [];             // { file, tag, trecho }

const grab = (re, str, cb) => { let m; while ((m = re.exec(str)) !== null) cb(m); };
const add = (map, k, file) => { const a = map.get(k) || []; if (!a.includes(file)) a.push(file); map.set(k, a); };

const arquivos = walk(raiz);
for (const file of arquivos) {
  const src = fs.readFileSync(file, 'utf8');
  const rel = path.relative(raiz, file);

  grab(/data-testid\s*=\s*["'{]\s*["']?([^"'}]+)["']?\s*}?/g, src, (m) => add(testids, m[1].trim(), rel));
  grab(/aria-label\s*=\s*["'{]\s*["']?([^"'}]+)["']?\s*}?/g, src, (m) => add(ariaLabels, m[1].trim(), rel));
  grab(/<label[^>]*htmlFor\s*=\s*["']([^"']+)["'][^>]*>([^<]*)</g, src, (m) => labelsFor.set(m[1].trim(), (m[2] || '').trim()));

  // Lacunas: tag interativa sem data-testid/aria-label E sem id ligado a <label for>.
  grab(/<(button|input|select|textarea)\b[^>]*>/gis, src, (m) => {
    const tag = m[0];
    const idm = /\bid\s*=\s*["']([^"']+)["']/i.exec(tag);
    const cobertoPorLabel = idm && labelsFor.has(idm[1].trim());
    if (!/data-testid|aria-label|aria-labelledby/i.test(tag) && !cobertoPorLabel) {
      gaps.push({ file: rel, tag: m[1], trecho: tag.replace(/\s+/g, ' ').slice(0, 90) });
    }
  });
}

const linhas = [];
linhas.push('# Mapa de seletores do frontend (gerado)\n');
linhas.push(`Escaneados ${arquivos.length} arquivos em \`${raiz}\`. Heurístico — confirme com o time.\n`);

linhas.push(`## ✅ Seletores prontos\n`);
linhas.push(`### data-testid (${testids.size})`);
for (const [v, fs2] of [...testids].sort()) linhas.push(`- \`getByTestId('${v}')\` — ${fs2.length} uso(s)`);
linhas.push(`\n### aria-label (${ariaLabels.size})`);
for (const [v] of [...ariaLabels].sort()) linhas.push(`- \`getByLabel('${v}')\``);
linhas.push(`\n### <label for> (${labelsFor.size})`);
for (const [id, txt] of [...labelsFor].sort()) linhas.push(`- \`getByLabel('${txt || id}')\` (id=${id})`);

linhas.push(`\n## ⚠️ Lacunas — elementos sem gancho estável (${gaps.length})`);
linhas.push('Candidatos a receber \`data-testid\` (proposta ao time React):\n');
for (const g of gaps.slice(0, 200)) linhas.push(`- [${g.file}] <${g.tag}>: \`${g.trecho}\``);
if (gaps.length > 200) linhas.push(`- … e mais ${gaps.length - 200}.`);

fs.mkdirSync(path.dirname(saida), { recursive: true });
fs.writeFileSync(saida, linhas.join('\n') + '\n');
console.log(`✅ Mapa gerado: ${saida}`);
console.log(`   ${testids.size} data-testid · ${ariaLabels.size} aria-label · ${labelsFor.size} label/for · ${gaps.length} lacunas`);
