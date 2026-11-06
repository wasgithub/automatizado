# História: Login no e-Agro (SSO)

> Exemplo concreto ligado ao que já está implementado, para ilustrar a corrente
> História → Gherkin → exploratório → teste.

## Contexto / narrativa
Como **cliente do e-Agro**
quero **acessar minha conta com segurança (SSO + verificação em duas etapas)**
para **utilizar os serviços de crédito**.

## Critérios de aceite
- [ ] A partir da área de entrada, consigo abrir o formulário de login.
- [ ] O formulário exige usuário/CPF e senha.
- [ ] Com credenciais válidas, o sistema solicita o código de verificação (2FA).

## Protótipo
- Link do design: <preencher> (imagens opcionais em `prototipo/`)

## Pré-condições / massa de dados
- Conta de teste do ambiente (homolog); credenciais via `.env` (`EAGRO_USER`/`EAGRO_PASSWORD`).

## Rastreabilidade (CT ↔ cenário ↔ teste)

| CT | Cenário (.feature) | Teste automatizado | Status |
|----|--------------------|--------------------|--------|
| CT-001 | "Exibir o formulário de login" | `tests/functional/cpr/login/login.spec.ts` → "exibe o formulário de login do SSO" | ✅ (baseline prod) |
| CT-002 | "Solicitar verificação em duas etapas" | `login.spec.ts` → "login completo (2FA)" | ⏭️ skip (2FA interativo) |

## Notas do exploratório
- SSO Keycloak (`/auth/realms/...`); campos `input[name=username]` / `input[name=password]`; botão "Entrar".
- 2FA obrigatório em produção (E-mail/SMS). Em homolog, confirmar se há 2FA.
- Entrada do SSO e campo de OTP a confirmar em homolog (`src/auth/login.ts`).
