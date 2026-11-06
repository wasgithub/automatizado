/**
 * Demo LOCAL da evidência passo a passo (sem e-Agro).
 *
 * Mostra a fixture `evidencia` gerando prints numerados em
 * `evidencias/<feature>/<CT>/`. Rode com `EVIDENCE=1`:
 *
 *   EVIDENCE=1 npx playwright test --project=local --grep @CT-DEMO
 *
 * Sem EVIDENCE, a fixture é no-op (não gera arquivos).
 */
import { test, expect } from '../../src/fixtures/test-fixtures';

const HTML = `
  <main>
    <h1>Demonstração de evidência</h1>
    <button type="button" data-testid="confirmar">Confirmar</button>
    <p id="status">pendente</p>
  </main>
  <script>
    document.querySelector('[data-testid=confirmar]')
      .addEventListener('click', () => { document.getElementById('status').textContent = 'confirmado'; });
  </script>
`;

test('evidência passo a passo em caso de sucesso @local @CT-DEMO', async ({
  page,
  evidencia,
}) => {
  await page.setContent(HTML);
  await evidencia.passo('tela inicial');

  await expect(page.getByRole('heading', { name: 'Demonstração de evidência' })).toBeVisible();

  await page.getByTestId('confirmar').click();
  await evidencia.passo('apos confirmar');

  await expect(page.locator('#status')).toHaveText('confirmado');
});
