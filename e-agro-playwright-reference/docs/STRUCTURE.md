# Estrutura do repositório

```text
e-agro-playwright-reference/
├── .github/                      # GitHub Copilot (IA do projeto)
│   ├── copilot-instructions.md   # regras do repo (auto-carregado pelo Copilot)
│   ├── instructions/
│   │   └── testes.instructions.md        # regras por caminho (applyTo tests/src)
│   └── prompts/                  # comandos "/" do Copilot Chat
│       ├── eagro · auth · nova-feature
│       └── explorar · gerar-teste · evidencias  (*.prompt.md)
├── README.md                    # Instalação e execução
├── .env.example                 # Modelo de variáveis (sem segredos)
├── package.json
├── tsconfig.json
├── playwright.config.ts
├── docs/
│   ├── ARCHITECTURE.md           # Arquitetura técnica
│   ├── STRUCTURE.md              # Este arquivo
│   ├── SELECTOR_CONTRACT.md      # Estratégia/contrato de seletores
│   ├── TEST_DATA_STRATEGY.md     # Isolamento de massa de dados
│   ├── AUTHENTICATION.md         # Autenticação segura (Storage State)
│   ├── TESTING_STANDARDS.md      # Padrões de automação
│   ├── IMPLEMENTATION_PLAN.md    # Roadmap de evolução
│   ├── API_CONTRACTS.md          # Contratos do BFF GraphQL (PII-safe)
│   ├── ONBOARDING_HOMOLOG.md     # Como apontar para homologação
│   └── DECISIONS.md              # Decisões arquiteturais (ADRs)
├── features/                     # artefatos de NEGÓCIO (história, protótipo, Gherkin)
│   ├── README.md                 # convenção e fluxo história→exploratório→teste
│   ├── _TEMPLATE/                # modelo (historia.md, cenarios.feature, prototipo/)
│   └── cpr/login/                # exemplo: historia.md + login.feature
├── src/
│   ├── config/
│   │   ├── env.ts                # Acesso tipado a variáveis (multi-ambiente)
│   │   └── baseline.ts           # flag APP_ENV=prod p/ specs de exemplo
│   ├── auth/
│   │   └── login.ts              # fluxo de login SSO reutilizável (homolog/prod)
│   ├── pages/
│   │   ├── shared/BaseNavigation.ts
│   │   ├── account/ConsultaPage.ts   # consulta read-only (rota + título)
│   │   ├── cpr/CprPage.ts            # dashboard/entradas CPR (confirmado)
│   │   └── cpr-dollar/CprDollarPage.ts  # exemplo (não verificado)
│   ├── components/
│   │   └── ConfirmDialog.ts      # Component Object (exemplo)
│   ├── fixtures/
│   │   ├── test-fixtures.ts      # Fixtures tipadas (test/expect estendidos)
│   │   └── evidence.ts           # evidência passo a passo (EVIDENCE=1)
│   ├── api-clients/
│   │   ├── BaseApiClient.ts
│   │   └── CprApiClient.ts       # exemplo não executável
│   ├── factories/
│   │   └── cpr.factory.ts        # massa sintética única por runId
│   └── utils/
│       └── run-id.ts
├── tests/
│   ├── local/                    # EXECUTÁVEL: não depende do e-Agro (@local)
│   │   └── selector-strategy.spec.ts
│   ├── functional/
│   │   ├── account/consultas.spec.ts      # ✅ consultas read-only (cotações, extrato)
│   │   ├── account/perfil.spec.ts         # ✅ perfil/menu da conta (read-only)
│   │   ├── cpr/navigation.spec.ts         # ✅ smoke dashboard autenticado
│   │   ├── cpr/pedidos-credito.spec.ts    # skip: página instável (ver doc)
│   │   └── cpr-dollar/navigation.spec.ts  # skip até mapear app real
│   ├── setup/
│   │   └── auth.setup.ts         # Storage State (guardado/auto-skip)
│   └── regression/               # reservado; regressão é por TAG, sem duplicar
├── playwright/.auth/             # storage state — IGNORADO pelo Git
└── scripts/
    ├── auth-login.cjs            # autenticação interativa única (2FA) → storageState
    ├── explore.cjs               # exploração descartável de ARIA snapshot (público)
    ├── explore-page.cjs          # inventário PII-safe de uma tela (autenticado)
    ├── explore-feature.cjs       # crawler de navegação (read-only, não clica ações)
    ├── capture-apis.cjs          # mapa de contratos do BFF GraphQL (PII-safe)
    └── record-journey.cjs        # jornada GUIADA c/ criação (homolog; guardHomolog)
```

## Organização por domínio → feature (exemplo: login CPR)

Testes são organizados por **domínio de negócio** e, quando um domínio cresce,
por **feature/jornada** em subpastas. **Nunca** por squad/tribo (isso é
ownership, resolvido via `CODEOWNERS`, não por pastas). Exemplo vivo:

```text
tests/functional/cpr/
├── login/
│   └── login.spec.ts            # feature "login" (SSO) — exemplo pronto
├── navigation.spec.ts           # specs flat do domínio (até crescer)
└── api-credito.spec.ts
src/pages/cpr/
├── login/
│   └── CprLoginPage.ts          # Page Object espelha a feature
└── CprPage.ts
```

- Nova **feature** num domínio existente → nova subpasta (ex.: `cpr/login/`).
- Novo **produto** → novo domínio (`tests/functional/<produto>/` + `src/pages/<produto>/`).
- Só crie subpasta de feature quando o domínio passar de ~5–8 specs; antes, mantenha flat.
- Ownership (tribo/squad) via `.github/CODEOWNERS`; seleção via tags (`--grep @cpr`).

## Convenções de pasta

- **`tests/local`** contém os únicos testes que rodam em qualquer ambiente
  (inclusive CI) sem acessar o e-Agro. Use para validar o harness.
- **Regressão por tag, não por cópia.** `tests/regression` é reservada para
  necessidades futuras; não duplique specs — use `@regression` no título.
- **Exemplos** (`CprPage`, `CprDollarPage`, `CprApiClient`) têm rotas/seletores
  ILUSTRATIVOS e precisam ser confirmados contra a aplicação real.
