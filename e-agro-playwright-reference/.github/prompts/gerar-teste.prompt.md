---
mode: agent
description: Gera o teste Playwright a partir do CT (Gherkin) + exploratório
---

Implemente o(s) cenário(s) da feature **${input:feature}** como teste(s)
Playwright. Siga `docs/TESTING_STANDARDS.md` e `docs/GUARDRAILS.md`.

Entrada (leia ANTES de escrever):
- Cenários: `features/${input:feature}/*.feature` (foque no CT ${input:ct} se informado).
- Mapa: `docs/EXPLORATORIO_*` da feature. Se não existir, rode `/explorar` antes.

Produza:
1. Page Object em `src/pages/${input:feature}/` (só seletores do exploratório).
2. Spec em `tests/functional/${input:feature}/` com o título contendo a tag `@CT-xxx`,
   mapeando Dado/Quando/Então → arrange/act/assert e chamando `evidencia.passo(...)`.
3. Retorno de API validado com `divergenciasDeContrato(...)`.
4. Atualize a rastreabilidade na `historia.md`.
5. Rode `npm run check` e `npm run test:list`. Rode o teste se o ambiente permitir;
   não afirme que passou sem executar.

PROIBIDO inventar seletor/rota/endpoint; sem `waitForTimeout`; massa única por runId.
