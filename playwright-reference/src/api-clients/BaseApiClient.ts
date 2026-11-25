/**
 * Cliente base de API — genérico. Suporta REST e GraphQL (BFF), escolha por método.
 *
 * Usa o `APIRequestContext` do Playwright (reaproveita sessão/cookies). Nunca
 * logar `variables`/body (podem conter PII) nem tokens. Ver docs/API_CONTRACTS.md.
 */
import type { APIRequestContext, APIResponse } from '@playwright/test';

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
    protected readonly baseUrl: string,
  ) {}

  protected url(path: string): string {
    return new URL(path, this.baseUrl).toString();
  }

  private async json<T>(response: APIResponse, metodo: string, path: string): Promise<T> {
    if (!response.ok()) {
      throw new Error(`${metodo} ${path} HTTP ${response.status()}`);
    }
    return (await response.json()) as T;
  }

  // ---------- REST ----------

  /** GET JSON. `params` vira query string. */
  protected async getJson<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const response = await this.request.get(this.url(path), params ? { params } : undefined);
    return this.json<T>(response, 'GET', path);
  }

  /** POST JSON. */
  protected async postJson<T>(path: string, data?: unknown): Promise<T> {
    const response = await this.request.post(this.url(path), data !== undefined ? { data } : undefined);
    return this.json<T>(response, 'POST', path);
  }

  /** PUT JSON. */
  protected async putJson<T>(path: string, data?: unknown): Promise<T> {
    const response = await this.request.put(this.url(path), data !== undefined ? { data } : undefined);
    return this.json<T>(response, 'PUT', path);
  }

  /** DELETE; retorna status OK (lança em não-OK). */
  protected async deleteOk(path: string): Promise<void> {
    const response = await this.request.delete(this.url(path));
    if (!response.ok()) throw new Error(`DELETE ${path} HTTP ${response.status()}`);
  }

  // ---------- GraphQL (BFF) ----------

  /**
   * Executa uma operação GraphQL em `${baseUrl}/graphql`. A query é passada pelo
   * chamador (não se inventam queries — capture do app real).
   * @throws se HTTP não-OK ou se o GraphQL retornar `errors`.
   */
  protected async graphql<T>(
    operationName: string,
    query: string,
    variables: Record<string, unknown> = {},
  ): Promise<T> {
    const url = new URL('/graphql', this.baseUrl);
    url.searchParams.set(operationName, '');

    const response = await this.request.post(url.toString(), {
      data: { operationName, query, variables },
      headers: { 'content-type': 'application/json' },
    });

    if (!response.ok()) throw new Error(`GraphQL ${operationName} HTTP ${response.status()}`);
    const body = (await response.json()) as GraphqlResponse<T>;
    if (body.errors?.length) throw new Error(`GraphQL ${operationName} retornou erros.`);
    if (body.data === undefined) throw new Error(`GraphQL ${operationName} sem data.`);
    return body.data;
  }
}
