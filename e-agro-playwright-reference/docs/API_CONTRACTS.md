# Contratos de API (BFF GraphQL) — e-Agro

Mapeado por interceptação de rede durante navegação **read-only** autenticada
(`scripts/capture-apis.cjs`). **PII-safe:** só nomes de campos e TIPOS; todos os
valores foram descartados. Muitos campos aparecem como `null` porque a conta de
teste não possui dados (sem crédito, sem cotações).

## Visão geral

- **Endpoint único:** `POST https://bff.e-agro.com.br/graphql` (backend-for-frontend).
- **Padrão GraphQL:** a operação é identificada por `operationName` (também
  anexado à URL como `?<OperationName>` para cache/observabilidade).
- **Autenticação:** sessão do SSO Keycloak (token Bearer). No Playwright, o
  `storageState` já carrega a sessão — o `APIRequestContext` reaproveita cookies.
- **28 operações** observadas nas telas dashboard, cotações e extrato.

## Operações por domínio

### Autenticação / Perfil
| Operação | Variáveis | Resposta (tipos) |
|----------|-----------|------------------|
| `ValidateUser` | `client` | `validateUser { isValidToken:boolean, isActive:boolean, isSocial:boolean }` |
| `GetProfileGeolocation` | — | `getProfile { preferences }` |
| `GetNotificationByCpf` | — | `getNotificationByCpf: []` (vazio na conta de teste) |

### Crédito / CPR
| Operação | Variáveis | Resposta (tipos) |
|----------|-----------|------------------|
| `GetCredit` | — | `me { creditLimit:string, hasCredit:boolean, correntista:boolean, creditType, creditStore, creditAssurance }` |
| `GetCreditLimit` | `input` | `getCreditLimit { elegivel:boolean, limite, motivoInelegibilidade:number, clientePossuiConta:boolean }` |
| `GetParameter` | `groupType` | `getParameter: [{ id, codigoModalidadeCredito, modalidadeCredito, descricaoParametro, modalidadeParametro, unidadeParametro, categoriaParametro, tipoParametro, valorParametro:number }]` |

### Dashboard / Pedidos
| Operação | Variáveis | Resposta (tipos) |
|----------|-----------|------------------|
| `GetDashboardDataContent` | — | `getDashboardDataContent.newDashboard { crmBanner {...} }` |
| `GetDashboardOrdersAndLimit` | — | `{ title, type, description, icon, redirect, orders {...} }` |
| `GetOrderByUser` | — | `getOrderByUser: []` |
| `GetMarketplaceDataToDashboard` | — | conteúdo do marketplace |

### Cotações
| Operação | Variáveis | Resposta (tipos) |
|----------|-----------|------------------|
| `GetQuotations` | `clientDocument` | `getQuotations { totalPages:number, totalElements:number, first:boolean, last:boolean, size:number, content }` (paginado) |
| `GetProductQuotationData` | `filterDate` | `getProductQuotationData: []` |

### Conteúdo / Layout (CMS)
`GetHeaderV2`, `GetFooter`, `GetSlider(channel)`, `GetMarketplaceCategories`,
`GetSearchBarContentResponse`, `GetPostStaticContent`, `GetPostImages(route)`,
`GetWhatsappButton`, `StoreConfig`, `Cookies`, `GetFeatureFlag(featureName)`,
`GetDataServicesStorefrontInstanceContext`.

### Localização / Loja
`GetMunicipio(uf)`, `GetCountiesByName(countyName)`, `CartById(id)`.

## Observações de segurança

- Variáveis como `clientDocument` (CPF) e `client` **carregam PII** nas
  requisições — ao implementar API Clients, nunca logue variáveis/valores.
- Respostas de crédito/cotação contêm dados financeiros — trate como PII.
- Este mapa é um CONTRATO (forma), não dados. Recapture com
  `node scripts/capture-apis.cjs` quando a API evoluir.

## Como recapturar

```bash
npm run auth:login          # sessão válida (2FA)
node scripts/capture-apis.cjs   # imprime o mapa (valores redigidos)
```
