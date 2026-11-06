/**
 * Gravação de EVIDÊNCIAS passo a passo (sucesso) em pasta local.
 *
 * Cada chamada `evidencia.passo('...')` tira um print numerado e descrito,
 * salvo em `evidencias/<feature>/<CT>/NN-descricao.png` e anexado ao relatório
 * HTML. Controlado por `EVIDENCE=1` (desligado por padrão para não pesar).
 *
 * O caminho inclui o NOME DA FEATURE (derivado do caminho do spec) e o CT
 * (derivado da tag `@CT-...` do título). Ver docs/TESTING_STANDARDS.md.
 *
 * ⚠️ PII: prints de telas autenticadas contêm dados — a pasta `evidencias/`
 * é ignorada pelo Git e tratada como artefato.
 */
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import type { Page, TestInfo } from '@playwright/test';

function slug(valor: string): string {
  return (
    valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 40) || 'passo'
  );
}

/** Deriva o nome da feature a partir do caminho do spec (domínio/feature). */
export function featureFromFile(file: string): string {
  const m = file.replace(/\\/g, '/').match(/tests\/(.+)\.spec\.ts$/);
  const rel = m ? m[1] : path.basename(file);
  const dir = path.dirname(rel);
  return dir === '.' ? rel : dir;
}

/** Extrai o CT da tag `@CT-...` do título; cai para um slug do título. */
export function ctFromTitle(title: string): string {
  const m = title.match(/@(CT-[\w.\-]+)/i);
  return m ? m[1] : slug(title);
}

export class EvidenceRecorder {
  private seq = 0;

  constructor(
    private readonly page: Page,
    private readonly info: TestInfo,
    private readonly dir: string,
    private readonly enabled: boolean,
  ) {}

  /** Caminho da pasta de evidências deste CT. */
  get pasta(): string {
    return this.dir;
  }

  /** Captura um print de passo (numerado + descrito) e anexa ao relatório. */
  async passo(descricao: string): Promise<void> {
    if (!this.enabled) return;
    this.seq += 1;
    const nome = `${String(this.seq).padStart(2, '0')}-${slug(descricao)}.png`;
    const caminho = path.join(this.dir, nome);
    mkdirSync(this.dir, { recursive: true });
    await this.page.screenshot({ path: caminho, fullPage: true });
    await this.info.attach(nome, { path: caminho, contentType: 'image/png' });
  }
}
