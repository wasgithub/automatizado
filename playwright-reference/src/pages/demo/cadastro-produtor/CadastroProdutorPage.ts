/**
 * Page Object — Cadastro de Produtor (TESTE DE MESA, fictício).
 *
 * Seletores vindos do exploratório (`docs/EXPLORATORIO_demo-cadastro.md`):
 * campos por `getByLabel`, botão por `getByTestId`, resultado por `role=status`.
 * Opera sobre a página já carregada (via setContent no teste).
 */
import type { Locator, Page } from '@playwright/test';

export class CadastroProdutorPage {
  constructor(private readonly page: Page) {}

  titulo(): Locator {
    return this.page.getByRole('heading', { name: 'Cadastro de Produtor' });
  }

  campoNome(): Locator {
    return this.page.getByLabel('Nome do produtor');
  }

  campoCpf(): Locator {
    return this.page.getByLabel('CPF');
  }

  botaoCadastrar(): Locator {
    return this.page.getByTestId('cadastrar-produtor');
  }

  mensagemStatus(): Locator {
    return this.page.getByRole('status');
  }

  async cadastrar(nome: string, cpf: string): Promise<void> {
    await this.campoNome().fill(nome);
    await this.campoCpf().fill(cpf);
    await this.botaoCadastrar().click();
  }
}
