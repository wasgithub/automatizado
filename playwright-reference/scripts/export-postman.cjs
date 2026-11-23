/**
 * Gera uma COLEÇÃO POSTMAN (v2.1) a partir do mapa de APIs capturado
 * (`test-results/api-capture.json`, produzido por capture-apis.cjs).
 *
 * Objetivo: documentar as APIs e distribuir ao time um arquivo importável no
 * Postman — sem dependências externas (Collection v2.1 é só JSON).
 *
 * SEGURANÇA / PII:
 * - NÃO inclui valores reais, tokens nem cookies. Variáveis GraphQL viram
 *   PLACEHOLDERS (`"<preencher>"`). A URL base vira a variável `{{baseUrl}}`.
 * - A autenticação fica a cargo de quem importar (configure no Postman).
 *
 * Uso:
 *   node scripts/capture-apis.cjs           # gera test-results/api-capture.json
 *   node scripts/export-postman.cjs [saida] # gera a coleção (default: test-results/postman-collection.json)
 */
const fs = require('node:fs');

const ENTRADA = 'test-results/api-capture.json';
const SAIDA = process.argv[2] || 'test-results/postman-collection.json';

if (!fs.existsSync(ENTRADA)) {
  console.error(`❌ ${ENTRADA} não encontrado. Rode antes: node scripts/capture-apis.cjs`);
  process.exit(1);
}

const { baseUrl, operacoes } = JSON.parse(fs.readFileSync(ENTRADA, 'utf8'));
const host = (() => { try { return new URL(baseUrl).host; } catch { return 'api'; } })();

// Monta o body GraphQL com variáveis como placeholders (nunca valores reais).
function graphqlBody(op) {
  const variables = {};
  for (const nome of op.variableNames || []) variables[nome] = '<preencher>';
  return {
    mode: 'graphql',
    graphql: { query: op.query || `# query ${op.operation} (capturar do app)`, variables: JSON.stringify(variables, null, 2) },
  };
}

function item(op) {
  const isGql = op.tipo === 'graphql';
  const nome = isGql ? op.operation : `${op.method} ${op.path}`;
  const url = isGql
    ? { raw: `{{baseUrl}}/graphql`, host: ['{{baseUrl}}'], path: ['graphql'] }
    : { raw: `{{baseUrl}}${op.path}`, host: ['{{baseUrl}}'], path: op.path.split('/').filter(Boolean) };

  const request = {
    method: isGql ? 'POST' : op.method,
    header: [{ key: 'Content-Type', value: 'application/json' }],
    url,
    description:
      `Status observado: ${op.status}\n` +
      (op.variableNames?.length ? `Variáveis: ${op.variableNames.join(', ')}\n` : '') +
      `Resposta (forma): ${JSON.stringify(op.responseSchema)}`,
  };
  if (isGql) request.body = graphqlBody(op);
  return { name: nome, request, response: [] };
}

// Agrupa em pastas: GraphQL e REST.
const gql = operacoes.filter((o) => o.tipo === 'graphql').map(item);
const rest = operacoes.filter((o) => o.tipo === 'rest').map(item);
const folders = [];
if (gql.length) folders.push({ name: 'GraphQL', item: gql });
if (rest.length) folders.push({ name: 'REST', item: rest });

const collection = {
  info: {
    name: `API ${host}`,
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    description: 'Coleção gerada automaticamente a partir do exploratório (PII-safe). Configure autenticação e a variável baseUrl no Postman.',
  },
  item: folders,
  variable: [{ key: 'baseUrl', value: baseUrl, type: 'string' }],
};

fs.writeFileSync(SAIDA, JSON.stringify(collection, null, 2));
console.log(`✅ Coleção Postman gerada: ${SAIDA}`);
console.log(`   ${gql.length} operações GraphQL · ${rest.length} endpoints REST · baseUrl=${baseUrl}`);
console.log('   Importe no Postman: File → Import. Configure a variável {{baseUrl}} e a autenticação.');
