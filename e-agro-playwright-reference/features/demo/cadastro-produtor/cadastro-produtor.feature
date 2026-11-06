# language: pt
@demo @cadastro-produtor
Funcionalidade: Cadastro de Produtor (teste de mesa — fictício)
  Como operador
  Quero cadastrar um produtor informando nome e CPF
  Para validar a jornada de cadastro de ponta a ponta

  @CT-DEMO-01 @smoke
  Cenário: Cadastrar produtor com dados válidos
    Dado que acesso a tela de cadastro de produtor
    Quando informo nome e CPF e confirmo o cadastro
    Então vejo a mensagem de cadastro realizado com sucesso
