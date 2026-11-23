/**
 * Loader do registro de SISTEMAS (multi-URL) — compartilhado pelos scripts .cjs.
 *
 * Fonte: systems.config.json (ignorado pelo Git). Fallback: deriva um único
 * sistema "default" de BASE_URL/BFF_URL do .env (compatível com uso simples).
 */
const fs = require('node:fs');

function loadSystems() {
  if (fs.existsSync('systems.config.json')) {
    const cfg = JSON.parse(fs.readFileSync('systems.config.json', 'utf8'));
    return { systems: cfg.systems || {}, defaultSystem: cfg.defaultSystem };
  }
  // Fallback single-system a partir do .env.
  const baseUrl = process.env.BASE_URL;
  const bffUrl = process.env.BFF_URL;
  return {
    systems: baseUrl ? { default: { baseUrl, bffUrl } } : {},
    defaultSystem: 'default',
  };
}

/** Resolve o nome do sistema a partir de um hostname (casa base/bff host). */
function systemByHost(hostname, reg = loadSystems()) {
  for (const [nome, s] of Object.entries(reg.systems)) {
    for (const u of [s.baseUrl, s.bffUrl].filter(Boolean)) {
      try {
        if (new URL(u).hostname === hostname) return nome;
      } catch {
        /* ignore */
      }
    }
  }
  // Heurística por domínio-raiz (ex.: sub.e-agro.x e api.e-agro.x → mesmo raiz).
  const raiz = hostname.split('.').slice(-2).join('.');
  for (const [nome, s] of Object.entries(reg.systems)) {
    for (const u of [s.baseUrl, s.bffUrl].filter(Boolean)) {
      try {
        if (new URL(u).hostname.endsWith(raiz)) return nome;
      } catch {
        /* ignore */
      }
    }
  }
  return null;
}

module.exports = { loadSystems, systemByHost };
