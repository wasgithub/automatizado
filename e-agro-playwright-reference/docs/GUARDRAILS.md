# Guardrails (regras duras)

Regras não-negociáveis deste projeto, com verificação automatizada onde possível.
Rode `npm run check` (typecheck + dependências + código) antes de commitar/PR.

## 1. Não inventar automação — sempre baseada no exploratório

- **Seletores, rotas, campos, textos e endpoints só podem vir do exploratório**
  (`docs/EXPLORATORIO_*.md`, `docs/API_CONTRACTS.md`). Nunca "adivinhar".
- Se algo ainda não foi mapeado, o teste fica `test.skip` com justificativa — não
  se preenche com suposição.
- **Retornos de API** são validados contra o contrato mapeado com
  `divergenciasDeContrato(...)` (ver `src/api-clients/contract.ts`), em vez de
  assumir campos/tipos.
- Rastreabilidade obrigatória: todo spec funcional referencia o CT por tag
  `@CT-xxx` (ligado ao `.feature`). Verificado por `check:guardrails` (aviso).

## 2. Anti-padrões proibidos (falham `check:guardrails`)

- `waitForTimeout` (espera fixa) — usar auto-waiting/estados observáveis.
- `test.only` / `describe.only` commitado.
- `page.pause()` (debug) commitado.
- URL/endpoint **hardcoded** em `goto`/`request` — usar `baseURL`/env (nunca
  cravar endpoint "inventado").

## 3. Dependências (contexto bancário)

- **Allowlist mínima e auditável** (`scripts/check-deps.cjs`): hoje
  `@playwright/test`, `typescript`, `@types/node`, `dotenv` e `@faker-js/faker`
  (massa sintética — **homologada no banco**). `check:deps` falha se aparecer
  qualquer outra.
- **Toda nova dependência exige**: justificativa técnica, **revisão de segurança**
  (origem/mantenedor/CVEs/licença), e aprovação — só então entra na allowlist.
- **Proibido**: libs desconhecidas, sem manutenção, de origem duvidosa, ou que
  não passem pela política interna do banco.
- Preferir **solução dependency-free** (Node/Playwright nativos) antes de somar lib.
- Reprodutibilidade: `package-lock.json` versionado; usar `npm ci` em CI.

## 4. Segurança / dados

- Mutação (criar/alterar) **só em `APP_ENV=homolog`**; produção é read-only.
  `rec.guardHomolog()` bloqueia criação fora de homolog.
- Nunca commitar `.env`, `storageState`, cookies, tokens, evidências.
- Nunca logar PII/segredos. Massa sintética única por `runId`.

## Como rodar

```bash
npm run check          # typecheck + deps + guardrails
npm run check:deps     # só dependências
npm run check:guardrails  # só anti-padrões de código
```

Recomendado rodar no **CI** e, opcionalmente, em **pre-commit** (hook simples
chamando `npm run check`).
