/**
 * Crawler EXPLORATÓRIO read-only e PII-safe de uma ÁREA/feature do e-Agro.
 *
 * Objetivo: gravar automaticamente tudo que importa para desenhar cenários —
 * rotas, títulos, CAMPOS (nome/tipo/rótulo), BOTÕES (navegação vs ação) e as
 * OPERAÇÕES de API (GraphQL) com o esquema da resposta.
 *
 * SEGURANÇA (produção, conta real):
 * - NUNCA clica botões de ação/mutação (blocklist por rótulo) — só cataloga.
 * - Segue apenas links de navegação (anchors same-origin) fora da blocklist de
 *   rotas (checkout/carrinho/pagamento/contratação).
 * - Profundidade limitada; só rotas sob o prefixo informado + rotas semente.
 * - PII-safe: grava nomes/tipos/rótulos; descarta valores, CPF, tokens.
 *
 * Uso:  node scripts/explore-feature.cjs <rotaInicial> [profundidade]
 *       node scripts/explore-feature.cjs /resumo-financeiro 0
 */
require('dotenv').config();
const { chromium } = require('@playwright/test');

const PII = /washington|alexandre|silva/i;
const ACAO = /comprar|contratar|simular|salvar|confirmar|adicionar|incluir|enviar|pagar|finalizar|excluir|remover|deletar|carrinho|checkout|assinar|aceitar|cancelar/i;
const ROTA_BLOCK = /cart|checkout|carrinho|pagamento|contratacao|contratação|simulacao-de|finaliza/i;

function schema(v, d = 0) {
  if (d > 5) return '…';
  if (v === null) return 'null';
  if (Array.isArray(v)) return v.length ? ['array', schema(v[0], d + 1)] : ['array(vazio)'];
  if (typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v).slice(0, 40)) o[k] = schema(v[k], d + 1);
    return o;
  }
  return typeof v; // valor redigido — só o tipo
}
const pathOnly = (href, base) => { try { return new URL(href, base).pathname; } catch { return null; } };

async function inventariar(page, base) {
  return page.evaluate((piiSrc) => {
    const PIIre = new RegExp(piiSrc, 'i');
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const txt = (el) => (el.getAttribute('aria-label') || el.textContent || el.getAttribute('placeholder') || '').trim().replace(/\s+/g, ' ').slice(0, 60);
    const uniq = (a) => [...new Set(a)];

    const headings = uniq(Array.from(document.querySelectorAll('h1,h2,h3,[role=heading]')).map(txt).filter((t) => t && !PIIre.test(t))).slice(0, 15);
    const buttons = uniq(Array.from(document.querySelectorAll('button,[role=button],input[type=submit]')).filter(vis).map(txt).filter(Boolean));
    const tabs = uniq(Array.from(document.querySelectorAll('[role=tab]')).map(txt).filter(Boolean));
    const fields = Array.from(document.querySelectorAll('input,select,textarea')).filter(vis).map((el) => ({
      tag: el.tagName.toLowerCase(), type: el.getAttribute('type'), name: el.getAttribute('name'),
      id: el.id || null, placeholder: el.getAttribute('placeholder'),
      label: el.labels && el.labels[0] ? el.labels[0].textContent.trim().slice(0, 40) : null,
      role: el.getAttribute('role'),
    }));
    const links = uniq(Array.from(document.querySelectorAll('a[href]')).filter(vis).map((a) => a.getAttribute('href')).filter(Boolean));
    return { headings, buttons, tabs, fields, links };
  }, piiSource);
}
const piiSource = PII.source;

(async () => {
  const base = process.env.BASE_URL;
  const seed = process.argv[2];
  const maxDepth = Number(process.argv[3] ?? 1);
  if (!seed) throw new Error('Informe a rota inicial. Ex: node scripts/explore-feature.cjs /resumo-financeiro 1');
  const prefix = '/' + seed.replace(/^\//, '').split('/')[0]; // área pelo 1º segmento

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: 'playwright/.auth/user.json' });

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
        if (!/e-?agro/i.test(u.hostname)) return;
        const post = req.postDataJSON ? req.postDataJSON() : undefined;
        const op = /graphql/i.test(u.pathname) ? (post && post.operationName) || '(anon)' : `${req.method()} ${u.pathname}`;
        if (apis.has(op)) return;
        let resp = '(não-JSON)';
        if (/application\/json/i.test(res.headers()['content-type'] || '')) {
          const b = await res.json().catch(() => undefined);
          if (b !== undefined) resp = schema(b);
        }
        apis.set(op, { operation: op, host: u.hostname, variaveis: post && post.variables ? Object.keys(post.variables) : [], status: res.status(), resposta: resp });
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
      const inv = await inventariar(page, base);
      const botoesAcao = inv.buttons.filter((b) => ACAO.test(b));
      const botoesNav = inv.buttons.filter((b) => !ACAO.test(b));
      paginas.push({
        rota, rotaFinal, redirecionou: rotaFinal !== rota,
        titulos: inv.headings,
        campos: inv.fields,
        botoesNavegacao: botoesNav,
        botoesAcao_NAO_acionados: botoesAcao,
        tabs: inv.tabs,
      });
      apisPorRota[rota] = [...apis.values()];

      // Enfileira links de navegação dentro da área (same-origin, sob o prefixo).
      if (depth < maxDepth) {
        for (const href of inv.links) {
          const p = pathOnly(href, base);
          if (p && p.startsWith(prefix) && !visitadas.has(p) && !ROTA_BLOCK.test(p)) {
            fila.push({ rota: p, depth: depth + 1 });
          }
        }
      }
    }
    await page.close();
  }

  await context.close();
  await browser.close();
  console.log(JSON.stringify({ area: prefix, paginas, apisPorRota }, null, 2));
})();
