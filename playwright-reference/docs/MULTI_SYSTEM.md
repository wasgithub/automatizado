# Fluxos multi-sistema

Um fluxo de negócio pode atravessar **vários sistemas** com URLs/logins
diferentes (ex.: e-agro → ServiceNow → e-agro). O projeto suporta isso com
pastas e configuração distintas por sistema.

## Configuração dos sistemas

`systems.config.json` (ignorado pelo Git; modelo em `systems.config.example.json`):

```json
{
  "defaultSystem": "e-agro",
  "systems": {
    "e-agro":     { "baseUrl": "https://...", "bffUrl": "https://...", "authStrategy": "keycloak" },
    "servicenow": { "baseUrl": "https://...", "authStrategy": "form" }
  }
}
```

Nos testes: `getSystem('servicenow').baseUrl` (ver `src/config/systems.ts`).
Sem o arquivo, cai para um único sistema `default` derivado de `BASE_URL`.

## Estrutura de pastas (por sistema + por fluxo)

```
src/systems/<sistema>/pages/<feature>/<Page>.ts   # seletores isolados por sistema
tests/systems/<sistema>/<feature>/*.spec.ts       # testes de 1 sistema
tests/flows/<fluxo>/*.spec.ts                      # jornada cross-system (orquestra sistemas)
features/<sistema>/<feature>/...                   # Gherkin por sistema
features/flows/<fluxo>/...                         # Gherkin do fluxo cross-system
docs/EXPLORATORIO_<sistema>-<feature>.md           # mapa por sistema
```

- **Seletores NUNCA se misturam entre sistemas** — cada sistema tem seus Page
  Objects em `src/systems/<sistema>/`.
- **Um fluxo** (`tests/flows/<fluxo>`) abre a URL de cada sistema na sua etapa
  (`getSystem('<nome>').baseUrl`) e usa os Page Objects daquele sistema.

## Gerar as pastas (scaffolder)

```bash
npm run scaffold -- system <sistema>                 # cria src/systems/<sistema>/
npm run scaffold -- feature <sistema> <feature>      # pages + tests + gherkin da feature
npm run scaffold -- flow <fluxo> e-agro servicenow e-agro   # jornada cross-system (ordem = etapas)
```

Depois: adicione cada sistema em `systems.config.json` e rode o exploratório.

## Exploratório + coleção Postman por sistema

Durante o exploratório, a coleção Postman **cresce automaticamente** e fica
agrupada por sistema:

```bash
npm run capture:apis     # captura (merge incremental) + atualiza o Postman
```

- `test-results/api-capture.json` — acumula as operações (dedup), cada uma
  marcada com seu **sistema** (resolvido pelo host via `systems.config.json`).
- `test-results/postman-collection.json` — **pasta por sistema** → GraphQL/REST,
  com variável `{{baseUrl_<sistema>}}` própria. Importe no Postman (File → Import).

PII-safe: sem valores/tokens; variáveis GraphQL como `"<preencher>"`.
