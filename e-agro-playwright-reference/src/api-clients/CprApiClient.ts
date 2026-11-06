/**
 * Cliente de API do domínio CPR/crédito — BFF GraphQL do e-Agro.
 *
 * Operação e tipos CONFIRMADOS por captura read-only (ver docs/API_CONTRACTS.md).
 * A query `GetCredit` é a real, capturada do frontend (não inventada).
 *
 * Uso previsto: preparação/consulta de estado em testes, NÃO como substituto
 * de asserts de UI. Trate a resposta como PII (dados financeiros).
 */
import { BaseApiClient } from './BaseApiClient';

/** Formato de `data` de GetCredit (tipos mapeados; valores são do cliente). */
export interface GetCreditData {
  readonly me: {
    readonly creditType: string | null;
    readonly creditStoreName: string | null;
    readonly creditLimit: string | null;
    readonly creditAssurance: string | null;
    readonly creditStore: string | null;
    readonly hasCredit: boolean;
    readonly correntista: boolean;
    readonly __typename: string;
  };
}

const GET_CREDIT_QUERY = `query GetCredit {
  me {
    creditType
    creditStoreName
    creditLimit
    creditAssurance
    creditStore
    hasCredit
    correntista
    __typename
  }
}`;

export class CprApiClient extends BaseApiClient {
  /** Consulta o estado de crédito do usuário autenticado (read-only). */
  async getCredit(): Promise<GetCreditData> {
    return this.graphql<GetCreditData>('GetCredit', GET_CREDIT_QUERY);
  }
}
