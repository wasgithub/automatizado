---
mode: agent
description: Cria a estrutura de uma nova feature (história + Gherkin + pastas)
---

Crie a estrutura da feature **${input:feature}** no sistema **${input:sistema}**
(ex.: e-agro, servicenow), seguindo `docs/MULTI_SYSTEM.md` e `docs/STRUCTURE.md`.

Use o scaffolder (gera pastas por sistema + Gherkin):
`npm run scaffold -- feature ${input:sistema} ${input:feature}`

Isso cria:
- `src/systems/${input:sistema}/pages/${input:feature}/` (Page Object stub)
- `tests/systems/${input:sistema}/${input:feature}/`
- `features/${input:sistema}/${input:feature}/{historia.md,*.feature}`

Depois: preencha a história e os cenários Gherkin (CTs) com o usuário — NÃO
invente CTs. Confirme o sistema em `systems.config.json`. Próximos passos:
`/explorar` e `/gerar-teste`. Não crie specs ainda — só a estrutura.
