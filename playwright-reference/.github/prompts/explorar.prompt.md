---
mode: agent
description: Exploratório de uma rota/jornada — navegação read-only ou criação (homolog)
---

Faça o exploratório da rota **${input:rota}**, seguindo `docs/GUARDRAILS.md` e a
seção de exploratório. Escolha a abordagem:

**A) Descoberta de navegação** (mapear rotas/telas, sem criar dados):
1. Defina `BASE_URL` no `.env` (obrigatório). Sessão é **opcional**: páginas
   públicas não exigem; para áreas autenticadas, gere a sessão com `/auth`.
2. Rode `npm run explore -- ${input:rota} 1` e, se útil, `node scripts/capture-apis.cjs`.
3. Salve a saída (PII-safe) em `docs/EXPLORATORIO_${input:feature}.md`.

**B) Jornada de criação** (criar usuário/pedido/imóvel — fluxo completo):
1. Confirme `APP_ENV=homolog` (criação é BLOQUEADA em prod).
2. Use `node scripts/record-journey.cjs ${input:rota} ${input:feature}`, preenchendo
   `jornada()` com os passos reais, massa sintética por runId e `rec.guardHomolog(...)`.
3. Consolide passo a passo + APIs (incl. mutations) em `docs/EXPLORATORIO_${input:feature}.md`.

Regras do exploratório (IMPORTANTE):
- **Analise TODOS os pontos** da tela em cada passo: botões, inputs, selects (e
  suas opções), combos, radios/checkboxes, links e tabs. Não pule elementos.
- **Tente chegar até a etapa-alvo do cenário.** Em jornadas multi-etapa, use
  `rec.exigir(...)` antes de agir e `rec.avancar(...)` em cada transição.
- **Se não conseguir evoluir** (elemento ausente, validação bloqueia, falta
  contexto/dado), NÃO pare em silêncio: chame `rec.bloqueio(motivo)` — ele grava
  o estado e lista tudo que há na tela — e **PERGUNTE ao usuário** qual
  botão/campo/opção usar ou qual dado falta, retomando a partir dali.
- Mutação só em homolog; massa única por runId; nunca registrar valores/PII/tokens;
  produção é read-only (não clicar botões de ação).
