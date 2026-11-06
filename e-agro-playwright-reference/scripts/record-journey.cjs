/**
 * Exploração GUIADA de uma JORNADA (inclui CRIAÇÃO) — para descobrir o fluxo
 * completo e então escrever o CT. Dirige a jornada com massa sintética e grava,
 * por passo: screenshot, inventário PII-safe de campos/botões e as operações de
 * API (incluindo mutations GraphQL).
 *
 * SEGURANÇA:
 * - Criação/mutação SÓ em homologação: `rec.guardHomolog(acao)` aborta se
 *   APP_ENV=prod. Chame-o ANTES de qualquer passo que cria/altera dados.
 * - Massa sintética única por runId; nada de dados reais.
 * - PII-safe no log: apenas nomes/tipos/rótulos; nunca valores/tokens/cookies.
 * - Não assume limpeza — dados criados ficam marcados com o runId.
 *
 * Uso: node scripts/record-journey.cjs <rotaEntrada> <nomeJornada>
 * Depois, preencha a função jornada() com os passos reais (seletores vindos do
 * exploratório de navegação).
 */
require('dotenv').config();
const { randomUUID } = require('node:crypto');
const path = require('node:path');
const { mkdirSync } = require('node:fs');
const { chromium } = require('@playwright/test');

// Exige homolog EXPLÍCITO para permitir criação — vazio NÃO é tratado como homolog
// (evita mutar produção por engano com APP_ENV ausente).
const APP_ENV = (process.env.APP_ENV || '').trim().toLowerCase();

const slug = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'passo';

function schema(v, d = 0) {
  if (d > 5) return '…';
  if (v === null) return 'null';
  if (Array.isArray(v)) return v.length ? ['array', schema(v[0], d + 1)] : ['array(vazio)'];
  if (typeof v === 'object') { const o = {}; for (const k of Object.keys(v).slice(0, 40)) o[k] = schema(v[k], d + 1); return o; }
  return typeof v;
}

(async () => {
  const base = process.env.BASE_URL;
  const entry = process.argv[2] || '/';
  const nome = process.argv[3] || 'jornada';
  const runId = 'eagro-' + randomUUID().slice(0, 8);
  const dir = path.join('evidencias', '_exploratorio', nome);
  mkdirSync(dir, { recursive: true });

  console.log(`JORNADA: ${nome} | APP_ENV=${APP_ENV} | runId=${runId}`);
  if (APP_ENV !== 'homolog') {
    console.log('⚠️  APP_ENV != homolog → passos de criação serão BLOQUEADOS por guardHomolog().');
  }

  const browser = await chromium.launch({ headless: APP_ENV === 'homolog' ? true : true });
  const context = await browser.newContext({ storageState: 'playwright/.auth/user.json' });
  const page = await context.newPage();

  const apis = new Map();
  page.on('response', async (res) => {
    try {
      const req = res.request();
      if (!['xhr', 'fetch'].includes(req.resourceType())) return;
      const u = new URL(res.url());
      if (!/e-?agro/i.test(u.hostname)) return;
      const post = req.postDataJSON ? req.postDataJSON() : undefined;
      const op = /graphql/i.test(u.pathname) ? (post && post.operationName) || '(anon)' : `${req.method()} ${u.pathname}`;
      if (apis.has(op)) return;
      let resp = '(não-JSON)';
      if (/application\/json/i.test(res.headers()['content-type'] || '')) {
        const b = await res.json().catch(() => undefined);
        if (b !== undefined) resp = schema(b);
      }
      apis.set(op, { operation: op, metodo: req.method(), variaveis: post && post.variables ? Object.keys(post.variables) : [], status: res.status(), resposta: resp });
    } catch { /* ignore */ }
  });

  let seq = 0;
  const rec = {
    runId,
    /** Trava: só permite criação/mutação em homologação. */
    guardHomolog(acao) {
      if (APP_ENV !== 'homolog') throw new Error(`BLOQUEADO: "${acao}" cria/altera dados e APP_ENV=${APP_ENV}. Criação só em homologação.`);
    },
    /** Grava um passo: screenshot + inventário PII-safe. */
    async passo(descricao) {
      seq += 1;
      const f = path.join(dir, `${String(seq).padStart(2, '0')}-${slug(descricao)}.png`);
      await page.screenshot({ path: f, fullPage: true });
      const inv = await page.evaluate(() => {
        const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
        const t = (el) => (el.getAttribute('aria-label') || el.textContent || el.getAttribute('placeholder') || '').trim().slice(0, 50);
        const uniq = (a) => [...new Set(a)];
        return {
          campos: Array.from(document.querySelectorAll('input,select,textarea')).filter(vis).map((el) => ({ tag: el.tagName.toLowerCase(), type: el.getAttribute('type'), name: el.getAttribute('name'), label: el.labels && el.labels[0] ? el.labels[0].textContent.trim().slice(0, 40) : null, placeholder: el.getAttribute('placeholder') })),
          botoes: uniq(Array.from(document.querySelectorAll('button,[role=button]')).filter(vis).map(t).filter(Boolean)),
        };
      });
      console.log(`\n### PASSO ${seq}: ${descricao}  (rota ${new URL(page.url()).pathname})`);
      console.log(JSON.stringify(inv, null, 2));
    },
  };

  try {
    await page.goto(new URL(entry, base).toString(), { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await jornada(page, rec, { runId });
  } catch (e) {
    console.log('ERRO:', e && e.message ? e.message : String(e));
  } finally {
    console.log('\n===== APIS DA JORNADA (valores redigidos) =====');
    console.log(JSON.stringify([...apis.values()], null, 2));
    console.log(`\nRUN_ID: ${runId} | evidências em ${dir}`);
    await browser.close();
  }
})();

// =====================================================================
// PREENCHA com os passos reais da jornada (seletores vindos do exploratório).
// Exemplo de CRIAÇÃO (só executa em homolog, por causa do guardHomolog):
// =====================================================================
async function jornada(page, rec, dados) {
  await rec.passo('entrada');

  // --- exemplo: criar cliente (descomente e ajuste aos seletores reais) ---
  // rec.guardHomolog('criar cliente');
  // await page.getByRole('button', { name: /novo cliente/i }).click();
  // await rec.passo('formulario de cliente');
  // await page.getByLabel(/nome/i).fill('Cliente Teste ' + dados.runId);
  // await page.getByRole('button', { name: /salvar|continuar/i }).click();
  // await rec.passo('cliente criado');
}
