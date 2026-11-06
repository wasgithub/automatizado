# Padrões de automação

Guia prático para escrever testes consistentes neste projeto.

## Camadas e responsabilidades

| Camada | Pasta | Responsabilidade | NÃO faz |
|--------|-------|------------------|---------|
| Teste | `tests/` | Orquestra jornada e faz **asserts de negócio** | Não contém seletores soltos nem lógica de tela |
| Page Object | `src/pages/<dominio>` | Ações e locators de uma tela | Não faz asserts de negócio |
| Component Object | `src/components` | Encapsula widget React reutilizável | Não conhece uma página específica |
| Fixture | `src/fixtures` | Injeta dependências tipadas (POMs, runId, sessão) | Não contém regra de negócio |
| Factory | `src/factories` | Gera massa sintética única | Não acessa rede nem a UI |
| API Client | `src/api-clients` | Preparação/consulta via backend (futuro) | Não substitui asserts de UI |

## Regras

1. **Importe `test`/`expect` de `src/fixtures/test-fixtures.ts`**, não de
   `@playwright/test`, para ganhar as fixtures tipadas.
2. **Seletores seguem o contrato** ([SELECTOR_CONTRACT.md](SELECTOR_CONTRACT.md)):
   `getByRole` > `getByLabel` > `getByTestId` > texto estável > CSS justificado.
3. **Asserts de negócio ficam no teste.** O Page Object expõe locators/ações;
   o teste decide o que verificar.
4. **Sem esperas fixas.** Nunca `waitForTimeout` para sincronizar. Use
   auto-waiting do Playwright, web-first assertions (`toBeVisible`, `toHaveURL`)
   e `waitForURL`/estados observáveis.
5. **Isolamento.** Dados únicos por execução via `runId`; sem dependência de
   ordem ou de estado pré-existente ([TEST_DATA_STRATEGY.md](TEST_DATA_STRATEGY.md)).
6. **Segurança.** Nada de PII/segredos em logs; conta real somente
   leitura/navegação até autorização ([AUTHENTICATION.md](AUTHENTICATION.md)).

## Tags

Mesma fonte de testes, selecionada por tag no título — **sem duplicar specs**:

- `@local` — executável em qualquer lugar; não depende do e-Agro.
- `@functional` — jornada funcional (requer app real).
- `@smoke` — subconjunto crítico rápido (evolução futura).
- `@regression` — suíte ampla (evolução futura).

```bash
npm run test:smoke       # --grep @smoke
npm run test:regression  # --grep @regression
```

## Evidências passo a passo (sucesso)

A fixture `evidencia` gera prints por passo, para anexar no CT/sign-off:

```ts
test('... @CT-123', async ({ page, evidencia }) => {
  await cprPage.openDashboard();
  await evidencia.passo('dashboard carregado');   // print 01
  await cprPage.algo();
  await evidencia.passo('apos acao');             // print 02
});
```

- Saída: `evidencias/<feature>/<CT>/NN-descricao.png` (feature derivada do caminho
  do spec; CT da tag `@CT-...`). Também anexado ao relatório HTML.
- Controle: só grava com `EVIDENCE=1` (ex.: `npm run test:evidence`); sem a flag é no-op.
- `evidencias/` é ignorado pelo Git. ⚠️ Prints de tela logada contêm PII — tratar
  como artefato, nunca comitar.

## Quando remover `test.skip`

Um spec funcional só sai de `skip` após: jornada real mapeada com o usuário,
seletores confirmados no contrato, e garantia de não destrutividade em conta
real. Documente pré-condições, dados, impacto no ambiente e asserts esperados.

## Nomenclatura

- Specs: `<assunto>.spec.ts` dentro de `tests/<tipo>/<dominio>/`.
- Page Objects: `PascalCase` terminando em `Page` (ex.: `CprPage`).
- Component Objects: `PascalCase` pelo papel (ex.: `ConfirmDialog`).
- Factories: `<dominio>.factory.ts` com funções `make<Entidade>`.
