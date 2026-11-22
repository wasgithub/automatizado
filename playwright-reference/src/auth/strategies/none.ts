/**
 * Estratégia de autenticação: NENHUMA (aplicação pública / sem login).
 */
import type { Page } from '@playwright/test';
import type { Credenciais } from '../../config/env';
import type { AuthStrategy } from '../types';

export class NoAuth implements AuthStrategy {
  readonly nome = 'none';

  async login(_page: Page, _creds: Credenciais): Promise<void> {
    // App público — nada a fazer.
  }
}
