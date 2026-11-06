# Plano de implantação — prova de conceito local

## P0 — Semana 1: fundação
- Configurar TypeScript, Playwright, lint opcional e scripts de execução.
- Mapear ambiente autorizado, restrições da conta e dados sensíveis.
- Levantar 1 jornada CPR não destrutiva, com telas e resultados esperados.
- Criar baseline: duração, taxa de falhas e seletores frágeis.

## P1 — Semanas 2–3: piloto CPR
- Implementar Page Object, componente compartilhado e fixture conforme necessidade real.
- Validar cenários de navegação e consulta sem mutações.
- Gerar HTML, trace e screenshot com política de retenção local.
- Fazer revisão de arquitetura e critérios de pronto.

## P2 — Semanas 4–5: CPR Dollar
- Mapear semelhanças e diferenças sem presumir reaproveitamento.
- Extrair somente componentes realmente comuns.
- Executar isoladamente e comparar estabilidade.

## P3 — Após piloto: regressão e CI/CD
- Marcar cenários críticos estáveis com `@smoke` e `@regression`.
- Integrar pipeline quando a ferramenta corporativa for conhecida.
- Medir tempo e falhas; testar paralelismo gradualmente após isolamento.

## Definition of Done
Teste independente; sem sleeps; seletores semânticos; asserts de negócio; evidências sem PII; sem escrita em conta real; typecheck passando; documentação de pré-condições e risco.

## Indicadores
Taxa de sucesso na primeira tentativa, flaky rate, duração P50/P95, falhas de ambiente vs. produto, percentual de seletores frágeis e tempo de manutenção.
