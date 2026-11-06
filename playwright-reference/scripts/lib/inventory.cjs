/**
 * Inventário COMPLETO de pontos interativos de uma tela — executado no
 * navegador. Captura botões, inputs, SELECTS (com opções), COMBOS, radios,
 * checkboxes, links e tabs, para o exploratório não "deixar nada para trás".
 *
 * PII-safe: nomes/rótulos/opções e tipos; nunca valores digitados nem tokens.
 * (Opções de select/combo podem conter dados de referência — use em homolog.)
 *
 * `inventarioNoNavegador` é uma função pura passada a `page.evaluate(...)`.
 */
function inventarioNoNavegador() {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const txt = (el) =>
    (el.getAttribute('aria-label') || el.textContent || el.getAttribute('placeholder') || '')
      .trim().replace(/\s+/g, ' ').slice(0, 60);
  const uniq = (a) => [...new Set(a)];
  const labelDe = (el) =>
    el.labels && el.labels[0] ? el.labels[0].textContent.trim().slice(0, 50) : el.getAttribute('aria-label');

  return {
    titulos: uniq([...document.querySelectorAll('h1,h2,h3,[role=heading]')].map(txt).filter(Boolean)).slice(0, 20),
    links: uniq([...document.querySelectorAll('a[href]')].filter(vis).map((a) => a.getAttribute('href'))).slice(0, 60),
    botoes: [...document.querySelectorAll('button,[role=button],input[type=submit],input[type=button]')]
      .filter(vis)
      .map((b) => ({ nome: txt(b), desabilitado: b.disabled === true || b.getAttribute('aria-disabled') === 'true' })),
    inputs: [...document.querySelectorAll('input:not([type=submit]):not([type=button]):not([type=radio]):not([type=checkbox]),textarea')]
      .filter(vis)
      .map((el) => ({
        tag: el.tagName.toLowerCase(), type: el.getAttribute('type'), name: el.getAttribute('name'),
        id: el.id || null, label: labelDe(el), placeholder: el.getAttribute('placeholder'),
        obrigatorio: el.required === true, desabilitado: el.disabled === true,
      })),
    selects: [...document.querySelectorAll('select')].filter(vis).map((el) => ({
      name: el.getAttribute('name'), id: el.id || null, label: labelDe(el),
      opcoes: [...el.options].map((o) => o.textContent.trim()).slice(0, 30),
    })),
    combos: [...document.querySelectorAll('[role=combobox],[role=listbox]')].filter(vis)
      .map((el) => ({ nome: txt(el), role: el.getAttribute('role') })),
    radiosCheckboxes: [...document.querySelectorAll('input[type=radio],input[type=checkbox],[role=radio],[role=checkbox]')]
      .filter(vis)
      .map((el) => ({
        tipo: el.getAttribute('type') || el.getAttribute('role'), name: el.getAttribute('name'),
        label: labelDe(el), marcado: el.checked === true || el.getAttribute('aria-checked') === 'true',
      })),
    tabs: uniq([...document.querySelectorAll('[role=tab]')].filter(vis).map(txt).filter(Boolean)),
  };
}

module.exports = { inventarioNoNavegador };
