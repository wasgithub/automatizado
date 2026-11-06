# Instruções do projeto — o sistema Playwright (GitHub Copilot)

Automação Playwright + TypeScript do sistema. Ao sugerir ou gerar código neste
repositório, siga ESTAS regras. Fonte da verdade detalhada: pasta `docs/`.

## Guardrails (duros — docs/GUARDRAILS.md)
- **NÃO invente** seletor, rota, campo, texto ou endpoint. Use apenas o que está
  no exploratório (`docs/EXPLORATORIO_*.md`, `docs/API_CONTRACTS.md`). O que não
  foi mapeado fica `test.skip` com justificativa — nunca preencher por suposição.
- **Valide o retorno de API** contra o contrato mapeado usando
  `divergenciasDeContrato(...)` (`src/api-clients/contract.ts`); não assuma campos.
- **Proibido**: `waitForTimeout`, `test.only`, `page.pause()`, URL/endpoint
  hardcoded em `goto`/`request` (use `baseURL`/env). Verificado por
  `npm run check:guardrails`.
- **Dependências**: só a allowlist (`@playwright/test`, `typescript`,
  `@types/node`, `dotenv`, `@faker-js/faker`). Nova lib exige revisão de
  segurança do banco. Preferir dependency-free. Verificado por `npm run check:deps`.
- Rodar `npm run check` antes de concluir qualquer tarefa.
- **Mutação (criar/alterar dados) só em `APP_ENV=homolog`**; produção é read-only.
  Nunca logar PII/segredos. Massa sintética única por `runId`.

## Exploratório (regra)
Ao explorar, analise TODOS os pontos de cada tela (botões, inputs, selects+opções,
combos, radios/checkboxes, links, tabs) e tente chegar até a etapa-alvo. Se não
conseguir evoluir (falta contexto/dado, validação bloqueia), **pare e pergunte ao
usuário** o que fazer, mostrando o inventário da tela — nunca pare em silêncio.
Use `rec.exigir`/`rec.avancar`/`rec.bloqueio` de `scripts/record-journey.cjs`.

## Fluxo de trabalho
`história + Gherkin` (`features/`) → `exploratório` (`docs/EXPLORATORIO_*`) →
`teste` (`tests/functional/<domínio>/<feature>/`) → `evidência` (`EVIDENCE=1`).

## Convenções
- Importar `test`/`expect` de `src/fixtures/test-fixtures.ts` (não de `@playwright/test`).
- Seletores: `getByRole` > `getByLabel` > `getByTestId` > texto > CSS justificado
  (`docs/SELECTOR_CONTRACT.md`).
- Page Object = ações/locators; **asserts de negócio no teste**. Massa via
  `src/factories` (usa `@faker-js/faker`). Sem esperas fixas (auto-waiting).
- Organização por **domínio → feature**; ownership por `CODEOWNERS` — nunca pasta
  por squad/tribo. Rastreabilidade: título do teste com tag `@CT-xxx`.

## Processo de trabalho
- Audite a estrutura existente e proponha a mudança antes de alterar.
- Implemente uma melhoria pequena por vez; mantenha `npm run check` e `npm run test:list` passando.
- Registre decisões arquiteturais em `docs/DECISIONS.md`.
- Ao criar testes reais, documente pré-condições, dados, impacto no ambiente e asserts esperados.
- Preserve a arquitetura por domínio (`cpr`, `cpr-dollar`, `account`, ...). Não duplicar specs na regressão — usar tags.

## Comandos (prompt files em `.github/prompts/`)
`/eagro` (fluxo), `/auth`, `/nova-feature`, `/explorar`, `/gerar-teste`, `/evidencias`.

Leia também: `docs/TESTING_STANDARDS.md`, `docs/TEST_DATA_STRATEGY.md`,
`docs/AUTHENTICATION.md`, `docs/ONBOARDING_HOMOLOG.md`, `docs/STRUCTURE.md`.
