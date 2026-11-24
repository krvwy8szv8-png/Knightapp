'use strict';
/* Consequências automáticas: lê a trilha do Cenário, mostra o que acontece, cobra o custo para evitar e aplica a Diplomacia. */

const UNIT_WORD = { flood: _T`água`, plague: _T`peste`, elections: _T`marcador inimigo` };
const consEls = (t) => ((CONS_TRACKS[S.scenId] || {})[t] || '').split('|').filter(Boolean);
/* Elementos (índices) desta ativação: n = vezes que a trilha foi usada (já contando esta). */
function consIdx(n) { return n <= 1 ? [0] : [2 * n - 3, 2 * n - 2]; }
const consUsedCount = (n) => (n <= 0 ? 0 : 2 * n - 1);
function consParse(e) {
  const m = e.match(/^(\d+)([gnvo]):(.+)$/);
  if (m) return { cost: { k: m[2] === 'o' ? 'gold' : m[2], n: +m[1] }, eff: m[3] };
  return { eff: e };
}
function effText(eff, scen = S.scenId) {
  const sp = (EFF_SCEN[scen] || {})[eff]; if (sp) return sp;
  const u = UNIT_WORD[scen] || _T`unidade inimiga`;
  const uu = UNIT_WORD[scen] ? u : _T`unidades inimigas`;
  return {
    a1: _T`adicionar 1 ${u} numa área marcada com +`,
    a2: _T`adicionar 2 ${uu} em áreas marcadas com +`,
    a3: _T`adicionar 3 ${uu} em áreas marcadas com +`,
    m1: _T`mover todas as unidades inimigas 1 área em direção ao seu castelo`,
    m2: _T`mover todas as unidades inimigas 2 áreas em direção ao seu castelo`,
    am: _T`adicionar 1 ${u} e depois mover todas as inimigas 1 área`,
    at: _T`ataque inimigo: cada área com inimigos destrói suas unidades e depois recursos (todas ao mesmo tempo)`,
    d: _T`+1 Diplomacia inimiga`,
  }[eff] || eff;
}
const EFF_ICON = { a1: '+', a2: '++', a3: '+++', m1: '→', m2: '⇉', am: '+→', at: '⚔', d: '︾' };

/* Estado da resolução no turno atual. */
function consCur() {
  if (S.phase !== 4 || !S.choice) return null;
  const t = EV[cur().id][S.choice].t; const n = S.tracks[t]; const els = consEls(t);
  if (!els.length) return null;
  if (!S.cons || S.cons.turn !== S.turn) S.cons = { turn: S.turn, t, items: consIdx(n).filter((i) => i < els.length).map((i) => ({ i, e: els[i], st: null })) };
  return S.cons;
}
function consResolve(k, choice) {
  const c = consCur(); const it = c.items[k]; const p = consParse(it.e);
  const possible = k === 0 && c.items.length === 2;
  commit(() => {
    if (choice === 'pay') { S.res[p.cost.k] -= p.cost.n; it.st = 'paid'; log(_T`Consequência evitada: pagou ${p.cost.n} ${RES[p.cost.k].name}`); return; }
    if (p.eff !== 'd' && hasAreas()) { log(_T`Consequência${possible ? _T` (possível)` : ''}: ${effText(p.eff)}`); return; }
    it.st = 'done';
    if (p.eff === 'd') { S.res.dipE = Math.min(5, S.res.dipE + 1); log(_T`Consequência: +1 Diplomacia inimiga`); }
    else log(_T`Consequência${possible ? _T` (possível)` : ''}: ${effText(p.eff)}`);
  });
  if (choice !== 'pay' && p.eff !== 'd') {
    if (hasAreas()) { it.st = null; save(); return consRunStart(k, p.eff); }
    const tool = /^a|am/.test(p.eff) ? 'eu' : p.eff === 'at' ? 'erase' : null;
    if (tool) ui.mapTool = tool;
    ui.assist = p.eff;
  }
}
function consNoOrder() { commit(() => { S.res.dipE = Math.min(5, S.res.dipE + 1); }, _T`Nenhuma unidade inimiga pôde cumprir a ordem: +1 Diplomacia inimiga`); }
function consPending() { const c = consCur(); return c ? c.items.filter((x) => !x.st).length : 0; }

