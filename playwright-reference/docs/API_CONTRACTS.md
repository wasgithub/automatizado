# Contratos de API — guia de mapeamento

Como mapear e validar os contratos de API do ambiente alvo (genérico). Os
valores reais (hosts, operações, campos) são descobertos no exploratório e
documentados por ambiente — **não** ficam versionados neste projeto de referência.

## Como mapear
1. Com a sessão provisionada, rode `node scripts/capture-apis.cjs` navegando as
   telas da jornada. Ele captura as chamadas e converte a resposta em ESQUEMA
   (nomes de campos + tipos), com **valores redigidos** (PII-safe).
2. Registre o resultado em `docs/EXPLORATORIO_<feature>.md` do ambiente alvo.

## Backends GraphQL (BFF)
Se o backend for um BFF GraphQL (endpoint único, operação por `operationName`):
- A operação costuma vir no corpo (`operationName`) e às vezes na query string.
- Capture o `query`/`operationName` real e os **nomes** das variáveis (nunca os
  valores — podem conter PII, ex.: documento/CPF).

## Validar o retorno nos testes
Use `divergenciasDeContrato(...)` (`src/api-clients/contract.ts`) para garantir
que a resposta bate com o contrato MAPEADO — em vez de assumir campos:

```ts
const CONTRATO = { me: { id: 'string|null', ativo: 'boolean', __typename: 'string' } };
expect(divergenciasDeContrato(data, CONTRATO)).toEqual([]);
```

## Segurança
- Nunca logar valores/variáveis/tokens. O mapa é CONTRATO (forma), não dados.
- Recapture quando a API evoluir.
