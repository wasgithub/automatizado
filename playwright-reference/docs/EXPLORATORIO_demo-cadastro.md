# Exploratório — Cadastro de Produtor (teste de mesa)

Gerado pelo crawler `explore-feature.cjs` contra o mini-app local
`tests/_fixtures/mini-app.html` (cenário FICTÍCIO, não é tela real do sistema).

## Tela: Cadastro de Produtor (rota `/`)

**Título:** "Cadastro de Produtor"

**Campos:**
| Rótulo | id/name | Seletor recomendado |
|--------|---------|---------------------|
| Nome do produtor | `nome` | `getByLabel('Nome do produtor')` |
| CPF | `documento` | `getByLabel('CPF')` |

**Botões:** "Cadastrar" → `getByTestId('cadastrar-produtor')` (tem `data-testid`).

**Resultado observável:** `role=status` exibe "Produtor cadastrado com sucesso"
quando nome e CPF estão preenchidos; senão "Preencha nome e CPF".

**APIs:** nenhuma (mini-app estático).

## Mapeamento para o CT
- CT-DEMO-01 "Cadastrar produtor com dados válidos":
  - Dado → abrir a tela (título visível).
  - Quando → `getByLabel` nos campos + `getByTestId('cadastrar-produtor')`.
  - Então → `getByRole('status')` com a mensagem de sucesso.
