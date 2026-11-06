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

## SSO Keycloak (observação comum)

Em telas Keycloak, `username`/`password` costumam não expor nome acessível; o CSS
por atributo `input[name="username"]` / `input[name="password"]` é estável (padrão
Keycloak) e justificado até haver rótulos acessíveis ou `data-testid`.
