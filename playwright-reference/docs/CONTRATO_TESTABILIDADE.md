# Contrato de testabilidade (frontend React ↔ automação)

Com o frontend no mesmo workspace, a automação lê os componentes para usar e
propor seletores estáveis — reduzindo flaky e manutenção.

## Como funciona

```bash
# aponte para o src do frontend (ajuste o caminho)
npm run scan:frontend -- ../frontend/src
```

Gera `docs/FRONTEND_SELECTORS.md` com:
- **Seletores prontos**: `data-testid`, `aria-label`, `<label for>` já usáveis.
- **Lacunas**: elementos interativos (button/input/select/textarea) sem gancho
  estável → candidatos a `data-testid`.

A automação usa os **prontos**; as **lacunas** viram proposta ao time React.

## Contrato para o time React (ordem do contrato de seletores)

1. **Role + nome acessível** (preferido): botões com texto claro, inputs com
   `<label htmlFor>` associado. A automação usa `getByRole`/`getByLabel`.
2. **`data-testid`** para elementos ambíguos ou sem rótulo visível
   (ícones, linhas de tabela, itens repetidos, combos).
3. Evitar seletores por CSS estrutural/classe gerada — quebram fácil.

### Convenção de `data-testid`
`<dominio>-<acao-ou-campo>-<tipo>` — ex.: `pedido-confirmar-btn`, `uf-combo`.
Estável (não atrelado a layout/posição). Não é preciso em todo elemento — só
onde role/label não bastam.

## Fluxo de adoção (PR do frontend)

1. Rode `npm run scan:frontend` → veja as lacunas da área que vai automatizar.
2. Abra um PR no frontend adicionando `data-testid` nessas lacunas (ou
   `<label htmlFor>` quando fizer sentido de acessibilidade).
3. A automação passa a usar os ganchos estáveis — sem CSS frágil.

Ver `docs/SELECTOR_CONTRACT.md` (estratégia completa de seletores).
