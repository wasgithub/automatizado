---
mode: agent
description: Captura APIs e gera/atualiza a coleção Postman por sistema
---

Documente as APIs e gere a coleção Postman, seguindo
`docs/DOCUMENTACAO_E_POSTMAN.md` e `docs/MULTI_SYSTEM.md`.

1. Garanta `BASE_URL` (e sessão, se área autenticada — use `/auth`).
2. Defina as rotas a navegar em `EXPLORE_ROTAS` (no `.env`) e rode:
   `npm run capture:apis`
   — captura (merge incremental, acumula entre rodadas), marca cada operação
   com seu **sistema** e **atualiza a coleção Postman** automaticamente.
3. A coleção fica em `test-results/postman-collection.json`, agrupada por
   sistema (pasta por sistema → GraphQL/REST), com `{{baseUrl_<sistema>}}`.
4. Oriente o usuário a importar no Postman (File → Import) e configurar a
   autenticação lá.

PII: a coleção não contém valores/tokens; variáveis GraphQL são `"<preencher>"`.
Nunca logar PII/segredos.
