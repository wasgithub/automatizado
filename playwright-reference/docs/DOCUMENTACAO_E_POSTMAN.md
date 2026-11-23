# Documentação do sistema e coleção Postman

O exploratório não serve só para gerar testes — ele **documenta o sistema** e
produz artefatos para o time, de forma PII-safe.

## 1. Documentação de telas (UI)

`npm run explore -- /<rota> 1` gera o inventário de cada tela (títulos, campos,
botões, selects/combos, tabs) e as APIs chamadas. Salve em
`docs/EXPLORATORIO_<feature>.md` — é a documentação viva do fluxo, usada depois
para escrever os testes.

## 2. Documentação de APIs + coleção Postman

```bash
# 1) capturar as APIs navegando as telas (define EXPLORE_ROTAS no .env se quiser)
npm run capture:apis            # gera test-results/api-capture.json

# 2) gerar a coleção Postman importável
npm run export:postman          # gera test-results/postman-collection.json
```

- A coleção é **Postman Collection v2.1** (importável em File → Import).
- Agrupada em pastas **GraphQL** e **REST**; cada item traz método, URL
  (`{{baseUrl}}`), e na descrição o status e a **forma** da resposta.
- Para GraphQL, o body já vem com a query capturada e as variáveis como
  **placeholders** (`"<preencher>"`).

### Distribuir ao time
1. Gere a coleção (acima).
2. Compartilhe `postman-collection.json` (ou importe num workspace do time).
3. Cada pessoa configura a variável `{{baseUrl}}` e a **autenticação** no Postman
   (Bearer/cookie) — a coleção não traz credenciais.

## Segurança (PII)

- A coleção **não contém** valores reais, tokens nem cookies — só a forma das
  APIs, nomes de variáveis e placeholders.
- `test-results/` é ignorado pelo Git — os artefatos não são versionados.
- Ainda assim, trate nomes de operações/campos como informação interna ao
  distribuir fora do time.
