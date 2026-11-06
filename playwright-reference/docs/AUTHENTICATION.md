# Autenticação segura

## Estratégia: Storage State
O login é executado **uma vez** e a sessão autenticada é salva em disco; os
testes reutilizam essa sessão (mais rápido e com menos carga no ambiente).

- Fluxo reutilizável: `src/auth/login.ts` (`acessarSso`, `preencherCredenciais`, `autenticar`).
- Setup: `tests/setup/auth.setup.ts`.
- Sessão salva em `playwright/.auth/user.json` — **ignorado pelo Git**.

## Dois modos (AUTH_MODE)
- `automated` (ambientes SEM 2FA, ex.: homologação): login headless com
  `EAGRO_USER`/`EAGRO_PASSWORD` (+ `EAGRO_OTP` se houver código fixo). Salva a
  sessão automaticamente. Ideal para CI.
- `interactive` (ambientes com 2FA): `npm run auth:login` abre um navegador
  visível; você conclui o 2FA uma vez e a sessão é salva.

## SSO Keycloak (genérico)
Quando o ambiente usa Keycloak, os campos padrão valem na maioria dos casos:
`input[name="username"]`, `input[name="password"]`, botão "Entrar"; a URL do
realm casa com `/auth/realms/...`. **A confirmar no ambiente alvo:** como se
chega ao SSO (home → "Entrar" ou `/login` direto) e o seletor do campo de OTP.

## Regras de segurança
- **Nunca** comitar `.env`, cookies, tokens ou `user.json`.
- **Nunca** imprimir senha, tokens, cookies ou PII em logs.
- Conta de cliente real: **somente leitura/navegação** até autorização explícita
  para mutações, em ambiente seguro (homologação).
- Trace/vídeo podem conter dados de sessão — mantidos fora do Git; não compartilhe
  evidências com PII.
