import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Carrega .env local (ignorado pelo Git). Em CI/CD, as variáveis vêm do
// ambiente do pipeline — este load é no-op se o arquivo não existir.
dotenv.config();

const isCI = !!process.env.CI;
const headed = ['1', 'true', 'yes', 'on'].includes(
  (process.env.HEADED ?? '').trim().toLowerCase(),
);
const authMode = (process.env.AUTH_MODE ?? '').trim().toLowerCase();

// Sessão autenticada (storageState). É gerada:
// - por `npm run auth:login` (modo interativo / 2FA), ou
// - pelo projeto `setup` (modo automated, ambientes sem 2FA).
const AUTH_FILE = 'playwright/.auth/user.json';
const useStorage = existsSync(AUTH_FILE) || authMode === 'automated';

export default defineConfig({
  testDir: './tests',
  // Isolamento primeiro: 1 worker e sem retries para diagnóstico honesto.
  // Evoluir para paralelismo/sharding só após comprovar isolamento de dados.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: isCI,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL,
    headless: !headed,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    // Testes locais: sem rede, sem autenticação, sem setup. Rodam em qualquer
    // ambiente (inclusive CI) — prova o harness.
    {
      name: 'local',
      testMatch: 'tests/local/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    // Provisiona a sessão (storageState). Ver tests/setup/auth.setup.ts.
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Testes funcionais (área logada). Dependem do setup e reutilizam a sessão.
    {
      name: 'chromium',
      testIgnore: ['tests/local/**', '**/*.setup.ts'],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        ...(useStorage ? { storageState: AUTH_FILE } : {}),
      },
    },
  ],
  outputDir: 'test-results/artifacts',
});
