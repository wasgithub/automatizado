/**
 * Component Object para uma TABELA de dados reutilizável (widget comum em telas
 * de consulta). Seletores por role (`table`/`row`/`cell`/`columnheader`) —
 * resilientes e reutilizáveis em QUALQUER tela que renderize uma tabela.
 *
 * É o padrão correto para "o mesmo widget em várias telas": encapsula o seletor
 * UMA vez; se a estrutura mudar, muda só aqui. Recebe um escopo (página ou
 * locator pai) e, opcionalmente, o nome acessível da tabela.
 */
import type { Locator, Page } from '@playwright/test';

export class DataTable {
  readonly root: Locator;

  constructor(scope: Page | Locator, nome?: string | RegExp) {
    this.root = nome ? scope.getByRole('table', { name: nome }) : scope.getByRole('table');
  }

  /** Todas as linhas (inclui a de cabeçalho, se marcada como row). */
  linhas(): Locator {
    return this.root.getByRole('row');
  }

  /** Cabeçalhos de coluna. */
  cabecalhos(): Locator {
    return this.root.getByRole('columnheader');
  }

  /** Linha que contém um texto estável (ex.: uma referência/ID único). */
  linhaPorTexto(texto: string | RegExp): Locator {
    return this.root.getByRole('row').filter({ hasText: texto });
  }

  /** Células de uma linha identificada por texto. */
  celulas(linhaTexto: string | RegExp): Locator {
    return this.linhaPorTexto(linhaTexto).getByRole('cell');
  }
}
