/**
 * Estratégia de autenticação: SSO Keycloak (genérico).
 *
 * Campos padrão do Keycloak (`input[name=username/password]`, botão "Entrar")
 * valem na maioria dos realms. A forma de ALCANÇAR o SSO e o 2FA variam — ajuste
 * se o ambiente alvo diferir.
 */
import type { Page } from '@playwright/test';
import type { Credenciais } from '../../config/env';
import type { AuthStrategy } from '../types';

/** Qualquer URL de realm Keycloak (independe do nome do realm/ambiente). */
export const SSO_REALM = /\/auth\/realms\//;

export class KeycloakAuth implements AuthStrategy {
  readonly nome = 'keycloak';

  async login(page: Page, creds: Credenciais): Promise<void> {
    if (!SSO_REALM.test(page.url())) {
      await page.getByRole('button', { name: /entrar|entre|login/i }).first().click().catch(() => {});
      await page.waitForURL(SSO_REALM, { timeout: 30_000 });
    }

    await page.locator('input[name="username"]').fill(creds.usuario);
    await page.locator('input[name="password"]').fill(creds.senha);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();

    const em2fa = await page
      .getByRole('heading', { name: /verifica[çc][ãa]o|autentica[çc][ãa]o|c[óo]digo/i })
      .isVisible()
      .catch(() => false);
    if (em2fa) {
      if (!creds.otp) {
        throw new Error(
          'Etapa de 2FA detectada e nenhum OTP configurado. Use AUTH_MODE=interactive ' +
            '("npm run auth:login") ou configure EAGRO_OTP se o ambiente usar código fixo.',
        );
      }
      await page.getByRole('textbox').first().fill(creds.otp);
      await page.getByRole('button', { name: /continuar|confirmar|validar/i }).first().click();
    }

    await page.waitForURL((url) => !SSO_REALM.test(url.href), { timeout: 60_000 });
  }
}
