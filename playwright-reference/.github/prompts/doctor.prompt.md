---
mode: agent
description: Verifica a prontidão para explorar (config, sessão, browser, rede)
---

Rode a verificação de prontidão do ambiente: `npm run doctor`.

- Interprete a saída (✅/⚠️/❌) e diga ao usuário exatamente o que falta resolver
  antes de explorar (ex.: preencher `.env`, instalar Chromium, VPN/rede).
- Nunca peça nem exiba senha/tokens. As credenciais ficam só no `.env`.
- Se tudo estiver ✅, oriente o próximo passo: `/auth` (se houver login) ou
  `/explorar`.
