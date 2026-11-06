---
mode: agent
description: Roda os testes com evidência por passo (EVIDENCE=1)
---

Execute os testes gerando evidência passo a passo (imagens).

1. Se `${input:alvo}` for uma tag `@CT-...`, rode `EVIDENCE=1 npx playwright test --grep ${input:alvo}`.
   Se for um caminho, rode nesse caminho. Sem argumento, rode a suíte funcional.
2. Ao terminar, liste as evidências em `evidencias/<feature>/<CT>/` e lembre que
   `evidencias/` é artefato (ignorado pelo Git; contém PII).

Sem a flag `EVIDENCE=1`, a captura é no-op — não use fora de execuções de evidência.
