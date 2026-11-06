/**
 * Autenticação interativa ÚNICA (headed) — padrão para MFA/2FA.
 *
 * Abre um navegador VISÍVEL, preenche usuário/senha a partir do .env e para na
 * etapa de 2FA. VOCÊ escolhe o canal, recebe o código e digita na janela.
 * Ao detectar login concluído (retorno a e-agro.com.br), salva o storage state
 * em playwright/.auth/user.json (ignorado pelo Git) para reutilização.
 *
 * Nenhuma senha/cookie/token é impresso. Somente leitura/navegação.
 *
 * Uso:  npm run auth:login
 */
require('dotenv').config();
const { chromium } = require('@playwright/test');

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
    await page.getByRole('button', { name: /entre.*cadastre/i }).first().click();
    await page.getByRole('button', { name: 'Entre', exact: true }).first().click();
    await page.waitForURL(/sso\.e-agro\.com\.br/, { timeout: 30_000 });

    await page.locator('input[name="username"]').fill(user);
    await page.locator('input[name="password"]').fill(pass);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();

    console.log('\n>>> Credenciais enviadas. Agora, NA JANELA DO NAVEGADOR:');
    console.log('    1) Escolha o canal (E-mail/SMS) e clique em "Continuar".');
    console.log('    2) Digite o código de verificação recebido.');
    console.log('    3) Conclua o login. Aguardando...\n');

    // Espera observável pelo retorno ao e-agro (login concluído). Sem sleep fixo.
    await page.waitForURL(/\/\/e-agro\.com\.br/, { timeout: 300_000 });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});

    await context.storageState({ path: 'playwright/.auth/user.json' });
    console.log('✅ Login concluído. Storage state salvo em playwright/.auth/user.json');
    console.log('URL_FINAL:', page.url());
  } catch (err) {
    console.log('⚠️ Não foi possível concluir o login no tempo esperado.');
    console.log('ERRO:', err && err.message ? err.message : String(err));
    console.log('URL_NO_ERRO:', page.url());
  } finally {
    await browser.close();
  }
})();
