# Estratégia de massa de dados

Ambiente de homologação é **compartilhado e concorrente**. A massa de dados é a
principal fonte de flakiness e de efeitos colaterais indesejados. Esta
estratégia prioriza **isolamento** e **não destrutividade**.

## Princípios

1. **Dados sintéticos, nunca reais.** Factories (`src/factories`) geram massa
   fictícia com `@faker-js/faker` (locale pt-BR, lib **homologada no banco**).
   Nunca use dados de clientes reais em testes. Para reprodutibilidade, passe
   `seed` à factory (mesma semente → mesmos valores).
2. **Unicidade por execução.** Todo dado criado recebe o prefixo `runId`
   (`src/utils/run-id.ts`), evitando colisão entre execuções paralelas ou entre
   equipes no mesmo ambiente.
3. **Sem dependência de estado pré-existente.** Nenhum teste pode assumir que um
   registro específico já existe. Não há asserts sobre contagens globais ou
   dados compartilhados mutáveis.
4. **Sem dependência de ordem.** Cada teste prepara e valida apenas o que ele
   mesmo produz.

## Isolamento em ambiente compartilhado

- Prefixe identificadores com `runId` e filtre resultados por esse prefixo.
- Não afirme sobre totais globais (ex.: "existem 10 CPRs") — outra equipe pode
  alterar o número a qualquer momento.
- Prefira consultas escopadas ao próprio dado (por referência única).

## Criação e limpeza

- **Não presuma** que endpoints de preparação (`seed`) ou limpeza (`teardown`)
  existam. Confirme com o time antes de depender deles.
- Quando houver API autorizada, crie dados via API Client
  (`src/api-clients`) e limpe **apenas os próprios registros**, idealmente em
  fixture com escopo de teste.
- Enquanto não houver mecanismo de limpeza, mantenha os testes **somente
  leitura/navegação** em conta real (ver [AUTHENTICATION.md](AUTHENTICATION.md)).

## Exploratório que cria dados (homologação)

Para mapear jornadas de criação (usuário, pedido, imóvel), o exploratório
**percorre o fluxo completo e cria dados** — mas apenas em **homologação**:

- Mutação só com `APP_ENV=homolog`; `rec.guardHomolog()` (em
  `scripts/record-journey.cjs`) aborta em produção.
- Massa **sintética e única por `runId`**; os registros criados ficam marcados
  com esse runId para rastreio/limpeza futura.
- Não assumir teardown: se não houver API de limpeza, os dados ficam órfãos,
  porém isolados pelo runId (ver [AUTHENTICATION.md](AUTHENTICATION.md) e
  [ONBOARDING_HOMOLOG.md](ONBOARDING_HOMOLOG.md)).
- Produção permanece **estritamente read-only**.

## Operações financeiras

Nenhuma operação financeira destrutiva ou mutação de dados reais sem
**autorização explícita** e ambiente seguro. As factories não devem produzir
valores que disparem efeitos reais (limites, liquidações) sem essa autorização.
