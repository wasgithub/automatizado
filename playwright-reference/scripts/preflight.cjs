/**
 * Preflight / doctor — verifica se o ambiente está pronto para EXPLORAR o sistema.
 * Diz exatamente o que falta (config, sessão, rede, browser). Dependency-free.
 *
 * Uso: npm run doctor
 */
require('dotenv').config();
const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');

const linhas = [];
let faltas = 0;
const ok = (m) => linhas.push('  ✅ ' + m);
const warn = (m) => linhas.push('  ⚠️  ' + m);
const bad = (m) => { linhas.push('  ❌ ' + m); faltas += 1; };

function validUrl(v) { try { new URL(v); return true; } catch { return false; } }

// HEAD/GET à BASE_URL para medir alcance de rede (timeout curto).
function alcanca(url) {
  return new Promise((resolve) => {
    let done = false;
    const fim = (r) => { if (!done) { done = true; resolve(r); } };
    try {
      const u = new URL(url);
      const lib = u.protocol === 'https:' ? https : http;
      const req = lib.request(url, { method: 'GET', timeout: 8000 }, (res) => {
        fim({ alcancou: true, status: res.statusCode });
        res.destroy();
      });
      req.on('timeout', () => { req.destroy(); fim({ alcancou: false, erro: 'timeout (8s)' }); });
      req.on('error', (e) => fim({ alcancou: false, erro: e.code || e.message }));
      req.end();
    } catch (e) { fim({ alcancou: false, erro: e.message }); }
  });
}

(async () => {
  console.log('\n🔎 Preflight — prontidão para explorar o sistema\n');

  // 1) .env
  console.log('1) Configuração (.env)');
  if (!fs.existsSync('.env')) bad('.env ausente — rode: cp .env.example .env e preencha');
  else ok('.env presente');

  const base = process.env.BASE_URL;
  const bff = process.env.BFF_URL;
  if (!base) bad('BASE_URL ausente');
  else if (!validUrl(base)) bad(`BASE_URL inválida: ${base}`);
  else if (/exemplo\.test/.test(base)) warn(`BASE_URL ainda é placeholder (${base}) — troque pela URL do ambiente`);
  else ok(`BASE_URL = ${base}`);
  if (!bff) warn('BFF_URL ausente (necessária só se for usar API client/captura de APIs)');
  else if (validUrl(bff)) ok(`BFF_URL = ${bff}`);

  // 2) Autenticação
  console.log('\n2) Autenticação');
  const strategy = (process.env.AUTH_STRATEGY || 'keycloak').toLowerCase();
  const mode = (process.env.AUTH_MODE || 'interactive').toLowerCase();
  ok(`AUTH_STRATEGY = ${strategy} · AUTH_MODE = ${mode}`);
  if (strategy !== 'none') {
    if (!process.env.EAGRO_USER) bad('EAGRO_USER ausente (conta de teste)');
    else ok('EAGRO_USER definido');
    if (!process.env.EAGRO_PASSWORD) bad('EAGRO_PASSWORD ausente');
    else ok('EAGRO_PASSWORD definido (não exibido)');
    const temSessao = fs.existsSync('playwright/.auth/user.json');
    if (temSessao) ok('Sessão salva (playwright/.auth/user.json) — áreas autenticadas OK');
    else warn('Sem sessão salva: para áreas autenticadas rode "npm run auth:login" (2FA) ou use AUTH_MODE=automated');
  } else {
    ok('Estratégia "none" — app público, sem login');
  }

  // 3) Browser
  console.log('\n3) Navegador');
  try {
    const { chromium } = require('@playwright/test');
    const exe = chromium.executablePath();
    if (exe && fs.existsSync(exe)) ok('Chromium instalado');
    else bad('Chromium não instalado — rode: npx playwright install chromium');
  } catch { bad('@playwright/test não instalado — rode: npm install'); }

  // 4) Rede (alcança o ambiente?)
  console.log('\n4) Rede');
  if (base && validUrl(base) && !/exemplo\.test/.test(base)) {
    const r = await alcanca(base);
    if (r.alcancou) ok(`Alcançou ${base} (HTTP ${r.status})`);
    else bad(`NÃO alcançou ${base} — ${r.erro}. (VPN do banco? host interno? firewall?)`);
  } else {
    warn('Pulo o teste de rede enquanto BASE_URL for placeholder/ausente');
  }

  console.log('\n' + linhas.join('\n'));
  console.log('\n' + (faltas === 0
    ? '✅ Pronto para explorar. Próximo: npm run explore -- /<rota> 1'
    : `❌ ${faltas} item(ns) a resolver antes de explorar (ver acima).`) + '\n');
  process.exit(faltas === 0 ? 0 : 1);
})();
