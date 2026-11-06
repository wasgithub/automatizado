/**
 * Component Object para um diálogo de confirmação reutilizável (widget React).
 *
 * EXEMPLO DE REFERÊNCIA — demonstra o padrão de Component Object: encapsula um
 * componente reutilizável (não uma página inteira) e recebe um `Locator` raiz,
 * tornando-o reutilizável em qualquer tela que renderize o diálogo.
 *
 * Seletores seguem o contrato (getByRole primeiro). Ajuste os nomes acessíveis
 * quando o componente real for mapeado — ver docs/SELECTOR_CONTRACT.md.
 */
import type { Locator, Page } from '@playwright/test';

export class ConfirmDialog {
  readonly root: Locator;

  /**
   * @param scope Página ou locator pai onde o diálogo é procurado.
   */
  constructor(scope: Page | Locator) {
    // role=dialog é o contêiner semântico padrão de modais acessíveis.
    this.root = scope.getByRole('dialog');
  }

  title(): Locator {
    return this.root.getByRole('heading');
  }

  async confirm(): Promise<void> {
    await this.root.getByRole('button', { name: /confirmar/i }).click();
  }

  async cancel(): Promise<void> {
    await this.root.getByRole('button', { name: /cancelar/i }).click();
  }
}
