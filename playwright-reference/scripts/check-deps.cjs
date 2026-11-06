/**
 * Guardrail de DEPENDÊNCIAS (contexto bancário).
 *
 * Falha se houver qualquer dependência fora da allowlist. Toda nova lib exige
 * justificativa + revisão de segurança ANTES de entrar — proíbe libs
 * desconhecidas/mal-procedentes por descuido. Ver docs/GUARDRAILS.md.
 *
 * Sem dependências externas (apenas Node nativo).
 */
const fs = require('node:fs');

// Allowlist mínima e auditável. Só amplie após revisão de segurança formal.
const ALLOW = new Set([
  '@playwright/test', // runner oficial
  'typescript', // tipagem
  '@types/node', // tipos do Node
  'dotenv', // carregar .env
  '@faker-js/faker', // massa sintética — HOMOLOGADA no banco
]);

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const fora = Object.keys(deps).filter((d) => !ALLOW.has(d));

if (fora.length) {
  console.error('❌ Dependências FORA da allowlist:', fora.join(', '));
  console.error(
    'Toda nova dependência exige justificativa + revisão de segurança. ' +
      'Se aprovada, adicione em scripts/check-deps.cjs e docs/GUARDRAILS.md.',
  );
  process.exit(1);
}

// Reforça reprodutibilidade: lockfile presente.
if (!fs.existsSync('package-lock.json')) {
  console.error('❌ package-lock.json ausente — use `npm install` e versione o lockfile.');
  process.exit(1);
}

console.log('✅ Dependências dentro da allowlist:', [...ALLOW].join(', '));
