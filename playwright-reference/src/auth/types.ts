/**
 * Contrato de ESTRATÉGIA de autenticação (plugável).
 *
 * Permite o framework servir qualquer sistema só trocando a estratégia por env
 * (`AUTH_STRATEGY`): Keycloak (SSO), formulário próprio, ou nenhuma (app público).
 */
import type { Page } from '@playwright/test';
import type { Credenciais } from '../config/env';

export interface AuthStrategy {
  /** Nome da estratégia (para logs/seleção). */
  readonly nome: string;
  /** Autentica a página; ao final, a sessão deve estar válida. */
  login(page: Page, creds: Credenciais): Promise<void>;
}
