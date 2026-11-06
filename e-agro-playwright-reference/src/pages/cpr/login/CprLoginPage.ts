/**
 * Page Object da feature de LOGIN (CPR) — SSO Keycloak do e-Agro.
 *
 * Exemplo da organização por DOMÍNIO (cpr) → FEATURE (login). Encapsula as
 * ações/locators da jornada de login; asserts ficam no teste.
 *
 * Seletores CONFIRMADOS (ver docs/SELECTOR_CONTRACT.md):
 *   - usuário : input[name="username"]  (SSO não expõe label/role → CSS estável)
 *   - senha   : input[name="password"]
 *   - enviar  : getByRole('button', { name: 'Entrar' })
 *
 * Nota de arquitetura: este login é o SSO COMPARTILHADO do e-Agro. Mantido em
 * cpr/login por ser o ponto de entrada da jornada CPR; se outros domínios
 * reutilizarem, promover para src/pages/shared/auth sem mudar os testes.
 */
import type { Locator, Page } from '@playwright/test';

export class CprLoginPage {
  constructor(private readonly page: Page) {}

  /** Navega da home até o formulário do SSO (home → "Entre / Cadastre-se" → "Entre"). */
  async irParaLogin(): Promise<void> {
    await this.page.goto('/');
    await this.page.getByRole('button', { name: /entre.*cadastre/i }).first().click();
    await this.page.getByRole('button', { name: 'Entre', exact: true }).first().click();
    await this.page.waitForURL(/sso\.e-agro\.com\.br/);
  }

  campoUsuario(): Locator {
    return this.page.locator('input[name="username"]');
  }

  campoSenha(): Locator {
    return this.page.locator('input[name="password"]');
  }

  botaoEntrar(): Locator {
    return this.page.getByRole('button', { name: 'Entrar', exact: true });
  }

  /** Preenche credenciais. Nunca logar/imprimir os valores. */
  async informarCredenciais(usuario: string, senha: string): Promise<void> {
    await this.campoUsuario().fill(usuario);
    await this.campoSenha().fill(senha);
  }

  async enviar(): Promise<void> {
    await this.botaoEntrar().click();
  }

  /** Marco da etapa de verificação em duas etapas (2FA). */
  etapaVerificacao2FA(): Locator {
    return this.page.getByRole('heading', {
      name: /Autentica[çc][ãa]o de usu[áa]rio/i,
    });
  }
}
