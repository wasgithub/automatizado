/**
 * Demo LOCAL do Component Object `DataTable` (sem o sistema).
 * Prova o padrão de componente reutilizável por role, via setContent.
 */
import { test, expect } from '../../src/fixtures/test-fixtures';
import { DataTable } from '../../src/components/DataTable';

const HTML = `
  <table aria-label="Cotações">
    <thead><tr><th>Produto</th><th>Preço</th></tr></thead>
    <tbody>
      <tr><td>Soja</td><td>100</td></tr>
      <tr><td>Milho</td><td>50</td></tr>
    </tbody>
  </table>
`;

test.describe('Component Object DataTable (local) @local', () => {
  test('localiza tabela, cabeçalhos e linha por texto', async ({ page }) => {
    await page.setContent(HTML);
    const tabela = new DataTable(page, 'Cotações');

    await expect(tabela.root).toBeVisible();
    await expect(tabela.cabecalhos()).toHaveText(['Produto', 'Preço']);
    await expect(tabela.celulas('Milho')).toHaveText(['Milho', '50']);
  });
});
