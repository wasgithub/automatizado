/**
 * Fixtures tipadas do projeto.
 *
 * Estende o `test` do Playwright com dependências prontas e tipadas:
 * - `runId`: identificador único por teste, para isolamento de massa.
 * - Page Objects instanciados sob demanda (lazy, sem custo se não usados).
 *
 * Importe `test` e `expect` DESTE módulo nos specs, em vez de
 * `@playwright/test`, para ganhar as fixtures automaticamente.
 *
 * Ver docs/TESTING_STANDARDS.md e docs/AUTHENTICATION.md.
 */
import path from 'node:path';
import { test as base, expect } from '@playwright/test';
import { createRunId } from '../utils/run-id';
import { getBffUrl, boolEnv } from '../config/env';
import { CprPage } from '../pages/cpr/CprPage';
import { CprDollarPage } from '../pages/cpr-dollar/CprDollarPage';
import { CprApiClient } from '../api-clients/CprApiClient';
import { EvidenceRecorder, featureFromFile, ctFromTitle } from './evidence';

interface Fixtures {
  /** ID único desta execução de teste; use como prefixo de dados sintéticos. */
  runId: string;
  cprPage: CprPage;
  cprDollarPage: CprDollarPage;
  /** Cliente do BFF GraphQL para o domínio CPR/crédito. */
  cprApi: CprApiClient;
  /** Gravador de evidências passo a passo (EVIDENCE=1). */
  evidencia: EvidenceRecorder;
}

export const test = base.extend<Fixtures>({
  runId: async ({}, use) => {
    await use(createRunId());
  },
  evidencia: async ({ page }, use) => {
    const info = base.info();
    const feature = featureFromFile(info.file);
    const ct = ctFromTitle(info.title);
    const dir = path.join('evidencias', ...feature.split('/'), ct);
    await use(new EvidenceRecorder(page, info, dir, boolEnv('EVIDENCE')));
  },
  cprPage: async ({ page }, use) => {
    await use(new CprPage(page));
  },
  cprDollarPage: async ({ page }, use) => {
    await use(new CprDollarPage(page));
  },
  cprApi: async ({ request }, use) => {
    // `request` herda storageState/baseURL do projeto. Atenção: o BFF exige
    // token Bearer (localStorage) para resposta autenticada — ver
    // docs/API_CONTRACTS.md. Com cookies apenas, a resposta é anônima.
    await use(new CprApiClient(request, getBffUrl()));
  },
});

export { expect };
