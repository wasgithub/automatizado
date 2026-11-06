/**
 * Flag de "baseline de produção".
 *
 * Alguns specs de EXEMPLO foram baseados no mapeamento feito em PRODUÇÃO (rotas,
 * títulos e contratos específicos). Eles servem de TEMPLATE e só executam quando
 * `APP_ENV=prod`. No ambiente alvo (homolog), recrie-os com os dados reais do
 * ambiente — ver docs/ONBOARDING_HOMOLOG.md.
 */
import { getAppEnv } from './env';

export const IS_PROD_BASELINE = getAppEnv() === 'prod';
