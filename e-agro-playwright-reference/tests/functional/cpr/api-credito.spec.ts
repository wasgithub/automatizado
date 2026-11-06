/**
 * Teste de CONTRATO de API — BFF GraphQL `GetCredit` (READ-ONLY).
 *
 * Valida que o BFF responde e que a resposta tem a FORMA esperada (contrato),
 * sem assertar nem imprimir valores (dados financeiros = PII).
 *
 * ⚠️ Nota de autenticação: o BFF exige token Bearer (localStorage) para
 * resposta autenticada. Com apenas os cookies do storageState, a resposta é
 * anônima (campos como `hasCredit` podem vir `null`). Este teste valida o
 * CONTRATO/forma — que é estável nos dois casos. Ver docs/API_CONTRACTS.md.
 *
 * Pré-condição: sessão de `npm run auth:login`. Sem ela, auto-ignora.
 */
import { existsSync } from 'node:fs';
import { test, expect } from '../../../src/fixtures/test-fixtures';
import { IS_PROD_BASELINE } from '../../../src/config/baseline';
import { divergenciasDeContrato, type Contrato } from '../../../src/api-clients/contract';

const hasSession = existsSync('playwright/.auth/user.json');

// Contrato MAPEADO no exploratório (docs/API_CONTRACTS.md). hasCredit/correntista
// são boolean autenticado via Bearer, ou null quando anônimo (cookie-only).
const CONTRATO_GET_CREDIT: Contrato = {
  me: {
    creditLimit: 'string|null',
    hasCredit: 'boolean|null',
    correntista: 'boolean|null',
    __typename: 'string',
  },
};

test.describe('API CPR — contrato GetCredit @functional @api', () => {
  test.skip(
    !IS_PROD_BASELINE || !hasSession,
    'Exemplo baseline de produção (APP_ENV=prod + sessão). Recriar em homolog.',
  );

  test('BFF responde e retorna a forma de GetCredit @CT-API-CREDITO', async ({
    cprApi,
  }) => {
    const data = await cprApi.getCredit();

    // Valida contra o contrato MAPEADO (não assume/inventa campos).
    expect(divergenciasDeContrato(data, CONTRATO_GET_CREDIT)).toEqual([]);
  });
});
