# Quickstart — do zero ao primeiro teste

Checklist de arranque para rodar o projeto em um ambiente (ex.: homologação).

## Passo 0 — Instalar
```bash
npm install
npx playwright install chromium
```

## Passo 1 — Configurar o ambiente
```bash
cp .env.example .env
```
Edite o `.env`:
- `BASE_URL` / `BFF_URL` — URLs do ambiente alvo.
- `EAGRO_USER` / `EAGRO_PASSWORD` — conta de teste (nunca no chat/commit).
- `AUTH_STRATEGY` — `keycloak` | `form` | `none`.
- `AUTH_MODE` — `automated` (sem 2FA) | `interactive` (com 2FA).
- `APP_ENV` — `homolog` (obrigatório para jornadas de criação).

## Passo 2 — Verificar prontidão
```bash
npm run doctor
```
Diz exatamente o que falta (config, credenciais, sessão, browser, **alcance de
rede**). Resolva os ❌ antes de seguir.

## Passo 3 — Autenticar
- Sem 2FA: nada a fazer (o setup loga sozinho ao rodar os testes).
- Com 2FA: `npm run auth:login` (conclua o 2FA na janela; sessão é salva).

## Passo 4 — Explorar (mapear o sistema)
```bash
# navegação/consulta (read-only)
npm run explore -- /<rota> 1

# jornada de criação (homolog): preencher a função jornada() em
# scripts/record-journey.cjs e rodar:
node scripts/record-journey.cjs /<rota> <nome-da-jornada>
```
Se o exploratório não conseguir avançar, ele **para e pergunta** o que fazer.
Salve o mapa em `docs/EXPLORATORIO_<feature>.md`.

## Passo 5 — Criar a feature e o teste
```bash
# estrutura (história + Gherkin + pastas)
#  → features/<dom>/<feat>/ e src/pages/<dom>/<feat>/ e tests/functional/<dom>/<feat>/
```
Escreva o cenário Gherkin (CT), gere o Page Object (seletores do exploratório) e
o spec com tag `@CT-xxx`. Dados via factory (faker); limpeza via `cleanup`.

## Passo 6 — Rodar com evidência e qualidade
```bash
npm run check                 # typecheck + dependências + guardrails
EVIDENCE=1 npx playwright test --grep @CT-xxx
```

## Passo 7 — Documentar APIs e gerar Postman (opcional)
```bash
npm run capture:apis          # test-results/api-capture.json
npm run export:postman        # test-results/postman-collection.json (importável)
```

---

Referências: `docs/ONBOARDING_HOMOLOG.md`, `docs/TESTING_STANDARDS.md`,
`docs/GUARDRAILS.md`, `docs/TEST_DATA_STRATEGY.md`, `docs/DOCUMENTACAO_E_POSTMAN.md`.
