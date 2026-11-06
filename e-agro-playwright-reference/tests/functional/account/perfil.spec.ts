/**
 * Cenário funcional de PERFIL autenticado (READ-ONLY) — e-Agro.
 *
 * Verifica que, autenticado, o usuário tem acesso ao seu painel e ao menu da
 * conta (perfil). Não abre telas de edição, não altera dados. A asserção usa o
 * prefixo "Olá," do botão de conta (sem embutir o nome do usuário no código,
 * evitando PII) e o botão "Meu painel".
 *
 * Pré-condição: sessão de `npm run auth:login`. Sem ela, auto-ignora.
 */
import { existsSync } from 'node:fs';
import { test, expect } from '../../../src/fixtures/test-fixtures';
import { IS_PROD_BASELINE } from '../../../src/config/baseline';

const hasSession = existsSync('playwright/.auth/user.json');

test.describe('Perfil autenticado (read-only) @functional @smoke', () => {
  test.skip(
    !IS_PROD_BASELINE || !hasSession,
    'Exemplo baseline de produção (APP_ENV=prod + sessão). Recriar em homolog.',
  );

  test('painel e menu da conta (perfil) estão acessíveis', async ({ page }) => {
    await page.goto('/dashboard/DashboardPage');

    // Acesso ao painel do usuário.
    await expect(page.getByRole('button', { name: 'Meu painel' }).first()).toBeVisible();

    // Entrada do menu de conta/perfil (prefixo "Olá," — sem PII no código).
    await expect(page.getByRole('button', { name: /^ol[aá],/i }).first()).toBeVisible();
  });
});
