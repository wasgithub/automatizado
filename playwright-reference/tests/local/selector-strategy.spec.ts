/**
 * Testes LOCAIS e SEGUROS — não dependem do sistema.
 *
 * Objetivo: provar que o harness (Playwright + config + TypeScript) funciona de
 * verdade e que a estratégia de seletores e as factories se comportam como
 * documentado. Toda a interação ocorre contra HTML inline via `setContent`,
 * sem rede, sem credenciais e sem acessar a aplicação real.
 *
 * Estes testes PODEM e DEVEM rodar em qualquer ambiente (inclusive CI) e são
 * os únicos executáveis até o fluxo real do sistema ser mapeado.
 */
import { test, expect } from '@playwright/test';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { makeCpr } from '../../src/factories/cpr.factory';

// HTML acessível de demonstração: exercita a ordem do contrato de seletores
// (role > label > testid > texto). Não representa telas do sistema.
const DEMO_HTML = `
  <main>
    <form aria-label="CPR">
      <label for="valor">Valor</label>
      <input id="valor" name="valor" />
      <button type="button" data-testid="cpr-confirmar">Confirmar</button>
    </form>
    <div role="dialog" aria-label="Confirmação">
      <h2>Confirmar operação</h2>
      <button type="button">Confirmar</button>
      <button type="button">Cancelar</button>
    </div>
  </main>
`;

test.describe('estratégia de seletores (local, sem o sistema) @local', () => {
  test('getByRole localiza contêiner e controles semânticos', async ({
    page,
  }) => {
    await page.setContent(DEMO_HTML);

    await expect(page.getByRole('form', { name: 'CPR' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Confirmar' }).first(),
    ).toBeEnabled();
  });

  test('getByLabel associa rótulo ao campo via for/id', async ({ page }) => {
    await page.setContent(DEMO_HTML);

    const valor = page.getByLabel('Valor');
    await valor.fill('1234');
    await expect(valor).toHaveValue('1234');
  });

  test('getByTestId resolve elemento ambíguo', async ({ page }) => {
    await page.setContent(DEMO_HTML);

    await expect(page.getByTestId('cpr-confirmar')).toBeVisible();
  });

  test('Component Object encapsula o diálogo e opera por role', async ({
    page,
  }) => {
    await page.setContent(DEMO_HTML);

    const dialog = new ConfirmDialog(page);
    await expect(dialog.root).toBeVisible();
    await expect(dialog.title()).toHaveText('Confirmar operação');
  });
});

test.describe('factory de dados (local, sem o sistema) @local', () => {
  test('makeCpr gera referência única por runId', () => {
    const a = makeCpr();
    const b = makeCpr();

    expect(a.referencia).not.toBe(b.referencia);
    expect(a.referencia.startsWith('CPR-eagro-')).toBe(true);
    expect(a.moeda).toBe('BRL');
  });

  test('makeCpr respeita overrides e runId explícito', () => {
    const cpr = makeCpr({ runId: 'eagro-fixo-123', overrides: { valor: 500 } });

    expect(cpr.referencia).toBe('CPR-eagro-fixo-123');
    expect(cpr.valor).toBe(500);
  });
});
