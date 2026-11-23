/**
 * Teste LOCAL do CleanupRegistry (teardown por runId) — sem o sistema.
 * Valida: execução em ordem inversa (LIFO) e que erro de limpeza não lança.
 */
import { test, expect } from '@playwright/test';
import { CleanupRegistry } from '../../src/fixtures/cleanup';

test.describe('CleanupRegistry (teardown por runId) @local', () => {
  test('executa limpezas em ordem inversa (LIFO)', async () => {
    const ordem: string[] = [];
    const reg = new CleanupRegistry('run-x');
    reg.registrar('cliente', async () => { ordem.push('cliente'); });
    reg.registrar('imovel', async () => { ordem.push('imovel'); });
    reg.registrar('pedido', async () => { ordem.push('pedido'); });

    await reg.executar();

    // Criados cliente → imovel → pedido; limpa pedido → imovel → cliente.
    expect(ordem).toEqual(['pedido', 'imovel', 'cliente']);
  });

  test('falha de limpeza não lança (vira aviso) e segue as demais', async () => {
    const limpos: string[] = [];
    const reg = new CleanupRegistry('run-y');
    reg.registrar('a', async () => { limpos.push('a'); });
    reg.registrar('b', async () => { throw new Error('falha simulada'); });
    reg.registrar('c', async () => { limpos.push('c'); });

    await expect(reg.executar()).resolves.toBeUndefined();
    // c (último) e a (primeiro) limparam; b falhou sem interromper.
    expect(limpos).toEqual(['c', 'a']);
  });
});
