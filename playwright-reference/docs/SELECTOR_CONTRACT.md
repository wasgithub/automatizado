# Contrato de testabilidade React + Playwright

Ordem: `getByRole` > `getByLabel` > `getByTestId` > texto estável contextualizado > CSS justificado.

Exemplos:
```tsx
<button type="button" data-testid="cpr-confirmar">Confirmar</button>
<label htmlFor="valor-cpr">Valor</label>
<input id="valor-cpr" />
```
```ts
page.getByRole('button', { name: 'Confirmar', exact: true });
page.getByLabel('Valor');
page.getByTestId('cpr-confirmar');
```

Convenção sugerida para test IDs: `<dominio>-<acao-ou-campo>-<tipo>`, por exemplo `cpr-confirmar-btn`. Não exigir test IDs em todos os elementos. Evitar nomes atrelados a layout ou posição. Para elementos repetidos, usar contêiner semântico com identificador estável.

Registrar os seletores observados no exploratório em uma matriz por ambiente
(em `docs/EXPLORATORIO_<feature>.md`) e propor ao time de frontend os atributos
necessários. Não modificar o DOM da aplicação a partir do teste para criar IDs.

## Matriz de seletores (modelo)

Preencha por feature com o que o exploratório revelar:

| Elemento | Tela | Seletor adotado | Observação / melhoria sugerida |
|----------|------|-----------------|--------------------------------|
| (campo) | (tela) | `getByLabel('...')` | pedir `<label for>`/`data-testid` se faltar |
| (botão) | (tela) | `getByRole('button', { name: '...' })` | — |

## Centralização de seletores (onde o seletor mora)

O seletor NUNCA fica solto no teste. Centralização em duas camadas:

1. **Page Object** — o seletor de uma tela mora no método do Page Object (um
   único lugar por tela). Se mudar, altera-se uma linha e todos os testes seguem.
   O teste chama a função (`cadastro.campoNome()`), nunca o seletor cru.
2. **Component Object** — elemento/widget que se repete em VÁRIAS telas (diálogo,
   tabela, cabeçalho, date-picker, botão do design system) vira um objeto
   reutilizável (ex.: `ConfirmDialog`, `DataTable`). Encapsula o seletor uma vez
   e é reutilizado em qualquer tela.

**Proibido:** mapa global de strings de seletor (`selectors.ts` com CSS). Fere o
contrato (guarda CSS em vez de `getByRole`/`getByLabel`), perde o `Locator`
tipado/auto-waiting e desacopla o seletor da tela. A centralização correta é
POM + Component Object, não um balde global.

**No exploratório:** ao gerar o teste, extraia os locators para o Page Object; se
o mesmo elemento aparecer em mais de uma tela, extraia um Component Object.

## SSO Keycloak (observação comum)

Em telas Keycloak, `username`/`password` costumam não expor nome acessível; o CSS
por atributo `input[name="username"]` / `input[name="password"]` é estável (padrão
Keycloak) e justificado até haver rótulos acessíveis ou `data-testid`.
