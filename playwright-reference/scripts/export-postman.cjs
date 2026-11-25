/**
 * Gera uma COLEÇÃO POSTMAN (v2.1) a partir do mapa de APIs capturado
 * (`test-results/api-capture.json`), ESTRUTURADA POR SISTEMA.
 *
 * Multi-sistema: cada sistema vira uma pasta, com subpastas GraphQL/REST e sua
 * própria variável de base (`{{baseUrl_<sistema>}}`). Assim um fluxo que
 * atravessa vários sistemas fica navegável e importável no Postman.
 *
 * SEGURANÇA / PII: sem valores reais, tokens ou cookies. Variáveis GraphQL viram
 * placeholders (`"<preencher>"`). Autenticação é configurada por quem importa.
 *
 * Uso: node scripts/export-postman.cjs [saida]
 */
const fs = require('node:fs');
const { loadSystems } = require('./lib/systems.cjs');

const ENTRADA = 'test-results/api-capture.json';
const SAIDA = process.argv[2] || 'test-results/postman-collection.json';

if (!fs.existsSync(ENTRADA)) {
  console.error(`❌ ${ENTRADA} não encontrado. Rode antes: npm run capture:apis`);
  process.exit(1);
}

const { operacoes } = JSON.parse(fs.readFileSync(ENTRADA, 'utf8'));
const reg = loadSystems();
const varBase = (sistema) => `baseUrl_${String(sistema).replace(/[^a-zA-Z0-9]+/g, '_')}`;

function graphqlBody(op) {
  const variables = {};
  for (const nome of op.variableNames || []) variables[nome] = '<preencher>';
  return { mode: 'graphql', graphql: { query: op.query || `# query ${op.operation}`, variables: JSON.stringify(variables, null, 2) } };
}

function item(op) {
  const isGql = op.tipo === 'graphql';
  const bv = `{{${varBase(op.sistema)}}}`;
  const nome = isGql ? op.operation : `${op.method} ${op.path}`;
  const url = isGql
    ? { raw: `${bv}/graphql`, host: [bv], path: ['graphql'] }
    : { raw: `${bv}${op.path}`, host: [bv], path: op.path.split('/').filter(Boolean) };
  const request = {
    method: isGql ? 'POST' : op.method,
    header: [{ key: 'Content-Type', value: 'application/json' }],
    url,
    description:
      `Sistema: ${op.sistema}\nStatus observado: ${op.status}\n` +
      (op.variableNames?.length ? `Variáveis: ${op.variableNames.join(', ')}\n` : '') +
      `Resposta (forma): ${JSON.stringify(op.responseSchema)}`,
  };
  if (isGql) request.body = graphqlBody(op);
  return { name: nome, request, response: [] };
}

// Agrupa por sistema → (GraphQL / REST).
const porSistema = {};
for (const op of operacoes) (porSistema[op.sistema] ||= []).push(op);

const pastasSistema = Object.entries(porSistema).sort().map(([sistema, ops]) => {
  const sub = [];
  const gql = ops.filter((o) => o.tipo === 'graphql').map(item);
  const rest = ops.filter((o) => o.tipo === 'rest').map(item);
  if (gql.length) sub.push({ name: 'GraphQL', item: gql });
  if (rest.length) sub.push({ name: 'REST', item: rest });
  return { name: sistema, item: sub };
});

// Variáveis: uma base por sistema (usa a URL do systems.config se houver).
const variaveis = Object.keys(porSistema).sort().map((sistema) => {
  const cfg = reg.systems[sistema] || {};
  return { key: varBase(sistema), value: cfg.baseUrl || 'https://<preencher>', type: 'string' };
});

const collection = {
  info: {
    name: 'APIs — coleção por sistema',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    description: 'Gerada automaticamente pelo exploratório (PII-safe). Estruturada por sistema. Configure {{baseUrl_<sistema>}} e a autenticação no Postman.',
  },
  item: pastasSistema,
  variable: variaveis,
};

fs.writeFileSync(SAIDA, JSON.stringify(collection, null, 2));
const totalOps = operacoes.length;
console.log(`✅ Coleção Postman atualizada: ${SAIDA}`);
console.log(`   ${pastasSistema.length} sistema(s) · ${totalOps} operação(ões) · importe no Postman (File → Import).`);
