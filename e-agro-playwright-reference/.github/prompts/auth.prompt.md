---
mode: agent
description: Provisiona a sessão autenticada (storageState) conforme AUTH_MODE
---

Provisione a sessão de autenticação do ambiente alvo, seguindo `docs/AUTHENTICATION.md`.

- Verifique `AUTH_MODE` no `.env`:
  - `interactive` (2FA, ex.: produção): oriente o usuário a rodar `npm run auth:login`
    e completar o 2FA; a sessão é salva em `playwright/.auth/user.json`.
  - `automated` (homolog sem 2FA): a sessão é criada pelo projeto `setup` ao rodar
    os testes; confirme `EAGRO_USER`/`EAGRO_PASSWORD` no `.env`.
- Nunca imprima senha/tokens.
