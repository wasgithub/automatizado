# Onboarding — apontar o projeto para homologação

Guia para usar este projeto-modelo no ambiente de **homologação** (onde é
permitido criar dados: clientes, imóveis, pedidos) e integrá-lo a um projeto de
automação existente no mesmo workspace.

## 1. Configurar o ambiente

Copie `.env.example` para `.env` e preencha com os dados de **homolog**:

```env
APP_ENV=homolog
BASE_URL=https://app.exemplo.test
BFF_URL=https://api.exemplo.test
EAGRO_USER=<conta de teste>
EAGRO_PASSWORD=<senha>
EAGRO_OTP=            # só se houver 2FA com código fixo
AUTH_MODE=automated  # homolog sem 2FA → login headless automático
```

`.env` é ignorado pelo Git — credenciais nunca são comitadas.

## 2. Autenticação

A autenticação é **modular e reutilizável** (seu projeto pode puxá-la):

- **Fluxo reutilizável:** `src/auth/login.ts` (`acessarSso`, `preencherCredenciais`, `autenticar`).
- **Provisionamento de sessão:** `tests/setup/auth.setup.ts`.
  - `AUTH_MODE=automated` → login headless e salva `playwright/.auth/user.json`. **100% automatizável.**
  - `AUTH_MODE=interactive` → login manual único via `npm run auth:login` (para 2FA).
- **Seletores do Keycloak** (`input[name="username"]`, `input[name="password"]`, botão "Entrar") são genéricos e valem em homolog.

> ⚠️ **A confirmar em homolog:** (1) como se chega ao SSO (home→"Entre" ou
> `/login` direto) em `acessarSso`; (2) se há 2FA e qual o seletor do campo de
> código (`autenticar`). Ambos estão isolados e comentados para ajuste rápido.

## 3. Variáveis que seu projeto deve "puxar"

| O quê | Onde |
|-------|------|
| Variáveis/URLs tipadas | `src/config/env.ts` |
| Credenciais do ambiente | `getCredenciais()` em `src/config/env.ts` |
| Fluxo de login | `src/auth/login.ts` |
| Provisionamento de sessão | `tests/setup/auth.setup.ts` + `storageState` no `playwright.config.ts` |
| Dados sintéticos | `src/factories/` + `src/utils/run-id.ts` |
| Cliente de API (GraphQL) | `src/api-clients/BaseApiClient.ts` |

## 4. Rodar o exploratório (gravar telas e APIs)

Com a sessão provisionada:

```bash
npm run explore -- /<rota-da-area> 1     # ex.: npm run explore -- /dashboard 1
```

Gera (stdout) o mapa PII-safe da área: rotas, títulos, **campos** (nome/tipo/rótulo),
**botões** (navegação vs ação — ações nunca são clicadas), **tabs** e as
**operações de API** com o esquema da resposta. Redirecione para um doc:

```bash
npm run explore -- /dashboard 1 > docs/EXPLORATORIO_dashboard.md
```

Para jornadas de **criação** (cliente/imóvel/pedido), use **exploração guiada**
(dirigir a jornada com massa sintética e gravar cada etapa) — não o crawler cego.

## 5. Criar cenários a partir do mapa

1. Para cada CT, criar um spec em `tests/functional/<dominio>/<feature>/`.
2. Interações no Page Object (`src/pages/<dominio>/<feature>/`); asserts no teste.
3. Massa via factory (única por `runId`); pré-condições/limpeza via API client.
4. Tags `@functional`/`@smoke`/`@regression`; ownership por `CODEOWNERS`.

Ver `docs/TESTING_STANDARDS.md`, `docs/TEST_DATA_STRATEGY.md` e `docs/STRUCTURE.md`.

## 6. Specs de exemplo (templates)

Os specs em `tests/functional/**` são **templates** com rotas/seletores
placeholders. Só executam quando apontados para um ambiente (ex.: o de login
exige `RUN_LOGIN_EXAMPLE=1` + `BASE_URL`); sem isso **auto-ignoram**. Use-os como
base e recrie com os dados reais do ambiente (vindos do exploratório). Os testes
`tests/local/**` rodam sempre (não dependem do sistema).

## 7. Isolamento em ambiente compartilhado

Homolog é concorrente. Regras (ver `docs/TEST_DATA_STRATEGY.md`):
- Massa única por `runId`; não depender de estado pré-existente nem de ordem.
- Não assumir endpoints de seed/teardown — confirmar antes de depender.
- Limpar apenas os próprios registros, quando houver como.
