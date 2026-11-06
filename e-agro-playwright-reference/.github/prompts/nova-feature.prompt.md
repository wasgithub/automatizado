---
mode: agent
description: Cria a estrutura de uma nova feature (história + Gherkin + pastas)
---

Crie a estrutura da feature **${input:feature}** no domínio **${input:dominio}**,
seguindo a convenção domínio → feature (ver `docs/STRUCTURE.md`).

Passos:
1. A partir de `features/_TEMPLATE/`, crie:
   - `features/${input:dominio}/${input:feature}/historia.md` (preencha domínio/feature; CTs/critérios como placeholders).
   - `features/${input:dominio}/${input:feature}/${input:feature}.feature` (`# language: pt`, tags `@${input:dominio} @${input:feature}`; cenários como placeholder — NÃO invente CTs, peça ao usuário).
   - `features/${input:dominio}/${input:feature}/prototipo/.gitkeep`.
2. Crie as pastas `tests/functional/${input:dominio}/${input:feature}/` e `src/pages/${input:dominio}/${input:feature}/`.
3. Mostre os caminhos criados e os próximos passos: `/explorar` e `/gerar-teste`.

Não crie specs ainda — só a estrutura. Não invente cenários.
