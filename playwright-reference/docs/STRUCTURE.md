# Estrutura do repositório

```text
playwright-reference/
├── .github/                      # GitHub Copilot (IA do projeto)
│   ├── copilot-instructions.md   # regras do repo (auto-carregado)
│   ├── instructions/testes.instructions.md   # regras por caminho (tests/src)
│   └── prompts/                  # comandos "/" (eagro, auth, nova-feature,
│                                 #   explorar, gerar-teste, evidencias)
├── README.md · .env.example · package.json · tsconfig.json · playwright.config.ts
├── docs/
│   ├── ARCHITECTURE · STRUCTURE · SELECTOR_CONTRACT · TESTING_STANDARDS
│   ├── TEST_DATA_STRATEGY · AUTHENTICATION · API_CONTRACTS · GUARDRAILS
│   ├── IMPLEMENTATION_PLAN · ONBOARDING_HOMOLOG · DECISIONS
│   └── EXPLORATORIO_*.md          # mapas gerados pelo exploratório (por feature)
├── features/                     # artefatos de NEGÓCIO (história, protótipo, Gherkin)
│   ├── README.md · _TEMPLATE/
│   ├── cpr/login/                 # exemplo: historia.md + login.feature
│   └── demo/cadastro-produtor/    # cenário do teste de mesa
├── src/
│   ├── config/env.ts              # acesso tipado a variáveis (multi-ambiente)
│   ├── auth/login.ts              # fluxo de login SSO reutilizável (genérico)
│   ├── pages/
│   │   ├── shared/BaseNavigation.ts
│   │   ├── cpr/CprPage.ts · cpr/login/CprLoginPage.ts
│   │   ├── cpr-dollar/CprDollarPage.ts
│   │   └── demo/cadastro-produtor/CadastroProdutorPage.ts
│   ├── components/ConfirmDialog.ts
│   ├── fixtures/test-fixtures.ts · fixtures/evidence.ts
│   ├── api-clients/BaseApiClient.ts · CprApiClient.ts · contract.ts
│   ├── factories/cpr.factory.ts   # massa sintética (faker) única por runId
│   └── utils/run-id.ts
├── tests/
│   ├── local/                     # EXECUTÁVEL sem o sistema (@local)
│   │   ├── selector-strategy.spec.ts · evidence-demo.spec.ts
│   │   └── cadastro-produtor-demo.spec.ts   # teste de mesa do fluxo
│   ├── functional/
│   │   ├── cpr/login/login.spec.ts          # exemplo (RUN_LOGIN_EXAMPLE)
│   │   └── cpr-dollar/navigation.spec.ts    # template (skip)
│   ├── setup/auth.setup.ts        # Storage State (automated/interactive)
│   ├── _fixtures/mini-app.html    # mini-app do teste de mesa
│   └── regression/                # reservado; regressão por TAG, sem duplicar
├── playwright/.auth/              # storage state — IGNORADO pelo Git
└── scripts/
    ├── auth-login.cjs             # login interativo (2FA) → storageState
    ├── explore.cjs · explore-page.cjs · explore-feature.cjs
    ├── capture-apis.cjs           # contratos de API (PII-safe)
    ├── record-journey.cjs         # jornada GUIADA c/ criação (homolog)
    ├── lib/inventory.cjs          # inventário completo de pontos interativos
    └── check-deps.cjs · check-guardrails.cjs
```

## Organização por domínio → feature

Testes por **domínio de negócio** e, quando um domínio cresce, por
**feature/jornada** em subpastas. **Nunca** por squad/tribo (isso é ownership,
resolvido via `CODEOWNERS`). Exemplo:

```text
tests/functional/cpr/login/login.spec.ts   # feature "login"
src/pages/cpr/login/CprLoginPage.ts         # Page Object espelha a feature
features/cpr/login/{historia.md,login.feature}
```

- Nova **feature** → nova subpasta (ex.: `cpr/login/`).
- Novo **produto** → novo domínio (`tests/functional/<produto>/` + `src/pages/<produto>/`).
- Só crie subpasta de feature quando o domínio crescer (~5–8 specs); antes, flat.
- Ownership por `.github/CODEOWNERS`; seleção por tags (`--grep @cpr`).

## Convenções

- **`tests/local`** roda em qualquer ambiente (inclusive CI) sem acessar o
  sistema. Prova o harness.
- **Regressão por tag**, não por cópia (`@regression` no título).
- **Rotas/seletores são placeholders** nos exemplos — confirme no exploratório
  do ambiente alvo antes de usar.
