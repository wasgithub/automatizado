---
mode: agent
description: Cria as pastas de sistema, feature ou fluxo cross-system
---

Crie a estrutura de pastas conforme o pedido (`${input:alvo}`), seguindo
`docs/MULTI_SYSTEM.md`. Use o scaffolder:

- Novo **sistema**: `npm run scaffold -- system <sistema>`
  (depois adicione o sistema em `systems.config.json` com baseUrl/authStrategy).
- Nova **feature** num sistema: `npm run scaffold -- feature <sistema> <feature>`
  (cria `src/systems/<sistema>/pages/<feature>/`, testes e Gherkin).
- **Fluxo cross-system**: `npm run scaffold -- flow <fluxo> <sistema1> <sistema2> ...`
  (a ordem dos sistemas = as etapas da jornada; ex.: `e-agro servicenow e-agro`).

Depois de criar: confirme os sistemas em `systems.config.json` e aponte os
próximos passos (`/explorar`, `/gerar-teste`). Não invente seletores ainda.
