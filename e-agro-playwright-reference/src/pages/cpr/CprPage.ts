/**
 * Page Object do domínio CPR — e-Agro.
 *
 * Fatos CONFIRMADOS por exploração autenticada (read-only):
 * - Após login (SSO + 2FA), o hub é o dashboard: `/dashboard/DashboardPage`.
 * - Deep-links para fluxos (ex.: `/simulacao-de-cpr`) REDIRECIONAM ao dashboard
 *   quando autenticado; a navegação acontece via cliques in-app.
 * - Marcos visíveis e estáveis no dashboard: botões "Meu painel",
 *   "Linhas de Crédito", "CPR PJ".
 *
 * Ainda NÃO mapeado (precisa de confirmação do usuário sobre o que é seguro):
 * - jornada completa de "simular CPR" / contratação (envolve mutação → NÃO
 *   automatizar sem autorização explícita);
 * - listagem "Meus pedidos de crédito" (consulta) — está em menu; confirmar
 *   o caminho de abertura.
 *
 * Regras: apenas AÇÕES e LOCATORS; asserts de negócio ficam no teste. Sem
 * sleeps; confia em auto-waiting.
 */
import type { Locator, Page } from '@playwright/test';
import { BaseNavigation } from '../shared/BaseNavigation';

export class CprPage extends BaseNavigation {
  constructor(page: Page) {
    super(page);
  }

  /** Hub pós-login. */
  private readonly dashboardPath = '/dashboard/DashboardPage';

  async openDashboard(): Promise<void> {
    await this.page.goto(this.dashboardPath);
  }

  /** Marco visível somente quando autenticado. */
  meuPainel(): Locator {
    return this.page.getByRole('button', { name: 'Meu painel' }).first();
  }

  linhasDeCredito(): Locator {
    return this.page.getByRole('button', { name: 'Linhas de Crédito' }).first();
  }

  /** Entrada do produto CPR PJ no dashboard. */
  cprPj(): Locator {
    return this.page.getByRole('button', { name: 'CPR PJ' }).first();
  }
}
