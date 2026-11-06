/**
 * Cenários funcionais de CONSULTA autenticada (READ-ONLY) — e-Agro.
 *
 * Verificam acesso a páginas de consulta e a presença de um título de página
 * estável. NÃO preenchem formulários, NÃO salvam, NÃO alteram dados. Assertam
 * em rótulos de UI (títulos), nunca em dados pessoais.
 *
 * Rotas e títulos confirmados por exploração autenticada (deep-link válido):
 *   - /cotacoes/minhas-contacoes-de-preco  → "Cotações de preço"
 *   - /resumo-financeiro                   → "Extrato financeiro"
 *
 * Observação: /account/address-page NÃO entra aqui — ela abre um MODAL de
 * EDIÇÃO de endereço (superfície de mutação), inadequado para read-only. Ver
 * o teste ignorado ao final.
 *
 * Pré-condição: sessão de `npm run auth:login`. Sem ela, auto-ignora.
 */
import { existsSync } from 'node:fs';
import { test, expect } from '../../../src/fixtures/test-fixtures';
import { ConsultaPage } from '../../../src/pages/account/ConsultaPage';
import { IS_PROD_BASELINE } from '../../../src/config/baseline';

const hasSession = existsSync('playwright/.auth/user.json');

interface CenarioConsulta {
  readonly nome: string;
  readonly rota: string;
  readonly titulo: RegExp;
}

const CENARIOS: readonly CenarioConsulta[] = [
  { nome: 'Minhas cotações', rota: '/cotacoes/minhas-contacoes-de-preco', titulo: /Cota[çc][õo]es de pre[çc]o/i },
  { nome: 'Extrato financeiro (IRPF)', rota: '/resumo-financeiro', titulo: /Extrato financeiro/i },
];

test.describe('Consultas autenticadas (read-only) @functional @smoke', () => {
  // Exemplo baseado no mapeamento de PRODUÇÃO — recrie em homolog.
  test.skip(
    !IS_PROD_BASELINE || !hasSession,
    'Exemplo baseline de produção (APP_ENV=prod + sessão). Recriar em homolog.',
  );

  for (const cenario of CENARIOS) {
    test(`abre "${cenario.nome}" e exibe o título da página`, async ({ page }) => {
      const consulta = new ConsultaPage(page, cenario.rota);

      await consulta.abrir();

      await expect(page).toHaveURL(new RegExp(cenario.rota));
      await expect(consulta.tituloPagina(cenario.titulo)).toBeVisible();
    });
  }

  // Documentado e ignorado: "Meus endereços" (/account/address-page) abre um
  // modal de EDIÇÃO (role=dialog, Carbon bx--modal). É mutação, não consulta.
  // Se um dia houver uma visão somente-leitura do endereço, mapear aqui.
  test.skip('Perfil — endereço (apenas leitura) — não disponível como consulta', async () => {
    // Intencionalmente vazio: /account/address-page é tela de edição.
  });
});
