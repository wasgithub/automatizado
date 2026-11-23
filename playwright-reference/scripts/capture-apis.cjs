/**
 * Captura DESCARTÁVEL de CONTRATOS de API durante navegação READ-ONLY.
 *
 * SEGURANÇA / PII:
 * - NÃO registra valores reais: respostas JSON são convertidas em ESQUEMA
 *   (nomes de campos + TIPOS). Todos os valores são descartados.
 * - NÃO registra Authorization, cookies, tokens nem corpos de requisição.
 * - NÃO persiste nada sensível: imprime apenas o mapa de contrato.
 * - Somente navegação (nenhuma mutação).
 *
 * Uso: node scripts/capture-apis.cjs
 */
require('dotenv').config();
const { chromium } = require('@playwright/test');
const { execFileSync } = require('node:child_process');
const { systemByHost } = require('./lib/systems.cjs');

// Rotas read-only a visitar (PLACEHOLDERS — ajuste ao ambiente alvo).
const ROTAS = (process.env.EXPLORE_ROTAS || '/').split(',').map((r) => r.trim());

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

// Converte um valor em descrição de tipo, SEM expor o valor.
function schema(v, depth = 0) {
  if (depth > 5) return '…';
  if (v === null) return 'null';
  if (Array.isArray(v)) return v.length ? ['array', schema(v[0], depth + 1)] : ['array(vazio)'];
  const t = typeof v;
  if (t === 'object') {
    const o = {};
    for (const k of Object.keys(v).slice(0, 50)) o[k] = schema(v[k], depth + 1);
    return o;
  }
  return t; // string | number | boolean  (VALOR redigido — só o tipo)
}

(async () => {
  const base = process.env.BASE_URL;
  if (!base) throw new Error('Defina BASE_URL no .env (ambiente alvo).');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(require('node:fs').existsSync('playwright/.auth/user.json') ? { storageState: 'playwright/.auth/user.json' } : {});
  const page = await context.newPage();

  const endpoints = new Map(); // chave: host+path+operação

  page.on('response', async (res) => {
    try {
      const req = res.request();
      if (!['xhr', 'fetch'].includes(req.resourceType())) return;
      const u = new URL(res.url());
      // Só APIs do próprio domínio alvo (derivado de BASE_URL); ignora terceiros.
      if (!hostPermitido(u.hostname, base)) return;

      const ct = res.headers()['content-type'] || '';
      const method = req.method();

      // GraphQL: operação vem na query (?OpName) ou no corpo (operationName).
      const post = req.postDataJSON ? req.postDataJSON() : undefined;
      const isGraphql = /graphql/i.test(u.pathname);
      const operation = isGraphql
        ? (post && post.operationName) || [...u.searchParams.keys()][0] || '(anônima)'
        : null;
      // Nomes de variáveis apenas — NUNCA os valores.
      const variableNames = post && post.variables ? Object.keys(post.variables) : [];
      // Texto da query GraphQL (forma, não dados) — útil para a coleção Postman.
      const query = isGraphql && post && typeof post.query === 'string' ? post.query : null;

      const key = isGraphql
        ? `${u.hostname}${u.pathname}#${operation}`
        : `${method} ${u.hostname}${u.pathname}`;

      let respSchema = '(não-JSON)';
      if (/application\/json/i.test(ct)) {
        const body = await res.json().catch(() => undefined);
        if (body !== undefined) respSchema = schema(body);
      }

      if (!endpoints.has(key)) {
        endpoints.set(key, {
          sistema: systemByHost(u.hostname) || u.hostname, // agrupa por sistema
          tipo: isGraphql ? 'graphql' : 'rest',
          method,
          host: u.hostname,
          path: u.pathname,
          operation,
          variableNames, // só NOMES, nunca valores
          query, // texto da query GraphQL (forma), quando houver
          status: res.status(),
          contentType: ct.split(';')[0],
          responseSchema: respSchema,
        });
      }
    } catch {
      /* ignora respostas que não podem ser lidas */
    }
  });

  for (const rota of ROTAS) {
    try {
      await page.goto(new URL(rota, base).toString(), { waitUntil: 'domcontentloaded', timeout: 45_000 });
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
      await page.waitForTimeout(2000);
    } catch {
      /* segue para a próxima rota */
    }
  }

  await context.close();
  await browser.close();

  const fs = require('node:fs');
  const ARQ = 'test-results/api-capture.json';
  fs.mkdirSync('test-results', { recursive: true });

  // MERGE INCREMENTAL: acumula com capturas anteriores (cada rodada do
  // exploratório adiciona novas operações ao mesmo mapa). Dedup por chave.
  const porChave = new Map();
  if (fs.existsSync(ARQ)) {
    try {
      for (const op of JSON.parse(fs.readFileSync(ARQ, 'utf8')).operacoes || []) {
        porChave.set(`${op.sistema}|${op.tipo}|${op.operation || op.method + ' ' + op.path}`, op);
      }
    } catch { /* ignora capture anterior corrompida */ }
  }
  for (const op of endpoints.values()) {
    porChave.set(`${op.sistema}|${op.tipo}|${op.operation || op.method + ' ' + op.path}`, op);
  }
  const lista = [...porChave.values()].sort((a, b) =>
    `${a.sistema}|${a.operation || a.path}`.localeCompare(`${b.sistema}|${b.operation || b.path}`),
  );

  // Mapa de máquina (PII-safe: forma/esquema, nomes de variáveis, texto de query).
  fs.writeFileSync(ARQ, JSON.stringify({ baseUrl: base, operacoes: lista }, null, 2));
  console.log('MAPA_SALVO:', ARQ, `(${lista.length} operações acumuladas)`);

  // Atualiza a coleção Postman automaticamente — assim ela cresce DURANTE o
  // exploratório, pronta para importar a qualquer momento.
  try {
    execFileSync('node', ['scripts/export-postman.cjs'], { stdio: 'inherit' });
  } catch { console.log('(export Postman falhou — rode `npm run export:postman` manualmente)'); }

  console.log('TOTAL_OPERACOES (nesta rodada):', endpoints.size);
  console.log('OPERACOES:', JSON.stringify(lista.map((e) => ({ tipo: e.tipo, operation: e.operation, host: e.host, path: e.path, status: e.status })), null, 2));
  console.log('\n===== ESQUEMAS (valores redigidos) =====');
  for (const e of lista) {
    console.log(`\n### ${e.operation || e.method + ' ' + e.path}  [${e.host}]  status=${e.status}`);
    console.log('variáveis:', JSON.stringify(e.variableNames));
    console.log('resposta:', JSON.stringify(e.responseSchema, null, 2));
  }
})();
