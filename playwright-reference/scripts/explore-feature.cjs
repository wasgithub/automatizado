/**
 * Crawler EXPLORATÓRIO read-only de uma ÁREA — descoberta de navegação.
 * Grava, por tela, o INVENTÁRIO COMPLETO (botões, inputs, selects, combos,
 * radios/checkboxes, links, tabs) e as operações de API. NÃO clica botões de
 * ação (apenas cataloga) — para criação, use scripts/record-journey.cjs.
 *
 * PII-safe (nomes/tipos/rótulos). Filtro de host derivado de BASE_URL.
 *
 * Uso: node scripts/explore-feature.cjs <rotaInicial> [profundidade]
 */
require('dotenv').config();
const { chromium } = require('@playwright/test');
const { inventarioNoNavegador } = require('./lib/inventory.cjs');

const ACAO = /comprar|contratar|simular|salvar|confirmar|adicionar|incluir|enviar|pagar|finalizar|excluir|remover|deletar|carrinho|checkout|assinar|aceitar|cancelar/i;
const ROTA_BLOCK = /cart|checkout|carrinho|pagamento|contratacao|contratação|finaliza/i;

function schema(v, d = 0) {
  if (d > 5) return '…';
  if (v === null) return 'null';
  if (Array.isArray(v)) return v.length ? ['array', schema(v[0], d + 1)] : ['array(vazio)'];
  if (typeof v === 'object') { const o = {}; for (const k of Object.keys(v).slice(0, 40)) o[k] = schema(v[k], d + 1); return o; }
  return typeof v;
}
const pathOnly = (href, base) => { try { return new URL(href, base).pathname; } catch { return null; } };
function hostPermitido(hostname, base) {
  try {
    const bh = new URL(base).hostname;
    if (hostname === bh) return true;
    const raiz = bh.split('.').slice(-2).join('.');
    return hostname === raiz || hostname.endsWith('.' + raiz);
  } catch { return false; }
}

(async () => {
  const base = process.env.BASE_URL;
  if (!base) throw new Error('Defina BASE_URL no .env (ambiente alvo).');
  const seed = process.argv[2];
  const maxDepth = Number(process.argv[3] ?? 1);
  if (!seed) throw new Error('Informe a rota inicial. Ex: node scripts/explore-feature.cjs /area 1');
  const prefix = '/' + seed.replace(/^\//, '').split('/')[0];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(require('node:fs').existsSync('playwright/.auth/user.json') ? { storageState: 'playwright/.auth/user.json' } : {});

  const apisPorRota = {};
  const paginas = [];
  const visitadas = new Set();
  const fila = [{ rota: seed, depth: 0 }];

  while (fila.length) {
    const { rota, depth } = fila.shift();
    if (visitadas.has(rota) || ROTA_BLOCK.test(rota)) continue;
    visitadas.add(rota);

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
        apis.set(op, { operation: op, variaveis: post && post.variables ? Object.keys(post.variables) : [], status: res.status(), resposta: resp });
      } catch { /* ignore */ }
    });

    let ok = true;
    try {
      await page.goto(new URL(rota, base).toString(), { waitUntil: 'domcontentloaded', timeout: 45_000 });
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await page.waitForTimeout(1500);
    } catch { ok = false; }

    const rotaFinal = pathOnly(page.url(), base);
    if (ok) {
      const inv = await page.evaluate(inventarioNoNavegador);
      paginas.push({
        rota, rotaFinal, redirecionou: rotaFinal !== rota,
        ...inv,
        botoesAcao_NAO_acionados: inv.botoes.map((b) => b.nome).filter((n) => ACAO.test(n)),
      });
      apisPorRota[rota] = [...apis.values()];

      if (depth < maxDepth) {
        for (const href of inv.links) {
          const p = pathOnly(href, base);
          if (p && p.startsWith(prefix) && !visitadas.has(p) && !ROTA_BLOCK.test(p)) fila.push({ rota: p, depth: depth + 1 });
        }
      }
    }
    await page.close();
  }

  await context.close();
  await browser.close();
  console.log(JSON.stringify({ area: prefix, paginas, apisPorRota }, null, 2));
})();
