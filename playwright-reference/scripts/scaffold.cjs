/**
 * Scaffolder — cria as pastas padronizadas por SISTEMA, FEATURE e FLUXO.
 *
 * Multi-sistema: um fluxo pode atravessar vários sistemas (e-agro, servicenow...).
 * Cada sistema tem seus Page Objects/seletores isolados; um fluxo orquestra
 * entre sistemas.
 *
 * Uso:
 *   node scripts/scaffold.cjs system <sistema>
 *   node scripts/scaffold.cjs feature <sistema> <feature>
 *   node scripts/scaffold.cjs flow <fluxo> [sistema1 sistema2 ...]
 */
const fs = require('node:fs');
const path = require('node:path');

const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const pascal = (s) => slug(s).split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');

function escreve(p, conteudo) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  if (fs.existsSync(p)) { console.log('  = existe:', p); return; }
  fs.writeFileSync(p, conteudo);
  console.log('  + criado:', p);
}
function pasta(p) { fs.mkdirSync(p, { recursive: true }); const gk = path.join(p, '.gitkeep'); if (!fs.existsSync(gk) && fs.readdirSync(p).length === 0) fs.writeFileSync(gk, ''); console.log('  + pasta:', p); }

function scaffoldSystem(sistema) {
  const s = slug(sistema);
  console.log(`\n📦 Sistema: ${s}`);
  pasta(`src/systems/${s}/pages`);
  pasta(`src/systems/${s}/api`);
  console.log(`\n→ Adicione o sistema em systems.config.json:`);
  console.log(`   "systems": { "${s}": { "baseUrl": "https://...", "authStrategy": "keycloak|form|none" } }`);
}

function scaffoldFeature(sistema, feature) {
  const s = slug(sistema);
  const f = slug(feature);
  const Page = pascal(feature) + 'Page';
  console.log(`\n🧩 Feature "${f}" no sistema "${s}"`);
  escreve(`src/systems/${s}/pages/${f}/${Page}.ts`,
`/**
 * Page Object — ${f} (sistema: ${s}).
 * Seletores vindos do exploratório (docs/EXPLORATORIO_${s}-${f}.md). Não invente.
 */
import type { Locator, Page } from '@playwright/test';

export class ${Page} {
  constructor(private readonly page: Page) {}

  // Exemplo (ajuste aos seletores reais do exploratório):
  // campoExemplo(): Locator { return this.page.getByLabel(/exemplo/i); }
}
`);
  pasta(`tests/systems/${s}/${f}`);
  escreve(`features/${s}/${f}/historia.md`,
`# História: ${f} (${s})\n\n> Preencha critérios e CTs. Ver features/_TEMPLATE.\n`);
  escreve(`features/${s}/${f}/${f}.feature`,
`# language: pt\n@${s} @${f}\nFuncionalidade: ${f} (${s})\n\n  @CT-000\n  Cenário: <descreva>\n    Dado <pré-condição>\n    Quando <ação>\n    Então <resultado>\n`);
  console.log(`\n→ Próximo: npm run explore (mapear) e depois criar o spec em tests/systems/${s}/${f}/`);
}

function scaffoldFlow(fluxo, sistemas) {
  const f = slug(fluxo);
  console.log(`\n🔀 Fluxo cross-system "${f}" — sistemas: ${sistemas.join(' → ') || '(defina)'}`);
  pasta(`tests/flows/${f}`);
  const etapas = sistemas.length ? sistemas : ['sistema-1', 'sistema-2'];
  const passos = etapas.map((s, i) => `    # Etapa ${i + 1} — sistema "${slug(s)}"\n    Quando executo a etapa em ${slug(s)}`).join('\n');
  escreve(`features/flows/${f}/${f}.feature`,
`# language: pt\n@flow @${f}\nFuncionalidade: ${f} (fluxo entre sistemas: ${etapas.map(slug).join(' -> ')})\n\n  @CT-FLOW-000\n  Cenário: <descreva a jornada ponta a ponta>\n    Dado que inicio o fluxo\n${passos}\n    Então o fluxo é concluído com sucesso\n`);
  escreve(`features/flows/${f}/historia.md`,
`# Fluxo: ${f}\n\nSistemas envolvidos (em ordem): ${etapas.map(slug).join(' → ')}.\n\n> Fluxo cross-system: cada etapa usa os Page Objects do seu sistema\n> (src/systems/<sistema>/pages). O spec orquestra a navegação entre eles.\n`);
  escreve(`tests/flows/${f}/${f}.spec.ts`,
`/**
 * Fluxo cross-system: ${f} (${etapas.map(slug).join(' -> ')}).
 * Orquestra etapas em sistemas diferentes. Cada etapa abre a URL do seu sistema
 * (getSystem('<nome>').baseUrl) e usa os Page Objects daquele sistema.
 * MANTER skip até os sistemas/seletores serem mapeados no exploratório.
 */
import { test, expect } from '../../../src/fixtures/test-fixtures';
import { getSystem } from '../../../src/config/systems';

test.skip('${f} — jornada entre sistemas @flow @CT-FLOW-000', async ({ page }) => {
${etapas.map((s) => `  // Etapa em "${slug(s)}"\n  await page.goto(getSystem('${slug(s)}').baseUrl);\n  // ... ações da etapa (Page Objects de src/systems/${slug(s)}/pages) ...`).join('\n')}
  await expect(page).toHaveTitle(/.*/);
});
`);
  console.log(`\n→ Garanta que os sistemas [${etapas.map(slug).join(', ')}] existam em systems.config.json.`);
}

const [tipo, a, b, ...resto] = process.argv.slice(2);
try {
  if (tipo === 'system' && a) scaffoldSystem(a);
  else if (tipo === 'feature' && a && b) scaffoldFeature(a, b);
  else if (tipo === 'flow' && a) scaffoldFlow(a, [b, ...resto].filter(Boolean));
  else {
    console.log('Uso:');
    console.log('  node scripts/scaffold.cjs system <sistema>');
    console.log('  node scripts/scaffold.cjs feature <sistema> <feature>');
    console.log('  node scripts/scaffold.cjs flow <fluxo> [sistema1 sistema2 ...]');
    process.exit(1);
  }
} catch (e) { console.error('Erro:', e.message); process.exit(1); }
