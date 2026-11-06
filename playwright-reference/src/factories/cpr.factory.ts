/**
 * Factory de massa de dados SINTÉTICA para cenários CPR.
 *
 * EXEMPLO DE REFERÊNCIA — os campos abaixo são ilustrativos e NÃO representam o
 * contrato real do sistema. Ajuste quando o formulário/entidade real for mapeado.
 *
 * Usa `@faker-js/faker` (locale pt-BR, lib homologada no banco) para valores
 * realistas. Princípios:
 * - Dados sintéticos — NUNCA dados de clientes reais.
 * - Unicidade/isolamento ancorados no `runId` (campo `referencia`), para filtrar
 *   os próprios registros em ambiente compartilhado. Ver docs/TEST_DATA_STRATEGY.md.
 * - Nunca gerar valores que disparem operação financeira real sem autorização.
 */
import { fakerPT_BR as faker } from '@faker-js/faker';
import { createRunId } from '../utils/run-id';

export interface CprInput {
  /** Identificador lógico único desta massa dentro da execução (âncora de isolamento). */
  readonly referencia: string;
  readonly emitente: string;
  readonly valor: number;
  readonly moeda: 'BRL';
  readonly vencimento: string; // ISO 8601 (YYYY-MM-DD)
}

export interface CprFactoryOptions {
  /** ID de execução para rastreabilidade/isolamento; gerado se omitido. */
  readonly runId?: string;
  /**
   * Semente para reprodutibilidade: com o mesmo `seed`, o faker gera os mesmos
   * valores (útil para depurar um cenário). Omita para dados aleatórios.
   */
  readonly seed?: number;
  /** Sobrescritas pontuais para um cenário específico. */
  readonly overrides?: Partial<CprInput>;
}

/** Gera um CPR sintético. A `referencia` sempre carrega o `runId` (isolamento). */
export function makeCpr(options: CprFactoryOptions = {}): CprInput {
  const runId = options.runId ?? createRunId();
  if (options.seed !== undefined) faker.seed(options.seed);

  const base: CprInput = {
    referencia: `CPR-${runId}`,
    emitente: faker.company.name(),
    valor: faker.number.int({ min: 1_000, max: 500_000 }),
    moeda: 'BRL',
    vencimento: faker.date.future({ years: 5 }).toISOString().slice(0, 10),
  };
  return { ...base, ...options.overrides };
}
