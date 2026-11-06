/**
 * Setup de autenticação — provisiona a sessão reutilizável (storageState).
 *
 * Dois modos (via AUTH_MODE), para suportar ambientes diferentes:
 *
 * - AUTH_MODE=automated (ex.: HOMOLOGAÇÃO sem 2FA):
 *     faz login headless com EAGRO_USER/EAGRO_PASSWORD (+ EAGRO_OTP se fixo) e
 *     salva a sessão. 100% automatizável — ideal para CI/CD.
 *
 * - AUTH_MODE=interactive (default; ex.: PRODUÇÃO com 2FA):
 *     não tenta logar (evita disparar 2FA). A sessão é criada uma vez por
 *     `npm run auth:login`; aqui apenas validamos que ela existe.
 *
 * A sessão fica em playwright/.auth/user.json (ignorado pelo Git).
 * Ver docs/AUTHENTICATION.md e docs/ONBOARDING_HOMOLOG.md.
 */
import { existsSync } from 'node:fs';
import { test as setup } from '@playwright/test';
import { getAuthMode, getCredenciais } from '../../src/config/env';
import { autenticar } from '../../src/auth/login';

const STORAGE_STATE = 'playwright/.auth/user.json';

setup('provisionar sessão de autenticação', async ({ page }) => {
  if (getAuthMode() === 'interactive') {
    setup.skip(
      !existsSync(STORAGE_STATE),
      `Modo interativo: rode "npm run auth:login" (2FA) para gerar ${STORAGE_STATE}. ` +
        `Em ambientes sem 2FA, use AUTH_MODE=automated. Ver docs/AUTHENTICATION.md.`,
    );
    return; // sessão já existe → reutilizada pelos testes
  }

  // AUTH_MODE=automated — exige credenciais do ambiente.
  const creds = getCredenciais();
  await page.goto('/');
  await autenticar(page, creds);
  await page.context().storageState({ path: STORAGE_STATE });
});
