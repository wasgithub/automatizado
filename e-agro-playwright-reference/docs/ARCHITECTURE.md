# Arquitetura proposta

## Contexto
Frontend React.js, backend Java, múltiplos domínios (CPR, CPR Dollar), serviços compartilhados e homologação concorrente. A automação será executada localmente em fase de prova de conceito.

## Princípios
1. **Separação por domínio:** testes funcionais por fluxo; infraestrutura comum em `src`.
2. **Contrato de seletores:** acessibilidade primeiro; `data-testid` para componentes ambíguos. CSS estrutural é último recurso.
3. **Isolamento:** testes não dependem de ordem, usuário ou massa compartilhada mutável.
4. **Segurança:** contas reais apenas para cenários não destrutivos, sem coleta de dados sensíveis.
5. **Evolução:** tags `@functional`, `@smoke`, `@regression` na mesma fonte de testes.

## Camadas
- `tests/functional/<dominio>`: comportamento e asserts de negócio.
- `src/pages/<dominio>`: ações de tela e locators; sem regras de negócio.
- `src/pages/shared` e `src/components`: navegação e widgets comuns.
- `src/fixtures`: composição de dependências e sessão.
- `src/api-clients`: preparação/consulta via APIs apenas após conhecer contratos e autorização.
- `src/factories`: dados sintéticos e IDs únicos; sem dados de clientes reais.
- `docs`: decisões, contratos de seletores e plano de evolução.

## Autenticação
Inicialmente, autenticar manualmente em sessão controlada ou usar fixture de login quando o fluxo e política permitirem. `storageState` deve ficar em `playwright/.auth`, ignorado no Git. Evitar persistir sessões em traces e compartilhá-las.

## Concorrência
Começar com 1 worker. Mesmo com 1 worker, outras equipes podem alterar o ambiente. Não usar asserts sobre contagens globais ou registros compartilhados. Quando disponível, criar dados sintéticos por teste e limpar somente os próprios registros.

## Critérios de qualidade
Sem sleeps arbitrários; seletores resilientes; rastreabilidade por domínio e história; logs sem PII; falhas com diagnóstico; sem dependência de ordem; typecheck; code review.

## Fronteiras
Playwright valida UI e algumas integrações HTTP. Testes unitários e de integração Java devem permanecer no backend. Não simular que um teste E2E substitui cobertura de regras internas.
