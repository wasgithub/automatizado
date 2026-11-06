/**
 * Fluxo de autenticação REUTILIZÁVEL — SSO Keycloak do e-Agro.
 *
 * Projetado para ser puxado por outro projeto do workspace. As partes genéricas
 * do Keycloak (campos usuário/senha, botão Entrar) são estáveis entre ambientes.
 * A forma de ALCANÇAR o SSO e a etapa de 2FA variam por ambiente — por isso são
 * isoladas e documentadas para ajuste em homologação.
 *
 * Seletores do Keycloak (confirmados em produção; mesma tecnologia em homolog):
 *   - usuário : input[name="username"]   (sem label/role → CSS por atributo)
 *   - senha   : input[name="password"]
 *   - enviar  : getByRole('button', { name: 'Entrar' })
 */
import type { Page } from '@playwright/test';
import type { Credenciais } from '../config/env';

/** Qualquer URL de realm Keycloak (independe do nome do realm/ambiente). */
export const SSO_REALM = /\/auth\/realms\//;

/**
 * Leva a página até o formulário do SSO a partir da home.
 *
 * ⚠️ A entrada abaixo foi observada em produção (home → "Entre / Cadastre-se" →
 * "Entre"). CONFIRME/ajuste em homologação — pode ser um `/login` direto.
 */
export async function acessarSso(page: Page): Promise<void> {
  if (SSO_REALM.test(page.url())) return;
  await page.getByRole('button', { name: /entre.*cadastre/i }).first().click().catch(() => {});
  await page.getByRole('button', { name: 'Entre', exact: true }).first().click().catch(() => {});
  await page.waitForURL(SSO_REALM, { timeout: 30_000 });
}

/** Preenche usuário/senha e envia (não trata 2FA). */
export async function preencherCredenciais(page: Page, creds: Credenciais): Promise<void> {
  await page.locator('input[name="username"]').fill(creds.usuario);
  await page.locator('input[name="password"]').fill(creds.senha);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
}

/** Marco da etapa de verificação em duas etapas (2FA), quando existir. */
export function estaEm2FA(page: Page): Promise<boolean> {
  return page
    .getByRole('heading', { name: /Autentica[çc][ãa]o de usu[áa]rio/i })
    .isVisible()
    .catch(() => false);
}

/**
 * Login automatizado ponta-a-ponta (para ambientes SEM 2FA, ex.: homolog).
 * Se encontrar 2FA sem OTP configurado, lança erro orientando o modo interativo.
 *
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
    // ⚠️ Seletor do campo de OTP ainda NÃO confirmado — ajuste em homolog.
    await page.getByRole('textbox').first().fill(creds.otp);
    await page.getByRole('button', { name: /continuar|confirmar|validar/i }).first().click();
  }

  // Login concluído quando sai do domínio do SSO (realm).
  await page.waitForURL((url) => !SSO_REALM.test(url.href), { timeout: 60_000 });
}
