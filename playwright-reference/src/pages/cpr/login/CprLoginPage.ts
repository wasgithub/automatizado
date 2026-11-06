/**
 * Page Object da feature de LOGIN (CPR) — SSO Keycloak (genérico).
 *
 * Exemplo da organização por DOMÍNIO (cpr) → FEATURE (login). Os campos padrão
 * do Keycloak (`input[name=username/password]`, botão "Entrar") valem na maioria
 * dos ambientes. CONFIRME no exploratório a forma de ALCANÇAR o SSO e a etapa de
 * 2FA do ambiente alvo (variam por aplicação).
 */
import type { Locator, Page } from '@playwright/test';

/** Qualquer URL de realm Keycloak (independe do nome do realm/ambiente). */
export const SSO_REALM = /\/auth\/realms\//;

export class CprLoginPage {
  constructor(private readonly page: Page) {}

  /** Navega da home até o formulário do SSO. Ajuste a entrada ao app alvo. */
  async irParaLogin(): Promise<void> {
    await this.page.goto('/');
    await this.page.getByRole('button', { name: /entrar|entre|login/i }).first().click().catch(() => {});
    await this.page.waitForURL(SSO_REALM);
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

  async informarCredenciais(usuario: string, senha: string): Promise<void> {
    await this.campoUsuario().fill(usuario);
    await this.campoSenha().fill(senha);
  }

  async enviar(): Promise<void> {
    await this.botaoEntrar().click();
  }
}
