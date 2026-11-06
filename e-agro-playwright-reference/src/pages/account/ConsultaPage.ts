/**
 * Page Object genérico para páginas de CONSULTA (read-only) da área logada.
 *
 * Várias telas de consulta compartilham o mesmo padrão: abrir por rota e exibir
 * um título de página estável. Este Page Object encapsula esse padrão sem
 * inventar nada — rota e título são injetados pelo teste (data-driven).
 *
 * NÃO contém asserts (ficam no teste) nem conhece dados do usuário. Somente
 * leitura/navegação.
 */
import type { Locator, Page } from '@playwright/test';

export class ConsultaPage {
  constructor(
    private readonly page: Page,
    private readonly path: string,
  ) {}

  /** Abre a consulta por deep-link (rotas validadas como deep-linkáveis). */
  async abrir(): Promise<void> {
    await this.page.goto(this.path);
  }

  /** Título da página — marco estável e sem dados pessoais. */
  tituloPagina(nome: string | RegExp): Locator {
    return this.page.getByRole('heading', { name: nome }).first();
  }
}
