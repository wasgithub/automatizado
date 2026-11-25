---
mode: agent
description: Mapeia os seletores do frontend React (mesmo workspace) e as lacunas
---

Mapeie os seletores do frontend para a automação, seguindo
`docs/CONTRATO_TESTABILIDADE.md`.

1. Descubra o caminho do `src` do frontend no workspace (pergunte ao usuário se
   não for óbvio; ou use `FRONTEND_PATH` do `.env`).
2. Rode: `npm run scan:frontend -- <caminho-do-src>`
   (ex.: `npm run scan:frontend -- ../e-agro-frontend/src`).
3. Isso gera `docs/FRONTEND_SELECTORS.md` com:
   - **Seletores prontos** (data-testid / aria-label / label) — use nos Page Objects.
   - **Lacunas** — elementos sem gancho estável → proponha `data-testid` ao time React.
4. Resuma os achados e aponte os próximos passos: `/explorar` (confirmar em
   runtime) e `/gerar-teste`.

Não altere o código do frontend — apenas leia e proponha. Nunca logar PII.
