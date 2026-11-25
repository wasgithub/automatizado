/**
 * Registro tipado de SISTEMAS (multi-URL) para os testes.
 *
 * Um fluxo pode atravessar vários sistemas (ex.: e-agro → servicenow → e-agro),
 * cada um com sua URL e, opcionalmente, BFF e estratégia de login. Fonte:
 * `systems.config.json` (ignorado pelo Git); fallback deriva de BASE_URL/BFF_URL.
 */
import { existsSync, readFileSync } from 'node:fs';
import { optionalEnv } from './env';

export interface SystemConfig {
  readonly baseUrl: string;
  readonly bffUrl?: string;
  readonly authStrategy?: 'keycloak' | 'form' | 'none';
}

interface SystemsFile {
  readonly defaultSystem?: string;
  readonly systems: Record<string, SystemConfig>;
}

function load(): SystemsFile {
  if (existsSync('systems.config.json')) {
    return JSON.parse(readFileSync('systems.config.json', 'utf8')) as SystemsFile;
  }
  const baseUrl = process.env.BASE_URL;
  const bffUrl = process.env.BFF_URL;
  return {
    defaultSystem: 'default',
    systems: baseUrl ? { default: { baseUrl, bffUrl } } : {},
  };
}

/** Configuração de um sistema pelo nome. Lança se não existir. */
export function getSystem(nome?: string): SystemConfig {
  const reg = load();
  const alvo = nome ?? reg.defaultSystem ?? optionalEnv('DEFAULT_SYSTEM', 'default');
  const cfg = reg.systems[alvo];
  if (!cfg) {
    throw new Error(
      `Sistema "${alvo}" não configurado. Defina em systems.config.json (ou BASE_URL no .env).`,
    );
  }
  return cfg;
}

/** Nomes de todos os sistemas registrados. */
export function listSystems(): string[] {
  return Object.keys(load().systems);
}
