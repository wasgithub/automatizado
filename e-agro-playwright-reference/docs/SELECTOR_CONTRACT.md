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

Sem acesso ao frontend corporativo, registrar os seletores observados em uma matriz e propor ao time React os atributos necessários. Não modificar DOM da aplicação a partir do teste para criar IDs artificiais.

## Matriz de seletores observados (e-Agro real)

Mapeado via exploração do ARIA snapshot (ver `scripts/explore.cjs`).

| Elemento | Local | Seletor adotado | Observação / melhoria sugerida |
|----------|-------|-----------------|--------------------------------|
| Abrir menu de login | Home | `getByRole('button', { name: /entre.*cadastre/i })` | OK (role+nome) |
| Opção "Entre" | Menu | `getByRole('button', { name: 'Entre', exact: true })` | OK |
| Usuário (E-mail/CPF) | SSO Keycloak | `locator('input[name="username"]')` | **Sem label/id** → pedir `data-testid` ou `<label for>` |
| Senha | SSO Keycloak | `locator('input[name="password"]')` | **Sem label/id** → idem |
| Botão Entrar (SSO) | SSO Keycloak | `getByRole('button', { name: 'Entrar' })` | OK |
| Entrada CPR | Home | `getByRole('button', { name: 'CPR PJ' })` | OK |
| Hub pós-login | `/dashboard/DashboardPage` | — | Deep-links (ex.: `/simulacao-de-cpr`) **redirecionam** ao dashboard quando autenticado; navegar via cliques in-app |
| Marco autenticado | Dashboard | `getByRole('button', { name: 'Meu painel' })` | Só existe logado — bom alvo de smoke |
| Linhas de Crédito | Dashboard | `getByRole('button', { name: 'Linhas de Crédito' })` | OK |
| Menu da conta | Dashboard | `Meus pedidos de crédito`, `Minhas cotações`, `Contratos Futuros` | Dentro de menu; confirmar abertura e o que é leitura-segura |
| Perfil (acesso) | Dashboard | `getByRole('button', { name: /^ol[aá],/i })` | Prefixo "Olá," evita PII no código |

## Rotas de CONSULTA (read-only) confirmadas

Deep-linkáveis e com título estável (asserta-se o título, nunca dados):

| Consulta | Rota | Título (marco de asserção) | Status |
|----------|------|----------------------------|--------|
| Minhas cotações | `/cotacoes/minhas-contacoes-de-preco` | "Cotações de preço" | ✅ teste real passa |
| Extrato financeiro (IRPF) | `/resumo-financeiro` | "Extrato financeiro" | ✅ teste real passa |
| Meus pedidos de crédito | `/simulationlogged/creditcontractpage` | — | ⚠️ deep-link erra ("sistema fora do ar"); só via menu in-app; sem marco estável → teste ignorado |
| Meus endereços | `/account/address-page` | — | 🚫 abre modal de EDIÇÃO (mutação), não é consulta → excluído |

> Os campos `username`/`password` do Keycloak não expõem nome acessível. O CSS
> por atributo `name` é estável (padrão Keycloak) e está justificado aqui até o
> time adicionar rótulos acessíveis ou `data-testid`.
