/**
 * Fluxo de autenticação REUTILIZÁVEL — SSO Keycloak (genérico).
 *
 * As partes genéricas do Keycloak (campos usuário/senha, botão "Entrar") são
 * estáveis entre ambientes. A forma de ALCANÇAR o SSO e a etapa de 2FA variam
 * por aplicação — por isso ficam isoladas e devem ser confirmadas no
 * exploratório do ambiente alvo.
 */
import type { Page } from '@playwright/test';
import type { Credenciais } from '../config/env';

/** Qualquer URL de realm Keycloak (independe do nome do realm/ambiente). */
export const SSO_REALM = /\/auth\/realms\//;

/**
 * Leva a página até o formulário do SSO a partir da home.
 * Ajuste o acionador de entrada (botão "Entrar"/"Login") ao app alvo.
 */
export async function acessarSso(page: Page): Promise<void> {
  if (SSO_REALM.test(page.url())) return;
  await page.getByRole('button', { name: /entrar|entre|login/i }).first().click().catch(() => {});
  await page.waitForURL(SSO_REALM, { timeout: 30_000 });
}

/** Preenche usuário/senha e envia (não trata 2FA). */
export async function preencherCredenciais(page: Page, creds: Credenciais): Promise<void> {
  await page.locator('input[name="username"]').fill(creds.usuario);
  await page.locator('input[name="password"]').fill(creds.senha);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
}

/** Marco de uma etapa de verificação em duas etapas (2FA), quando existir. */
export function estaEm2FA(page: Page): Promise<boolean> {
  return page
    .getByRole('heading', { name: /verifica[çc][ãa]o|autentica[çc][ãa]o|c[óo]digo/i })
    .isVisible()
    .catch(() => false);
}

/**
 * Login automatizado ponta-a-ponta (ambientes SEM 2FA). Se encontrar 2FA sem
 * OTP configurado, orienta o modo interativo.
 * Pré-condição: a página já deve estar em `BASE_URL/` (ou no SSO).
 */
export async function autenticar(page: Page, creds: Credenciais): Promise<void> {
  await acessarSso(page);
  await preencherCredenciais(page, creds);

  if (await estaEm2FA(page)) {
    if (!creds.otp) {
      throw new Error(
        'Etapa de 2FA detectada e nenhum OTP configurado. Use AUTH_MODE=interactive ' +
          '("npm run auth:login") ou configure EAGRO_OTP se o ambiente usar código fixo.',
      );
    }
    // ⚠️ Seletores de OTP variam — ajuste ao ambiente alvo no exploratório.
    await page.getByRole('textbox').first().fill(creds.otp);
    await page.getByRole('button', { name: /continuar|confirmar|validar/i }).first().click();
  }

  await page.waitForURL((url) => !SSO_REALM.test(url.href), { timeout: 60_000 });
}
