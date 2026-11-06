/**
 * Exploração GUIADA de uma JORNADA (inclui CRIAÇÃO) — descobre o fluxo completo.
 * A cada passo grava screenshot + INVENTÁRIO COMPLETO (botões, inputs, selects,
 * combos, radios/checkboxes, links, tabs) e as APIs. Se não conseguir avançar
 * até o próximo ponto, NÃO para em silêncio: captura o estado e PEDE ORIENTAÇÃO.
 *
 * SEGURANÇA:
 * - Criação/mutação só em APP_ENV=homolog (rec.guardHomolog). Vazio/prod bloqueia.
 * - Massa sintética única por runId; PII-safe; não assume limpeza.
 *
 * Uso: node scripts/record-journey.cjs <rotaEntrada> <nomeJornada>
 * Preencha jornada() usando rec.exigir(...) e rec.avancar(...) — assim, quando
 * travar, o script para e lista o que há na tela para você decidir.
 */
require('dotenv').config();
const { randomUUID } = require('node:crypto');
const path = require('node:path');
const { mkdirSync } = require('node:fs');
const { chromium } = require('@playwright/test');
const { inventarioNoNavegador } = require('./lib/inventory.cjs');

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

// Filtro de host genérico: só APIs do próprio domínio alvo (derivado de BASE_URL).
function hostPermitido(hostname, base) {
  try {
    const bh = new URL(base).hostname;
    if (hostname === bh) return true;
    const raiz = bh.split('.').slice(-2).join('.');
    return hostname === raiz || hostname.endsWith('.' + raiz);
  } catch {
    return false;
  }
}

(async () => {
  const base = process.env.BASE_URL;
  const entry = process.argv[2] || '/';
  const nome = process.argv[3] || 'jornada';
  const runId = 'synthetic-' + randomUUID().slice(0, 8);
  const dir = path.join('evidencias', '_exploratorio', nome);
  mkdirSync(dir, { recursive: true });

  console.log(`JORNADA: ${nome} | APP_ENV=${APP_ENV || '(vazio)'} | runId=${runId}`);
  if (APP_ENV !== 'homolog') console.log('⚠️  APP_ENV != homolog → passos de criação serão BLOQUEADOS por guardHomolog().');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: 'playwright/.auth/user.json' });
  const page = await context.newPage();

  const apis = new Map();
  page.on('response', async (res) => {
    try {
      const req = res.request();
      if (!['xhr', 'fetch'].includes(req.resourceType())) return;
      const u = new URL(res.url());
      if (!hostPermitido(u.hostname, base)) return;
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
    guardHomolog(acao) {
      if (APP_ENV !== 'homolog') throw new Error(`BLOQUEADO: "${acao}" cria/altera dados e APP_ENV=${APP_ENV || '(vazio)'}. Criação só em homologação.`);
    },
    async passo(descricao) {
      seq += 1;
      await page.screenshot({ path: path.join(dir, `${String(seq).padStart(2, '0')}-${slug(descricao)}.png`), fullPage: true });
      const inv = await page.evaluate(inventarioNoNavegador);
      console.log(`\n### PASSO ${seq}: ${descricao}  (rota ${new URL(page.url()).pathname})`);
      console.log(JSON.stringify(inv, null, 2));
    },
    /** Travou: captura o estado COMPLETO e para pedindo orientação (não some em silêncio). */
    async bloqueio(motivo) {
      seq += 1;
      await page.screenshot({ path: path.join(dir, `${String(seq).padStart(2, '0')}-BLOQUEIO-${slug(motivo)}.png`), fullPage: true });
      const inv = await page.evaluate(inventarioNoNavegador);
      console.log(`\n⛔ PRECISO DE ORIENTAÇÃO — não consegui avançar: ${motivo}`);
      console.log(`Rota atual: ${new URL(page.url()).pathname}`);
      console.log('O que existe na tela agora (escolha como proceder):');
      console.log(JSON.stringify(inv, null, 2));
      console.log('>>> Responda qual botão/campo/opção usar (ou que dado falta) que eu retomo a jornada daqui.');
      throw new Error('BLOQUEIO_EXPLORATORIO: ' + motivo);
    },
    /** Exige que um elemento esteja presente para seguir; se não, pede orientação. */
    async exigir(locator, descricao) {
      try { await locator.waitFor({ state: 'visible', timeout: 8000 }); }
      catch { await this.bloqueio('não encontrei: ' + descricao); }
    },
    /** Tenta um passo; se falhar (não evoluiu), para e pede orientação. */
    async avancar(descricao, fn) {
      try { await fn(); await this.passo(descricao); }
      catch (e) {
        if (String(e.message).startsWith('BLOQUEIO_EXPLORATORIO')) throw e;
        await this.bloqueio(`${descricao} — ${String(e.message).split('\n')[0]}`);
      }
    },
  };

  try {
    await page.goto(new URL(entry, base).toString(), { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await jornada(page, rec, { runId });
  } catch (e) {
    if (!String(e.message).startsWith('BLOQUEIO_EXPLORATORIO')) console.log('ERRO:', e && e.message ? e.message : String(e));
  } finally {
    console.log('\n===== APIS DA JORNADA (valores redigidos) =====');
    console.log(JSON.stringify([...apis.values()], null, 2));
    console.log(`\nRUN_ID: ${runId} | evidências em ${dir}`);
    await browser.close();
  }
})();

// =====================================================================
// PREENCHA os passos. Padrão: rec.exigir(...) antes de agir e rec.avancar(...)
// para cada transição. Se travar, o script PARA e lista a tela para você decidir.
// =====================================================================
async function jornada(page, rec, dados) {
  await rec.passo('entrada');

  // Exemplo (ajuste aos seletores do exploratório; criação só roda em homolog):
  // rec.guardHomolog('criar registro');
  // await rec.exigir(page.getByRole('button', { name: /novo/i }), 'botão Novo');
  // await rec.avancar('abriu formulário', async () => {
  //   await page.getByRole('button', { name: /novo/i }).click();
  // });
  // await rec.avancar('preencheu etapa 1', async () => {
  //   await page.getByLabel(/nome/i).fill('Teste ' + dados.runId);
  //   await page.getByRole('button', { name: /continuar/i }).click();
  // });
}
