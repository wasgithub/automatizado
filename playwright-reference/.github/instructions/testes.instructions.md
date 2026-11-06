---
applyTo: "tests/**/*.ts,src/**/*.ts"
description: Padrões ao escrever testes e Page Objects do sistema
---

Ao criar/editar testes ou Page Objects neste repositório:

- Use **apenas** seletores/rotas/endpoints vindos do exploratório
  (`docs/EXPLORATORIO_*.md`, `docs/API_CONTRACTS.md`). Não mapeado → `test.skip`
  com justificativa. Nunca invente.
- Importe `test`/`expect` de `src/fixtures/test-fixtures.ts`.
- Seletores na ordem: `getByRole` > `getByLabel` > `getByTestId` > texto > CSS
  justificado. Sem `waitForTimeout`, `test.only`, `page.pause()`.
- Page Object expõe ações/locators; **asserts de negócio ficam no teste**.
- Seletor centralizado no Page Object (1 lugar por tela); elemento repetido em
  várias telas → **Component Object** (`src/components/`, ex.: `ConfirmDialog`,
  `DataTable`). Nunca mapa global de strings de seletor.
- Massa via `src/factories` (`@faker-js/faker`), única por `runId`.
- Retorno de API validado com `divergenciasDeContrato(...)` contra o contrato mapeado.
- Título do teste com a tag do CT (`@CT-xxx`) para rastreabilidade com o `.feature`.
- Mapear `Dado/Quando/Então` → arrange/act/assert; evidência com `evidencia.passo(...)`.
- Mutação só em `APP_ENV=homolog`. Ao concluir, rode `npm run check` e `npm run test:list`.

Detalhes: `docs/TESTING_STANDARDS.md`, `docs/GUARDRAILS.md`.
