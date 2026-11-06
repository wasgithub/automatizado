---
mode: agent
description: Exploratório de uma rota/jornada — navegação read-only ou criação (homolog)
---

Faça o exploratório da rota **${input:rota}**, seguindo `docs/GUARDRAILS.md` e a
seção de exploratório. Escolha a abordagem:

**A) Descoberta de navegação** (mapear rotas/telas, sem criar dados):
1. Garanta sessão (`playwright/.auth/user.json`) ou use `/auth`.
2. Rode `npm run explore -- ${input:rota} 1` e, se útil, `node scripts/capture-apis.cjs`.
3. Salve a saída (PII-safe) em `docs/EXPLORATORIO_${input:feature}.md`.

**B) Jornada de criação** (criar usuário/pedido/imóvel — fluxo completo):
1. Confirme `APP_ENV=homolog` (criação é BLOQUEADA em prod).
2. Use `node scripts/record-journey.cjs ${input:rota} ${input:feature}`, preenchendo
   `jornada()` com os passos reais, massa sintética por runId e `rec.guardHomolog(...)`.
3. Consolide passo a passo + APIs (incl. mutations) em `docs/EXPLORATORIO_${input:feature}.md`.

Regras: mutação só em homolog; massa única por runId; nunca registrar valores/PII/tokens;
produção é read-only (não clicar botões de ação).
