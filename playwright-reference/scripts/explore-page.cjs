/**
 * Exploração AUTENTICADA e DESCARTÁVEL de uma rota — inventário PII-safe de
 * controles (rótulos de UI), sem preencher nem enviar formulários, sem imprimir
 * dados. Uso: node scripts/explore-page.cjs /simulacao-de-cpr
 */
require('dotenv').config();
const { chromium } = require('@playwright/test');
const pathOnly = (href, base) => { try { return new URL(href, base).pathname; } catch { return href; } };

(async () => {
  const base = process.env.BASE_URL;
  const path = process.argv[2] || '/';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: 'playwright/.auth/user.json' });
  const page = await context.newPage();
  try {
    await page.goto(new URL(path, base).toString(), { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
    await page.waitForTimeout(1200);
    console.log('ROTA_FINAL:', pathOnly(page.url(), base));

    const inv = await page.evaluate(() => {
      const nm = (el) => (el.getAttribute('aria-label') || el.textContent || el.getAttribute('placeholder') || '').trim().slice(0, 50);
      const bySel = (sel) => [...new Set(Array.from(document.querySelectorAll(sel)).map(nm).filter(Boolean))];
      const inputs = Array.from(document.querySelectorAll('input,select,textarea')).map((el) => ({
        tag: el.tagName.toLowerCase(), type: el.getAttribute('type'), name: el.getAttribute('name'),
        id: el.id || null, placeholder: el.getAttribute('placeholder'),
        label: el.labels && el.labels[0] ? el.labels[0].textContent.trim().slice(0, 40) : null,
      }));
      return { headings: bySel('h1,h2,h3,[role=heading]').slice(0, 15), buttons: bySel('button,[role=button]').slice(0, 30), tabs: bySel('[role=tab]'), inputs };
    });
    console.log('HEADINGS:', JSON.stringify(inv.headings, null, 2));
    console.log('BUTTONS:', JSON.stringify(inv.buttons, null, 2));
    console.log('TABS:', JSON.stringify(inv.tabs, null, 2));
    console.log('INPUTS:', JSON.stringify(inv.inputs, null, 2));
  } catch (err) {
    console.log('ERRO:', err && err.message ? err.message : String(err));
    console.log('ROTA_NO_ERRO:', pathOnly(page.url(), base));
  } finally {
    await browser.close();
  }
})();
