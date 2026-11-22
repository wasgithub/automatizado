/**
 * Teste LOCAL da fábrica de estratégia de autenticação (sem o sistema).
 * Valida que `AUTH_STRATEGY` seleciona a estratégia certa (keycloak/form/none).
 */
import { test, expect } from '@playwright/test';
import { getAuthStrategy } from '../../src/auth';

test.describe('Auth strategy (plugável) @local', () => {
  test('seleciona a estratégia por AUTH_STRATEGY', () => {
    process.env.AUTH_STRATEGY = 'keycloak';
    expect(getAuthStrategy().nome).toBe('keycloak');

    process.env.AUTH_STRATEGY = 'form';
    expect(getAuthStrategy().nome).toBe('form');

    process.env.AUTH_STRATEGY = 'none';
    expect(getAuthStrategy().nome).toBe('none');

    delete process.env.AUTH_STRATEGY; // default
    expect(getAuthStrategy().nome).toBe('keycloak');
  });
});
