/**
 * Cliente base para o BFF GraphQL do e-Agro (`POST /graphql`).
 *
 * Usa o `APIRequestContext` do Playwright. O backend é um BFF GraphQL: há um
 * único endpoint e a operação é identificada por `operationName`. Ver
 * docs/API_CONTRACTS.md.
 *
 * Segurança: nunca logar `variables` (podem conter PII como CPF) nem o token.
 */
import type { APIRequestContext } from '@playwright/test';

export interface GraphqlError {
  readonly message: string;
}

export interface GraphqlResponse<T> {
  readonly data?: T;
  readonly errors?: readonly GraphqlError[];
}

export class BaseApiClient {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly bffUrl: string,
  ) {}

  /**
   * Executa uma operação GraphQL. A query é passada pelo chamador (não se
   * inventam queries; capture-as do frontend real — ver scripts/capture-apis.cjs).
   *
   * @throws se a resposta HTTP não for OK ou se o GraphQL retornar `errors`.
   */
  protected async graphql<T>(
    operationName: string,
    query: string,
    variables: Record<string, unknown> = {},
  ): Promise<T> {
    const url = new URL('/graphql', this.bffUrl);
    url.searchParams.set(operationName, ''); // padrão observado (?OpName)

    const response = await this.request.post(url.toString(), {
      data: { operationName, query, variables },
      headers: { 'content-type': 'application/json' },
    });

    if (!response.ok()) {
      throw new Error(`GraphQL ${operationName} HTTP ${response.status()}`);
    }

    const body = (await response.json()) as GraphqlResponse<T>;
    if (body.errors?.length) {
      // Mensagem do GraphQL pode conter PII — não propagar valores de variáveis.
      throw new Error(`GraphQL ${operationName} retornou erros.`);
    }
    if (body.data === undefined) {
      throw new Error(`GraphQL ${operationName} sem data.`);
    }
    return body.data;
  }
}
