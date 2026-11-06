/**
 * Teste funcional de referência — jornada CPR Dollar (consulta/navegação).
 *
 * MANTIDO COMO SKIP pelos mesmos motivos do spec CPR. NÃO presumir que CPR e
 * CPR Dollar compartilham tela ou regras — mapear o fluxo real separadamente
 * (docs/IMPLEMENTATION_PLAN.md, P2) antes de habilitar.
 */
import { test, expect } from '../../../src/fixtures/test-fixtures';

test.skip('CPR Dollar — consulta autorizada @functional', async ({
  cprDollarPage,
}) => {
  await cprDollarPage.open();

  await expect(cprDollarPage.form()).toBeVisible();
});
