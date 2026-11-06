# Playwright Reference Architecture

Projeto de **referência** independente para testes funcionais de interface com
Playwright + TypeScript. Não é um espelho do repositório corporativo; é um
modelo de arquitetura, padrões e segurança para evoluir até regressão.

- Frontend: React.js · Backend: Java · Automação: Playwright + TypeScript
- Domínios: CPR, CPR Dollar (e futuros produtos)

## Começar

```bash
npm install
npx playwright install chromium
cp .env.example .env     # preencha BASE_URL quando autorizado
```

## Executar

```bash
npm run test:local       # ✅ testes seguros, não dependem do sistema
npm run test:list        # lista todos os testes (não executa)
npm run typecheck        # valida TypeScript

npm run auth:login       # autenticação interativa única (2FA) → salva sessão
npm run explore -- /rota 1   # exploratório PII-safe de uma área (telas + APIs)
npm run test:evidence    # gera evidências passo a passo (EVIDENCE=1) por CT

npm run test:functional  # jornadas funcionais (skip até mapear app real)
npm run test:cpr         # somente CPR
npm run test:cpr-dollar  # somente CPR Dollar
npm run test:smoke       # --grep @smoke   (evolução futura)
npm run test:regression  # --grep @regression (evolução futura)

npm run test:headed      # com navegador visível (HEADED=1)
npm run test:debug       # Playwright Inspector (PWDEBUG=1)
npm run test:ui          # modo UI interativo
npm run report           # abre o último relatório HTML
npm run trace            # abre o Trace Viewer
```

> Os testes funcionais estão marcados como `skip` até a interface real do
> o sistema ser mapeada. Os testes `@local` são os únicos executáveis sem acesso
> à aplicação.

## Documentação

Leia antes de implementar fluxos reais:

- [`.github/copilot-instructions.md`](.github/copilot-instructions.md) — regras do repo (Copilot)
- [`docs/GUARDRAILS.md`](docs/GUARDRAILS.md) — regras duras + política de dependências
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — arquitetura técnica
- [`docs/STRUCTURE.md`](docs/STRUCTURE.md) — responsabilidades das pastas
- [`docs/SELECTOR_CONTRACT.md`](docs/SELECTOR_CONTRACT.md) — estratégia de seletores
- [`docs/TESTING_STANDARDS.md`](docs/TESTING_STANDARDS.md) — padrões de automação
- [`docs/TEST_DATA_STRATEGY.md`](docs/TEST_DATA_STRATEGY.md) — isolamento de dados
- [`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md) — autenticação segura
- [`docs/API_CONTRACTS.md`](docs/API_CONTRACTS.md) — contratos do BFF GraphQL (PII-safe)
- [`docs/ONBOARDING_HOMOLOG.md`](docs/ONBOARDING_HOMOLOG.md) — **apontar para homologação**
- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) — roadmap
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — decisões arquiteturais

## Uso com GitHub Copilot

O fluxo é guiado por arquivos de IA do Copilot (pasta `.github/`):

- **Regras automáticas** — `.github/copilot-instructions.md` é carregado sozinho
  pelo Copilot neste repositório (guardrails, convenções, segurança). Vale em
  VS Code, Visual Studio, github.com e no Copilot coding agent.
- **Regras por arquivo** — `.github/instructions/testes.instructions.md` aplica
  padrões ao editar `tests/**` e `src/**` (VS Code).
- **Comandos** — no Copilot Chat (VS Code), use `/eagro`, `/auth`,
  `/nova-feature`, `/explorar`, `/gerar-teste`, `/evidencias`
  (arquivos em `.github/prompts/`). Habilite `chat.promptFiles` no VS Code.

> Os guardrails **executáveis** (`npm run check`: typecheck + dependências +
> anti-padrões) independem da IA e devem rodar no CI — são a garantia real.

## Segurança

Nunca comitar `.env`, sessões autenticadas, cookies, tokens, dados pessoais ou
evidências com informação de clientes. Não executar mutações financeiras com
conta real sem autorização explícita e ambiente seguro. Começar com 1 worker e
sem retries. Ver [`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md).
