/**
 * Estratégia de autenticação: FORMULÁRIO próprio (genérico).
 *
 * Para sistemas com tela de login própria (sem Keycloak). Usa heurística de
 * seletores acessíveis; ajuste os rótulos ao app alvo se necessário. A rota de
 * login é configurável por `LOGIN_PATH` (default `/login`).
 */
import type { Page } from '@playwright/test';
import type { Credenciais } from '../../config/env';
import { optionalEnv } from '../../config/env';
import type { AuthStrategy } from '../types';

export class FormAuth implements AuthStrategy {
  readonly nome = 'form';

  async login(page: Page, creds: Credenciais): Promise<void> {
    const loginPath = optionalEnv('LOGIN_PATH', '/login');
    if (!page.url().includes(loginPath)) {
      await page.goto(loginPath).catch(() => {});
    }

    await page.getByLabel(/usu[áa]rio|e-?mail|login|cpf/i).first().fill(creds.usuario);
    await page.getByLabel(/senha|password/i).first().fill(creds.senha);
    await page.getByRole('button', { name: /entrar|login|acessar|continuar/i }).first().click();

    if (creds.otp) {
      await page.getByLabel(/c[óo]digo|token|otp/i).first().fill(creds.otp).catch(() => {});
      await page.getByRole('button', { name: /confirmar|validar|continuar/i }).first().click().catch(() => {});
    }

    // Sucesso observável: saiu da tela de login.
    await page.waitForURL((url) => !url.href.includes(loginPath), { timeout: 60_000 }).catch(() => {});
  }
}
