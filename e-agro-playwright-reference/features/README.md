# features/ — histórias, protótipos e cenários Gherkin

Fonte dos artefatos de **negócio** que guiam a automação. Espelha a mesma
organização dos testes: `features/<domínio>/<feature>/`.

## Fluxo de trabalho

```
1. História + Gherkin (.feature)   → o QUE validar (negócio, declarativo)
2. Exploratório guiado pelo cenário → mapeia telas/campos/APIs daquele fluxo
3. Teste automatizado               → implementa passos/asserts sobre o mapa real
```

- O **Gherkin é declarativo** ("Quando confirmo o pedido"), nunca imperativo
  ("clico no botão X"). O "como" (seletores/campos) vive no exploratório e nos
  Page Objects — assim o cenário de negócio não quebra quando a UI muda.
- O **exploratório** daquele fluxo é gravado em
  `docs/EXPLORATORIO_<feature>.md` (gerado por `npm run explore`).
- O **teste automatizado** fica em `tests/functional/<domínio>/<feature>/` e
  referencia o cenário pelo ID do CT (ver rastreabilidade na `historia.md`).

## Conteúdo de cada pasta de feature

| Arquivo | Para quê |
|---------|----------|
| `historia.md` | descrição da história, critérios de aceite, rastreabilidade (CT ↔ cenário ↔ teste) |
| `*.feature` | cenários em Gherkin (pt-BR, `# language: pt`) |
| `prototipo/` | imagens/links do protótipo (**sem dados reais de cliente**) |

## Ligação Gherkin ↔ automação (decisão atual)

**Gherkin é documental** (forma de escrever os cenários), **não executável**. O
vínculo com a automação é **por rastreabilidade**: o teste Playwright referencia
o cenário pela tag/ID (`@CT-123`) e a `historia.md` mantém a tabela
CT ↔ cenário ↔ teste. Simples e **sem dependências novas**. Ver ADR em
`docs/DECISIONS.md`.

> **Evolução possível (não adotada):** `playwright-bdd` tornaria o `.feature`
> executável (step defs chamando os Page Objects), sem reescrever o cenário.
> Não usar `@cucumber/cucumber` puro — perde o runner do Playwright (trace, UI
> mode, fixtures, dependências de auth).

## Evidências

Evidência de execução é **imagem por passo** (ver `docs/TESTING_STANDARDS.md`),
gerada com `EVIDENCE=1` em `evidencias/<feature>/<CT>/`. Local por enquanto; o
`junit.xml` já fica pronto para integração futura com ferramenta (ex.: Xray).
