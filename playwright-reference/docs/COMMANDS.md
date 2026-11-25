# Comandos (slash commands / skills)

Todo o fluxo é executável por **slash command** no GitHub Copilot Chat (arquivos
em `.github/prompts/*.prompt.md`). Cada comando chama os scripts npm por baixo —
então também funciona no terminal, sem a IA.

> Habilite `chat.promptFiles` no VS Code para usar os `/comandos` no Copilot.

## Fluxo completo (ordem ao entrar no sistema)

| # | Slash command | Faz | Script equivalente |
|---|---------------|-----|--------------------|
| 1 | `/doctor` | verifica prontidão (.env, credenciais, sessão, browser, rede) | `npm run doctor` |
| 2 | `/auth` | provisiona a sessão (2FA interativo ou login automático) | `npm run auth:login` |
| 3 | `/scaffold` | cria pastas de sistema / feature / fluxo cross-system | `npm run scaffold -- ...` |
| 4 | `/explorar` | mapeia telas/campos/APIs; atualiza o Postman | `npm run explore -- /rota 1` |
| 5 | `/nova-feature` | cria história + Gherkin (CTs) da feature | `npm run scaffold -- feature ...` |
| 6 | `/gerar-teste` | gera Page Object + spec (do exploratório + Gherkin) | — |
| 7 | `/evidencias` | roda com evidência passo a passo | `EVIDENCE=1 npx playwright test` |
| 8 | `/postman` | captura APIs e gera a coleção Postman por sistema | `npm run capture:apis` |
| ★ | `/mapear-frontend` | mapeia seletores do frontend React (mesmo workspace) | `npm run scan:frontend -- <src>` |
| — | `/eagro` | índice: mostra o fluxo e os comandos | — |

## Detalhe de cada comando

### `/doctor`
Roda `npm run doctor`. Mostra ✅/⚠️/❌ do ambiente e o que falta antes de explorar
(rede/VPN inclusa). Não exibe segredos.

### `/auth`
Provisiona a sessão conforme `AUTH_MODE`/`AUTH_STRATEGY`. Com 2FA, você conclui o
login uma vez; a sessão fica em `playwright/.auth/user.json` (gitignored).

### `/scaffold`
Cria estrutura multi-sistema (ver `docs/MULTI_SYSTEM.md`):
- `system <sistema>` · `feature <sistema> <feature>` · `flow <fluxo> s1 s2 ...`

### `/explorar`
Exploratório read-only (navegação) ou guiado (criação, só homolog). Analisa
TODOS os pontos da tela; se travar, **para e pergunta**. Atualiza a coleção
Postman a cada rodada.

### `/nova-feature`
Cria história + `.feature` (Gherkin, CTs) — não inventa cenários, pede ao usuário.

### `/gerar-teste`
Gera o teste a partir do exploratório + Gherkin. Seletores só do exploratório;
Page Object por sistema; Component Object para widget repetido; tag `@CT-xxx`.

### `/evidencias`
Roda com `EVIDENCE=1` → prints por passo em `evidencias/<feature>/<CT>/`.

### `/postman`
`npm run capture:apis` → captura (merge incremental) + coleção Postman por
sistema, importável. PII-safe.

## Guardrails (sempre valem)
Nunca inventar seletor/rota/endpoint; mutação só em `APP_ENV=homolog`; sem
PII/segredos; `npm run check` antes de concluir. Ver `docs/GUARDRAILS.md`.
