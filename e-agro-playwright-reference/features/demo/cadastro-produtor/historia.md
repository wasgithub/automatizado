# História: Cadastro de Produtor (TESTE DE MESA — fictício)

> Cenário FICTÍCIO para validar o fluxo (história → exploratório → teste →
> evidência). NÃO é tela real do e-Agro. Usa um mini-app local autocontido.

## Contexto / narrativa
Como **operador**
quero **cadastrar um produtor informando nome e CPF**
para **validar que a jornada de cadastro funciona de ponta a ponta**.

## Critérios de aceite
- [ ] A tela de cadastro exibe os campos "Nome do produtor" e "CPF".
- [ ] Com nome e CPF preenchidos, o cadastro confirma com mensagem de sucesso.

## Protótipo
- Mini-app local: `tests/_fixtures/mini-app.html`.

## Pré-condições / massa de dados
- Massa sintética via `@faker-js/faker` (sem dados reais).

## Rastreabilidade (CT ↔ cenário ↔ teste)

| CT | Cenário (.feature) | Teste automatizado | Status |
|----|--------------------|--------------------|--------|
| CT-DEMO-01 | "Cadastrar produtor com dados válidos" | `tests/local/cadastro-produtor-demo.spec.ts` | ✅ |

## Notas do exploratório
- Mapa: `docs/EXPLORATORIO_demo-cadastro.md` (gerado pelo crawler).
