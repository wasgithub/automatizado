# Registro de decisões (ADRs)

- **ADR-001:** Playwright Test + TypeScript; execução local primeiro.
- **ADR-002:** Chromium e `workers: 1`, `retries: 0` na fase inicial, para
  diagnóstico honesto. Paralelismo/sharding só após comprovar isolamento.
- **ADR-003:** Separação por domínio (`cpr`, `cpr-dollar`, `shared`); regressão
  por **tag**, sem duplicar specs.
- **ADR-004:** Conta de cliente real restrita a navegação/consulta autorizada;
  sem mutações sem autorização explícita.
- **ADR-005:** Configuração por ambiente via `.env` + `dotenv`, carregado no
  `playwright.config.ts`. Acesso tipado em `src/config/env.ts` com validação
  **tardia** (não quebra `typecheck`/`test:list` sem `.env`).
- **ADR-006:** Autenticação via **Storage State** (projeto `setup`), guardada
  por auto-skip até o login real ser mapeado — mantém `playwright test` verde.
- **ADR-007:** Fixtures tipadas em `src/fixtures/test-fixtures.ts`; specs
  importam `test`/`expect` de lá, não de `@playwright/test`.
- **ADR-008:** Camada `tests/local` com testes `@local` executáveis sem o
  o sistema (via `setContent`), para validar o harness em qualquer ambiente.
- **ADR-009:** Exemplos de Page/Component/API/Factory com rotas e seletores
  ILUSTRATIVOS, claramente marcados; nada de inventar contrato real do sistema.
- **ADR-010:** Autenticação via SSO Keycloak. Quando há 2FA, não é automatizável
  headless → autenticação interativa única (`npm run auth:login`) + reuso de
  `storageState`; sem 2FA, modo `automated`. Credenciais apenas em `.env`
  (gitignored). URLs/realm/rotas reais ficam no `.env`/exploratório do ambiente,
  não versionados.
- **ADR-011:** Projeto **multi-ambiente e homolog-first**. `APP_ENV` (homolog|prod)
  e `AUTH_MODE` (automated|interactive) controlam comportamento; todas as URLs e
  credenciais vêm do `.env`. Autenticação modular em `src/auth/login.ts`,
  reutilizável por outros projetos do workspace.
- **ADR-012:** Três projetos Playwright: `local` (sem rede/auth, roda sempre),
  `setup` (provisiona sessão) e `chromium` (funcionais, depende do setup). Specs
  mapeados em produção ficam atrás de `APP_ENV=prod` como templates; o default
  (homolog) mantém a suíte verde sem credenciais.
- **ADR-013:** Gherkin é **documental** (artefatos em `features/`), não
  executável. Vínculo com a automação por **rastreabilidade** (tag `@CT-...` +
  tabela na `historia.md`). Sem `@cucumber/cucumber`/`playwright-bdd` por ora —
  `playwright-bdd` fica como evolução possível sem reescrever cenários.
- **ADR-014:** Evidência de execução é **imagem por passo** (fixture `evidencia`,
  `EVIDENCE=1`) em `evidencias/<feature>/<CT>/`, mais relatório HTML e JUnit.
  Execução **local** por enquanto, sem integração de ferramenta; o `junit.xml`
  deixa o caminho pronto para Xray/CI no futuro. PDF/anexos só quando houver
  necessidade de sign-off formal. `evidencias/` ignorado pelo Git (PII).

## Pendências (dependem de informação externa)

- Mecanismo e fluxo de login reais; URL de homologação autorizada.
- Rotas, seletores e jornadas reais de CPR e CPR Dollar.
- Contratos das APIs Java (para habilitar API Clients e seed/teardown).
- Política de retenção de artefatos e ferramenta de CI/CD corporativa.
- Autorização e ambiente seguro para cenários com mutação de dados.
