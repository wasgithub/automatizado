# language: pt
@dominio @feature
Funcionalidade: <nome da funcionalidade>
  Como <persona>
  Quero <objetivo>
  Para <benefício>

  # Mantenha DECLARATIVO (negócio), não imperativo (cliques/seletores).
  # O "como" fica no exploratório e nos Page Objects.

  @CT-000 @smoke
  Cenário: <nome do cenário>
    Dado que <pré-condição de negócio>
    Quando <ação de negócio>
    Então <resultado observável de negócio>

  @CT-001
  Esquema do Cenário: <cenário parametrizado>
    Dado que <pré-condição com <parametro>>
    Quando <ação>
    Então <resultado>

    Exemplos:
      | parametro | resultado |
      | valorA    | esperadoA |
      | valorB    | esperadoB |
