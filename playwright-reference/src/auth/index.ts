/**
 * Seleção da estratégia de autenticação por ambiente (`AUTH_STRATEGY`):
 *   keycloak (default) | form | none
 *
 * O setup e o fluxo de login usam `getAuthStrategy().login(page, creds)` —
 * trocar de sistema é só trocar a env, sem mexer em código.
 */
import { optionalEnv } from '../config/env';
import type { AuthStrategy } from './types';
import { KeycloakAuth } from './strategies/keycloak';
import { FormAuth } from './strategies/form';
import { NoAuth } from './strategies/none';

export type { AuthStrategy } from './types';

export function getAuthStrategy(): AuthStrategy {
  switch (optionalEnv('AUTH_STRATEGY', 'keycloak').trim().toLowerCase()) {
    case 'form':
      return new FormAuth();
    case 'none':
      return new NoAuth();
    case 'keycloak':
    default:
      return new KeycloakAuth();
  }
}
