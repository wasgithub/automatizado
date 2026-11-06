/**
 * Feature: CPR · Login (SSO Keycloak) — e-Agro.
 *
 * Exemplo de organização DOMÍNIO (cpr) → FEATURE (login).
 *
 * O login começa SEMPRE deslogado — por isso este arquivo ignora o storageState
 * do projeto e usa um contexto anônimo. O teste de renderização do formulário é
 * REAL e executável (não submete credenciais → sem 2FA, sem risco de bloqueio).
 * O login completo exige 2FA interativo e fica documentado/ignorado.
 */
import { test, expect } from '../../../../src/fixtures/test-fixtures';
import { CprLoginPage } from '../../../../src/pages/cpr/login/CprLoginPage';
import { IS_PROD_BASELINE } from '../../../../src/config/baseline';

// Força contexto anônimo (sobrepõe o storageState do projeto chromium).
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('CPR · Login (SSO) @functional @smoke', () => {
  // Fluxo de entrada observado em produção; recrie em homolog.
  test.skip(!IS_PROD_BASELINE, 'Exemplo baseline de produção. Recriar em homolog.');

  // Rastreabilidade: features/cpr/login/login.feature
  // Evidência: rode com EVIDENCE=1 para gerar prints em evidencias/cpr/login/CT-001/
  test('exibe o formulário de login do SSO após acessar "Entre" @CT-001', async ({
    page,
    evidencia,
  }) => {
    const login = new CprLoginPage(page);

    await login.irParaLogin();
    await evidencia.passo('formulario de login exibido');

    await expect(page).toHaveURL(/sso\.e-agro\.com\.br/);
    await expect(login.campoUsuario()).toBeVisible();
    await expect(login.campoSenha()).toBeVisible();
    await expect(login.botaoEntrar()).toBeVisible();
  });

  // Login completo com credenciais → leva à etapa de 2FA (código por e-mail/SMS),
  // que é INTERATIVA e não automatizável em headless. Fluxo real e seguro:
  // `npm run auth:login` (ver docs/AUTHENTICATION.md). Mantido como skip.
  test.skip('login completo autenticado (requer 2FA interativo) @CT-002', async ({
    page,
  }) => {
    const login = new CprLoginPage(page);

    await login.irParaLogin();
    await login.informarCredenciais(
      process.env.EAGRO_USER ?? '',
      process.env.EAGRO_PASSWORD ?? '',
    );
    await login.enviar();

    // Credenciais válidas levam à verificação em duas etapas.
    await expect(login.etapaVerificacao2FA()).toBeVisible();
    // >>> A partir daqui: escolher canal, digitar o código e concluir (manual).
  });
});
