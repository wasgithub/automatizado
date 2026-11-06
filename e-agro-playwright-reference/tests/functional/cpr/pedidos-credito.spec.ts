/**
 * Consulta CPR — "Meus pedidos de crédito" (READ-ONLY).
 *
 * MANTIDO COMO SKIP com justificativa:
 * - Rota real: /simulationlogged/creditcontractpage
 * - Deep-link direto retorna página de erro ("sistema está fora do ar");
 *   só carrega via navegação IN-APP (dashboard → menu da conta → item).
 * - Durante o mapeamento a página não expôs um título/landmark estável, então
 *   não há marco confiável para asserção read-only ainda.
 *
 * Habilitar quando: a página estabilizar E tivermos um marco estável (título,
 * tabela com cabeçalho acessível, estado vazio com texto fixo) para assertar
 * sem depender de dados pessoais. Ver docs/SELECTOR_CONTRACT.md.
 */
import { test, expect } from '../../../src/fixtures/test-fixtures';

test.skip('CPR — consulta "Meus pedidos de crédito" @functional', async ({
  page,
}) => {
  // Navegação IN-APP (deep-link falha): dashboard → menu da conta → item.
  await page.goto('/dashboard/DashboardPage');
  await page.getByRole('button', { name: /^ol[aá],/i }).first().click();
  await page.getByRole('button', { name: /pedidos de cr[eé]dito/i }).first().click();

  await expect(page).toHaveURL(/creditcontractpage/);
  // TODO: assertar um marco estável quando a página estabilizar.
});