function consBoxHtml() {
  const c = consCur(); if (!c) return '';
  if (!c.items.length) return _T`<p class="muted">Esta trilha já foi toda usada: nada acontece.</p>`;
  const rows = c.items.map((it, k) => {
    const p = consParse(it.e); const possible = k === 0 && c.items.length === 2 && !!p.cost;
    const label = possible ? _T`Possível` : _T`Inevitável`;
    let act = '';
    if (it.st === 'paid') act = _T`<span class="ok">✓ evitada</span>`;
    else if (it.st === 'done') act = `<span class="ok">✓ ${p.eff === 'd' ? _T`aplicada` : _T`feita`}</span>${p.eff !== 'd' ? _T` <button class="btn small" data-cmap>Abrir o mapa</button>` : ''}`;
    else if (p.cost) {
      const can = S.res[p.cost.k] >= p.cost.n;
      act = _T`<button class="btn small ${can ? 'primary' : ''}" data-cons="${k}:pay" ${can ? '' : 'disabled'}>Pagar ${p.cost.n} <img class="ic" src="${RES[p.cost.k].icon}" alt=""> e evitar</button>
        <button class="btn small" data-cons="${k}:take">Não pagar</button>`;
    } else act = `<button class="btn small primary" data-cons="${k}:take">${p.eff === 'd' ? _T`Aplicar` : hasAreas() ? _T`▶ Executar no mapa` : _T`Feito`}</button>`;
    if (!it.st && ui.consRun && ui.consRun.k === k) act = _T`<span class="ok">⏳ em andamento no mapa</span> <button class="btn small primary" data-cgo>Ver no mapa</button>`;
    else if (!it.st && p.cost && hasAreas()) act = act.replace(_T`>Não pagar<`, _T`>Não pagar e executar<`);
    const blocked = (p.eff[0] === 'm' || p.eff === 'am') && !it.st && S.marks.scen.filter((m) => m.t === 'eu').length === 0;
    return `<div class="cons-it ${it.st ? 'res' : ''}"><span class="ce-ic">${EFF_ICON[p.eff] || '?'}</span><div>
      <div class="ce-h">${label}${p.cost ? _T` · custo para evitar: ${p.cost.n} ${RES[p.cost.k].name}` : ''}</div>
      <div>${effText(p.eff)}${p.eff !== 'd' ? _T` <span class="muted small">(no mapa)</span>` : ''}</div>${p.eff !== 'd' && !it.st && hasAreas() ? `<div class="small muted">${consPlanText(p.eff)}</div>` : ''}
      <div class="ce-a">${act}</div>${blocked ? _T`<div class="muted small">Sem inimigos no mapa: o movimento não acontece.</div>` : ''}</div></div>`;
  }).join('');
  return _T`<div class="cons-list">${rows}</div>
    <p class="muted small">Se houver unidades inimigas no mapa e nenhuma puder cumprir a ordem (por exemplo, já estão no fim do caminho): <button class="btn small" data-noorder>+1 Diplomacia inimiga</button></p>`;
}
function bindCons(el) {
  $$('[data-cons]', el).forEach((b) => (b.onclick = () => { const [k, ch] = b.dataset.cons.split(':'); consResolve(+k, ch); }));
  $$('[data-cmap]', el).forEach((b) => (b.onclick = () => { ui.tab = 'scen'; ui.scenView = 'map'; render(); }));
  $$('[data-cgo]', el).forEach((b) => (b.onclick = () => showMapForRun()));
  $$('[data-noorder]', el).forEach((b) => (b.onclick = consNoOrder));
}

/* Faixa automática: X nos elementos já usados e cursor no próximo. Retorna null se o cenário não tem dados. */
function consStripAuto(t) {
  const els = consEls(t); if (!els.length) return null;
  const used = consUsedCount(S.tracks[t]);
  const c = S.cons && S.cons.turn === S.turn && S.cons.t === t ? S.cons : null;
  const now = c ? c.items.map((x) => x.i) : [];
  const xs = els.map((_, k) => consX(S.scenId, k));
  const marks = xs.map((x, k) => {
    if (k >= used) return '';
    const isNow = now.includes(k);
    return `<div class="cs-mk ${isNow ? 'now' : ''}" style="left:${(x / CONS.x1) * 100}%;top:50%">${isNow ? '' : markSvg('x', `cs${t}:${k}`)}</div>`;
  }).join('');
  const nextK = used < els.length ? used : null;
  const nowBox = now.map((k) => `<div class="cs-now" style="left:${(xs[k] / CONS.x1) * 100}%"></div>`).join('');
  const cur = nextK != null ? xs[nextK] / CONS.x1 : null;
  return { marks: marks + nowBox, cur };
}

/* Resumo do que vai acontecer (mostrado antes de executar). */
function consPlanText(eff) {
  try {
    const st = CONS_STEPS[eff] || []; const out = [];
    for (const s of st) {
      if (s[0] === 'add') { const p = enemyAddPlan(s[1], s[2] === 'castle' && S.scenId === 'monster'); out.push(p.areas.length ? _T`entra${p.areas.length > 1 ? 'm' : ''} em: ${p.areas.map((a) => _T`área ` + a).join(', ')}` : _T`nenhuma área disponível (+1 Diplomacia inimiga)`); }
      else if (s[0] === 'move') { const p = enemyMovePlan(s[1]); out.push(p.none ? _T`sem movimento neste cenário` : !S.marks.scen.some((m) => m.t === 'eu') ? _T`sem inimigos no mapa` : p.moves.length ? _T`${p.moves.length} unidade(s) avançam` : _T`ninguém consegue avançar (+1 Diplomacia inimiga)`); }
      else if (s[0] === 'at') { const p = enemyAttackPlan(); out.push(p.length ? _T`ataque em ${p.length} área(s)` : _T`sem inimigos no mapa`); }
    }
    return out.length ? _T`Previsão: ` + out.join(_T` · depois `) + '.' : '';
  } catch { return ''; }
}
