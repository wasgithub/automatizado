# Autenticação segura

## Realidade mapeada do e-Agro

- Login via **SSO Keycloak**: `sso.e-agro.com.br`, realm `agro-automated-realm`
  (OpenID Connect / Authorization Code + PKCE).
- Entrada na UI: botão **"Entre / Cadastre-se"** → **"Entre"** → redireciona ao SSO.
- Campos do SSO (sem label/role associado → CSS por atributo estável, justificado):
  - usuário: `input[name="username"]`
  - senha: `input[name="password"]`
  - enviar: `getByRole('button', { name: 'Entrar' })`
- **2FA OBRIGATÓRIO:** após usuário+senha, o e-Agro exige um **código de
  verificação** por **E-mail ou SMS** ("Autenticação de usuário").

## Consequência: login não é 100% automatizável

Com 2FA interativo, não há login headless totalmente automático. Usamos o
padrão recomendado do Playwright para MFA: **autenticar uma vez, de forma
interativa, e reutilizar a sessão** (Storage State).

```
npm run auth:login                 # headed; você conclui o 2FA uma vez
  → salva playwright/.auth/user.json  (IGNORADO pelo Git)
  → testes reutilizam a sessão até expirar; ao expirar, rode de novo
```

## Como autenticar

1. Preencha `.env` com `BASE_URL`, `EAGRO_USER`, `EAGRO_PASSWORD` (fora do Git).
2. Rode `npm run auth:login`. Abre um navegador **visível**; usuário e senha são
   preenchidos automaticamente e o fluxo para na etapa de 2FA.
3. Na janela: escolha o canal (E-mail/SMS), clique **Continuar**, digite o
   **código** recebido e conclua o login.
4. Ao retornar a `e-agro.com.br`, a sessão é salva em
   `playwright/.auth/user.json`.
5. Rode os testes normalmente — o `playwright.config.ts` reutiliza a sessão
   automaticamente (projeto `chromium` com `storageState`).

O projeto de setup `tests/setup/auth.setup.ts` apenas **valida** que a sessão
existe (auto-ignora se não existir) — ele não tenta logar, para não disparar
2FA em execuções/pipeline.

## Regras de segurança

- **Nunca** comitar `.env`, cookies, tokens ou `user.json`.
- **Nunca** imprimir senha, tokens, cookies ou PII em logs (os scripts seguem
  essa regra).
- Conta de cliente real: **somente leitura/navegação**. Nenhuma contratação,
  compra, carrinho ou operação que altere dados sem autorização explícita.
- Trace/vídeo podem conter dados de sessão — mantidos fora do Git pelo
  `.gitignore`; não compartilhe evidências com PII.
- A senha foi informada em texto puro no chat durante o setup inicial:
  recomenda-se **trocá-la** e, idealmente, usar uma **conta de teste dedicada**
  para automação, não a conta pessoal.
