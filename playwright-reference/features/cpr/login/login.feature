# language: pt
@cpr @login
Funcionalidade: Login no sistema (SSO)
  Como cliente do sistema
  Quero acessar minha conta com segurança
  Para utilizar os serviços de crédito

  @CT-001 @smoke
  Cenário: Exibir o formulário de login
    Dado que acesso a área de entrada do sistema
    Quando escolho entrar
    Então vejo o formulário de login com campos de usuário e senha

  @CT-002
  Cenário: Solicitar verificação em duas etapas
    Dado que informo credenciais válidas
    Quando confirmo o login
    Então sou solicitado a informar o código de verificação
