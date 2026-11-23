/**
 * Teardown por teste — limpeza dos dados criados, rastreados por `runId`.
 *
 * Em homologação os testes podem criar dados (cliente/pedido/imóvel). Esta
 * fixture registra uma função de limpeza por recurso criado e as executa ao
 * final do teste, em ordem inversa (last-in-first-out — respeita dependências).
 *
 * Princípios:
 * - Falha de limpeza NÃO derruba o teste (não mascara o resultado): é logada
 *   como aviso, com o `runId`, para rastrear órfãos.
 * - Se não houver API/rota de limpeza, registre mesmo assim com `apenasRegistrar`
 *   para deixar o rastro do que ficou órfão (identificável pelo runId).
 *
 * Ver docs/TEST_DATA_STRATEGY.md.
 */
export interface CleanupEntry {
  readonly descricao: string;
  readonly fn?: () => Promise<void>;
}

export class CleanupRegistry {
  private readonly entries: CleanupEntry[] = [];

  constructor(private readonly runId: string) {}

  /** Registra um recurso criado com sua função de limpeza. */
  registrar(descricao: string, fn: () => Promise<void>): void {
    this.entries.push({ descricao, fn });
  }

  /** Registra um recurso SEM limpeza disponível (só rastreio de órfão). */
  apenasRegistrar(descricao: string): void {
    this.entries.push({ descricao });
  }

  /** Executa as limpezas em ordem inversa. Erros viram avisos (não lançam). */
  async executar(): Promise<void> {
    for (const entry of [...this.entries].reverse()) {
      if (!entry.fn) {
        console.warn(`[cleanup ${this.runId}] ÓRFÃO (sem limpeza): ${entry.descricao}`);
        continue;
      }
      try {
        await entry.fn();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[cleanup ${this.runId}] FALHOU ao limpar "${entry.descricao}": ${msg}`);
      }
    }
  }
}
