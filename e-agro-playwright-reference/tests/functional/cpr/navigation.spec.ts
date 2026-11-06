/**
 * Teste funcional CPR — smoke de acesso autenticado ao dashboard (READ-ONLY).
 *
 * É um teste REAL e executável contra o e-Agro, estritamente de leitura:
 * apenas carrega o dashboard e verifica um marco de UI que só existe quando
 * autenticado ("Meu painel"). Não preenche formulários, não contrata, não
 * altera dado algum.
 *
 * Pré-condição: sessão válida gerada por `npm run auth:login` (2FA). Sem ela,
 * o teste se auto-ignora (não tenta logar). Se a sessão expirar, o teste falha
 * ao ser redirecionado ao SSO — rode `npm run auth:login` novamente.
 */
import { existsSync } from 'node:fs';
import { test, expect } from '../../../src/fixtures/test-fixtures';
import { IS_PROD_BASELINE } from '../../../src/config/baseline';

const hasSession = existsSync('playwright/.auth/user.json');

test.describe('CPR — acesso autenticado @functional @smoke', () => {
  test.skip(
    !IS_PROD_BASELINE || !hasSession,
    'Exemplo baseline de produção (APP_ENV=prod + sessão). Recriar em homolog.',
  );

  test('dashboard carrega e exibe o painel do usuário', async ({
    page,
    cprPage,
  }) => {
    await cprPage.openDashboard();

    await expect(page).toHaveURL(/\/dashboard\/DashboardPage/);
    await expect(cprPage.meuPainel()).toBeVisible();
  });
});
