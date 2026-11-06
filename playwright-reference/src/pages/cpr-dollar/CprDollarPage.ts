/**
 * Page Object do fluxo CPR Dollar.
 *
 * EXEMPLO DE REFERÊNCIA — mantido SEPARADO de CprPage de propósito: não
 * presuma que CPR e CPR Dollar compartilham tela, rota ou regras. A extração
 * de componentes comuns só deve ocorrer após mapear ambos os fluxos reais
 * (ver docs/IMPLEMENTATION_PLAN.md, P2).
 *
 * Caminhos/labels abaixo são ILUSTRATIVOS. Não invente seletores reais.
 */
import type { Locator, Page } from '@playwright/test';
import { BaseNavigation } from '../shared/BaseNavigation';

export class CprDollarPage extends BaseNavigation {
  constructor(page: Page) {
    super(page);
  }

  /** Confirmar rota real com o time. */
  private readonly path = '/cpr-dollar';

  async open(): Promise<void> {
    await this.page.goto(this.path);
  }

  form(): Locator {
    return this.page.getByRole('form', { name: /cpr dollar/i });
  }

  /** Campo de câmbio — específico do produto em dólar; confirmar rótulo. */
  cotacaoField(): Locator {
    return this.page.getByLabel(/cota[çc][aã]o|c[aâ]mbio/i);
  }
}
