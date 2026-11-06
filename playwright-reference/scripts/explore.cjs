/**
 * Script de exploração DESCARTÁVEL — não faz parte da suíte de testes.
 * Abre a página e imprime sua ESTRUTURA ACESSÍVEL (roles/labels) para que
 * possamos escrever seletores reais. NÃO imprime senha, cookies nem tokens.
 *
 * Uso: node scripts/explore.cjs [caminho]   (ex.: node scripts/explore.cjs /)
 */
require('dotenv').config();
const { chromium } = require('@playwright/test');

(async () => {
  const base = process.env.BASE_URL;
  const path = process.argv[2] || '/';
  if (!base) throw new Error('BASE_URL ausente no .env');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(new URL(path, base).toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 45_000,
    });
    // Dá tempo de SPA React hidratar sem usar sleep como sincronização de teste.
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});

    console.log('URL_FINAL:', page.url());
    console.log('TITULO:', await page.title());
    console.log('----- ARIA SNAPSHOT (body) -----');
    const snapshot = await page.locator('body').ariaSnapshot();
    console.log(snapshot);
  } catch (err) {
    console.log('ERRO_NAVEGACAO:', err && err.message ? err.message : String(err));
    console.log('URL_NO_ERRO:', page.url());
  } finally {
    await browser.close();
  }
})();
