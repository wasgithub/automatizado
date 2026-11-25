---
mode: ask
description: Índice do fluxo de automação e todos os slash commands
---

Apresente o **fluxo completo** de automação deste projeto e os comandos para
executá-lo. Seja conciso; não execute nada — apenas oriente.

## Fluxo (ao entrar no sistema, nesta ordem)
1. `/doctor` — verifica prontidão (.env, credenciais, sessão, browser, rede).
2. `/auth` — provisiona a sessão (2FA interativo ou login automático).
3. `/scaffold` — cria as pastas do sistema/feature/fluxo (multi-sistema).
3b. `/mapear-frontend` — (se o frontend React está no workspace) mapeia seletores + lacunas.
4. `/explorar` — mapeia telas/campos/APIs; atualiza a coleção Postman.
5. `/nova-feature` — cria história + Gherkin (CTs) da feature.
6. `/gerar-teste` — gera Page Object + spec a partir do exploratório + Gherkin.
7. `/evidencias` — roda com evidência passo a passo (EVIDENCE=1).
8. `/postman` — captura APIs e gera a coleção Postman por sistema.

## Princípios (guardrails)
- Nunca inventar seletor/rota/endpoint — só o que o exploratório mapeou.
- Multi-sistema: cada sistema tem pastas/seletores próprios (`src/systems/<sistema>/`);
  fluxo cross-system em `tests/flows/<fluxo>/`.
- Mutação só em `APP_ENV=homolog`; sem PII/segredos; `npm run check` antes de concluir.

Docs: `docs/COMMANDS.md` (comandos), `docs/QUICKSTART.md`, `docs/MULTI_SYSTEM.md`,
`docs/GUARDRAILS.md`, `docs/DOCUMENTACAO_E_POSTMAN.md`.
