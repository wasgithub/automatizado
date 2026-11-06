/**
 * Acesso tipado e centralizado às variáveis de ambiente (multi-ambiente).
 *
 * Nenhuma credencial/URL é embutida no código — tudo vem de `.env` (carregado
 * por `dotenv` no `playwright.config.ts`) ou do ambiente de CI/CD. Isso permite
 * apontar o mesmo projeto para homologação, produção ou qualquer ambiente só
 * trocando o `.env`.
 *
 * Regra: validação TARDIA (lazy). Variáveis obrigatórias só são exigidas quando
 * realmente usadas, para que `typecheck` e `test:list` funcionem sem `.env`.
 */

/** Lê uma variável obrigatória; lança erro descritivo se ausente ou vazia. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${name}. ` +
        `Copie .env.example para .env e preencha o valor do ambiente alvo.`,
    );
  }
  return value;
}

/** Lê uma variável opcional com valor padrão. */
export function optionalEnv(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value.trim() === '' ? fallback : value;
}

/** Lê um booleano de ambiente (`'1'`, `'true'`, `'yes'`, `'on'` → true). */
export function boolEnv(name: string, fallback = false): boolean {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

/** Indica se a execução está em um pipeline de CI/CD. */
export const isCI = boolEnv('CI', false);

/**
 * Ambiente alvo lógico. Default `homolog` — este projeto é homolog-first.
 * Use `prod` apenas para os specs de exemplo baseados no mapeamento de produção.
 */
export type AppEnv = 'homolog' | 'prod' | (string & {});
export const getAppEnv = (): AppEnv => optionalEnv('APP_ENV', 'homolog');

/**
 * Modo de autenticação:
 * - `interactive` (default): login manual uma vez (2FA) → `npm run auth:login`.
 * - `automated`: login headless com usuário/senha (+ OTP fixo se houver), para
 *   ambientes SEM 2FA (ex.: homologação). Ver tests/setup/auth.setup.ts.
 */
export type AuthMode = 'interactive' | 'automated';
export const getAuthMode = (): AuthMode =>
  optionalEnv('AUTH_MODE', 'interactive') === 'automated' ? 'automated' : 'interactive';

/** URL base autorizada da aplicação (ambiente alvo). */
export const getBaseUrl = (): string => requireEnv('BASE_URL');

/** URL do BFF GraphQL do ambiente alvo. Ver docs/API_CONTRACTS.md. */
export const getBffUrl = (): string => requireEnv('BFF_URL');

/** Credenciais do ambiente alvo (conta de teste em homolog). */
export interface Credenciais {
  readonly usuario: string;
  readonly senha: string;
  /** Código 2FA fixo, quando o ambiente usa OTP fixo/bypass. Opcional. */
  readonly otp?: string;
}
export const getCredenciais = (): Credenciais => ({
  usuario: requireEnv('EAGRO_USER'),
  senha: requireEnv('EAGRO_PASSWORD'),
  otp: process.env.EAGRO_OTP?.trim() || undefined,
});
