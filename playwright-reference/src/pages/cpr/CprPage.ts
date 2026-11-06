/**
 * Page Object do domínio CPR — TEMPLATE genérico.
 *
 * Rotas e seletores abaixo são PLACEHOLDERS. Confirme os valores reais no
 * exploratório do ambiente alvo (`docs/EXPLORATORIO_*.md`) antes de usar.
 * Ações/locators aqui; asserts de negócio no teste.
 */
import type { Locator, Page } from '@playwright/test';
import { BaseNavigation } from '../shared/BaseNavigation';

export class CprPage extends BaseNavigation {
  constructor(page: Page) {
    super(page);
  }

  /** Confirmar a rota real no exploratório. */
  private readonly path = '/cpr';

  async abrir(): Promise<void> {
    await this.page.goto(this.path);
  }

  /** Contêiner semântico do formulário (ajustar ao nome acessível real). */
  form(): Locator {
    return this.page.getByRole('form', { name: /cpr/i });
  }
}
