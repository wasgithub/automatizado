/**
 * Validação de CONTRATO de resposta de API — sem libs externas.
 *
 * Garante que o retorno da API bate com o esquema MAPEADO no exploratório
 * (`docs/API_CONTRACTS.md`), em vez de assumir/inventar campos. Use nos testes:
 *
 *   const div = divergenciasDeContrato(data, CONTRATO_GET_CREDIT);
 *   expect(div).toEqual([]);
 *
 * Tipos aceitos no esquema:
 *  - string de tipo(s) separada por '|': 'string', 'number', 'boolean',
 *    'object', 'null', 'array' — ex.: 'boolean|null'
 *  - array `['array', <esquemaDoItem>]` (valida o 1º item)
 *  - objeto aninhado `{ chave: <esquema> }`
 */
export type Contrato = string | readonly Contrato[] | { readonly [k: string]: Contrato };

function tipoDe(valor: unknown): string {
  if (valor === null) return 'null';
  if (Array.isArray(valor)) return 'array';
  return typeof valor;
}

/** Retorna a lista de divergências (vazia = contrato respeitado). */
export function divergenciasDeContrato(
  valor: unknown,
  esperado: Contrato,
  caminho = '',
): string[] {
  const onde = caminho || '(raiz)';

  if (typeof esperado === 'string') {
    const permitido = esperado.split('|').map((t) => t.trim());
    const t = tipoDe(valor);
    return permitido.includes(t) ? [] : [`${onde}: esperado ${esperado}, recebido ${t}`];
  }

  if (Array.isArray(esperado)) {
    if (!Array.isArray(valor)) return [`${onde}: esperado array, recebido ${tipoDe(valor)}`];
    const itemSchema = esperado[1];
    if (valor.length === 0 || itemSchema === undefined) return [];
    return divergenciasDeContrato(valor[0], itemSchema, `${caminho}[0]`);
  }

  if (tipoDe(valor) !== 'object') return [`${onde}: esperado objeto, recebido ${tipoDe(valor)}`];
  const obj = valor as Record<string, unknown>;
  const out: string[] = [];
  for (const chave of Object.keys(esperado)) {
    out.push(
      ...divergenciasDeContrato(obj[chave], (esperado as Record<string, Contrato>)[chave], caminho ? `${caminho}.${chave}` : chave),
    );
  }
  return out;
}
