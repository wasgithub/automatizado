/**
 * Autenticação interativa ÚNICA (headed) — padrão para MFA/2FA.
 *
 * Abre um navegador VISÍVEL, preenche usuário/senha a partir do .env e para na
 * etapa de 2FA. VOCÊ conclui o 2FA na janela. Ao detectar login concluído
 * (saída do realm Keycloak), salva o storage state em playwright/.auth/user.json.
 *
 * Genérico (SSO Keycloak). Ajuste o acionador de entrada ao app alvo se preciso.
 * Nenhuma senha/cookie/token é impresso. Uso: npm run auth:login
 */
require('dotenv').config();
const { chromium } = require('@playwright/test');

const SSO_REALM = /\/auth\/realms\//;

(async () => {
  const base = process.env.BASE_URL;
  const user = process.env.EAGRO_USER;
  const pass = process.env.EAGRO_PASSWORD;
  if (!base || !user || !pass) throw new Error('BASE_URL/EAGRO_USER/EAGRO_PASSWORD ausentes no .env');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});

    if (!SSO_REALM.test(page.url())) {
      await page.getByRole('button', { name: /entrar|entre|login/i }).first().click().catch(() => {});
      await page.waitForURL(SSO_REALM, { timeout: 30_000 });
    }

    await page.locator('input[name="username"]').fill(user);
    await page.locator('input[name="password"]').fill(pass);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();

    console.log('\n>>> Credenciais enviadas. Agora, NA JANELA DO NAVEGADOR:');
    console.log('    1) Conclua a verificação em duas etapas (2FA), se houver.');
    console.log('    2) Finalize o login. Aguardando...\n');

    // Login concluído quando sai do domínio do SSO (realm). Sem sleep fixo.
    await page.waitForURL((url) => !SSO_REALM.test(url.href), { timeout: 300_000 });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});

    await context.storageState({ path: 'playwright/.auth/user.json' });
    console.log('✅ Login concluído. Storage state salvo em playwright/.auth/user.json');
  } catch (err) {
    console.log('⚠️ Não foi possível concluir o login no tempo esperado.');
    console.log('ERRO:', err && err.message ? err.message : String(err));
  } finally {
    await browser.close();
  }
})();
