/**
 * Feature: CPR · Login (SSO Keycloak) — EXEMPLO/template.
 *
 * Demonstra a organização DOMÍNIO (cpr) → FEATURE (login) e que o login começa
 * SEMPRE deslogado (contexto anônimo). É um TEMPLATE: só executa quando apontado
 * para um ambiente real (defina `RUN_LOGIN_EXAMPLE=1` e `BASE_URL`). Sem isso,
 * auto-ignora para manter a suíte verde.
 */
import { test, expect } from '../../../../src/fixtures/test-fixtures';
import { CprLoginPage, SSO_REALM } from '../../../../src/pages/cpr/login/CprLoginPage';

// Login começa deslogado: ignora o storageState do projeto.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('CPR · Login (SSO) @functional @smoke', () => {
  test.skip(
    !process.env.RUN_LOGIN_EXAMPLE || !process.env.BASE_URL,
    'Exemplo — defina RUN_LOGIN_EXAMPLE=1 e BASE_URL do ambiente alvo.',
  );

  // Rastreabilidade: features/cpr/login/login.feature
  test('exibe o formulário de login do SSO @CT-001', async ({ page, evidencia }) => {
    const login = new CprLoginPage(page);

    await login.irParaLogin();
    await evidencia.passo('formulario de login exibido');

    await expect(page).toHaveURL(SSO_REALM);
    await expect(login.campoUsuario()).toBeVisible();
    await expect(login.campoSenha()).toBeVisible();
    await expect(login.botaoEntrar()).toBeVisible();
  });
});
