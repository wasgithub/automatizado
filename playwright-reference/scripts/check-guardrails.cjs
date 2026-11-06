/**
 * Guardrail de CÓDIGO — impede anti-padrões e "automação inventada".
 *
 * ERRORS (falham o check):
 *  - waitForTimeout (espera fixa) → usar auto-waiting/estados observáveis.
 *  - test.only / describe.only → não pode ser commitado.
 *  - page.pause() → debug esquecido.
 *  - URL/endpoint hardcoded em goto/request → usar baseURL/env (não inventar endpoint).
 *
 * WARNINGS (não falham, mas revisar):
 *  - spec funcional sem tag @CT (rastreabilidade com o cenário/exploratório).
 *
 * Sem dependências externas (apenas Node nativo). Escaneia tests/ e src/ (.ts).
 */
const fs = require('node:fs');
const path = require('node:path');

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const nome of fs.readdirSync(dir)) {
    const p = path.join(dir, nome);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (p.endsWith('.ts')) acc.push(p);
  }
  return acc;
}

const REGRAS = [
  { re: /\bwaitForTimeout\s*\(/, msg: 'espera fixa (waitForTimeout) — use auto-waiting/estados observáveis' },
  { re: /\b(test|describe)\.only\s*\(/, msg: 'test.only/describe.only não pode ser commitado' },
  { re: /\bpage\.pause\s*\(/, msg: 'page.pause() de debug esquecido' },
  { re: /\.(goto|get|post|put|patch|delete)\(\s*[`'"]https?:\/\//i, msg: 'URL/endpoint hardcoded — use baseURL/env (não inventar endpoint)' },
];

const arquivos = [...walk('tests'), ...walk('src')];
const erros = [];
const avisos = [];

for (const file of arquivos) {
  const linhas = fs.readFileSync(file, 'utf8').split('\n');
  linhas.forEach((linha, i) => {
    for (const r of REGRAS) {
      if (r.re.test(linha)) erros.push(`${file}:${i + 1}  ${r.msg}`);
    }
  });

  // Rastreabilidade: spec funcional deve referenciar um CT (@CT-...).
  if (/tests\/functional\/.*\.spec\.ts$/.test(file.replace(/\\/g, '/'))) {
    const txt = linhas.join('\n');
    if (!/@CT-[\w.\-]+/.test(txt)) avisos.push(`${file}  sem tag @CT (rastreabilidade com o cenário)`);
  }
}

if (avisos.length) {
  console.log('⚠️  AVISOS (revisar rastreabilidade):');
  for (const a of avisos) console.log('   - ' + a);
}

if (erros.length) {
  console.error('\n❌ GUARDRAILS violados:');
  for (const e of erros) console.error('   - ' + e);
  process.exit(1);
}

console.log(`✅ Guardrails de código OK (${arquivos.length} arquivos .ts verificados).`);
