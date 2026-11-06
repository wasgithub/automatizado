/**
 * Cliente de API do domínio CPR — TEMPLATE.
 *
 * A query abaixo é um EXEMPLO. Capture a query/operação real no exploratório
 * (`docs/EXPLORATORIO_*.md`) e tipifique a resposta conforme o contrato mapeado.
 * Valide o retorno com `divergenciasDeContrato(...)` (ver contract.ts).
 */
import { BaseApiClient } from './BaseApiClient';

/** Tipos de exemplo — substitua pelos do contrato real mapeado. */
export interface ExemploData {
  readonly me: {
    readonly __typename: string;
  };
}

const EXEMPLO_QUERY = `query Exemplo {
  me {
    __typename
  }
}`;

export class CprApiClient extends BaseApiClient {
  /** Exemplo de consulta GraphQL. Troque pela operação real do ambiente. */
  async exemplo(): Promise<ExemploData> {
    return this.graphql<ExemploData>('Exemplo', EXEMPLO_QUERY);
  }
}
