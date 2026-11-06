/**
 * Teste de mesa — CT-DEMO-01 (Cadastro de Produtor, fictício, autocontido).
 *
 * Valida o FLUXO geral: história/Gherkin → exploratório → teste → evidência.
 * Usa o mesmo mini-app do exploratório (`tests/_fixtures/mini-app.html`) via
 * setContent — não depende do e-Agro, roda em qualquer ambiente.
 *
 * Seletores vêm do mapa (`docs/EXPLORATORIO_demo-cadastro.md`); massa do faker.
 */
import { readFileSync } from 'node:fs';
import { test, expect } from '../../src/fixtures/test-fixtures';
import { CadastroProdutorPage } from '../../src/pages/demo/cadastro-produtor/CadastroProdutorPage';
import { fakerPT_BR as faker } from '@faker-js/faker';

const MINI_APP = readFileSync('tests/_fixtures/mini-app.html', 'utf8');

test.describe('Cadastro de Produtor (teste de mesa) @local', () => {
  test('cadastrar produtor com dados válidos @CT-DEMO-01', async ({
    page,
    evidencia,
  }) => {
    const cadastro = new CadastroProdutorPage(page);

    // Dado que acesso a tela de cadastro de produtor
    await page.setContent(MINI_APP);
    await expect(cadastro.titulo()).toBeVisible();
    await evidencia.passo('tela de cadastro');

    // Quando informo nome e CPF e confirmo (massa sintética)
    const nome = faker.person.fullName();
    const cpf = faker.string.numeric(11);
    await cadastro.cadastrar(nome, cpf);
    await evidencia.passo('dados preenchidos e enviados');

    // Então vejo a mensagem de sucesso
    await expect(cadastro.mensagemStatus()).toHaveText(
      'Produtor cadastrado com sucesso',
    );
    await evidencia.passo('cadastro confirmado');
  });
});
