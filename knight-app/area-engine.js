'use strict';
/* Áreas do mapa: em que área está cada peça, o que cada área tem e o que dá para contar sozinho. */

const _areaGrid = {};
function areaGrid(id = S.scenId) {
  const A = AREAS[id]; if (!A) return null;
  if (_areaGrid[id]) return _areaGrid[id];
  const g = new Uint8Array(A.gw * A.gh); let i = 0;
  for (const row of A.rle.split('|')) for (const run of row.split(',')) { const [v, n] = run.split('.'); g.fill(+v, i, i + +n); i += +n; }
  return (_areaGrid[id] = g);
}
/* Área (1..n) de um ponto do mapa em coordenadas do mapa (0–1); 0 = fora. */
function areaAtMap(u, v, id = S.scenId) {
  const A = AREAS[id]; const g = areaGrid(id); if (!g || u < 0 || u > 1 || v < 0 || v > 1) return 0;
  return g[Math.min(A.gh - 1, Math.floor(v * A.gh)) * A.gw + Math.min(A.gw - 1, Math.floor(u * A.gw))];
}
function areaOfMark(m) { const [u, v] = cardToMap(m.x, m.y); return areaAtMap(u, v); }
const hasAreas = () => !!AREAS[S.scenId];

/* Símbolos impressos no mapa, com a marca ✕ mais próxima riscando cada um. */
function mapIcons() {
  const A = AREAS[S.scenId]; if (!A) return [];
  const [x0, y0, x1, y1] = mapBox(); const asp = ((y1 - y0) * 0.70705) / (x1 - x0);
  const xs = S.marks.scen.filter((m) => m.t === 'x').map((m) => cardToMap(m.x, m.y));
  return A.ic.map(([k, u, v, a]) => ({ k, u, v, a, cut: xs.some(([p, q]) => Math.hypot(p - u, (q - v) * asp) < 0.03) }));
}
/* Resumo por área: unidades e recursos impressos (riscados ou não). */
function areaStats() {
  const A = AREAS[S.scenId]; if (!A) return [];
  const st = Array.from({ length: A.n + 1 }, (_, i) => ({ id: i, pu: 0, eu: 0, g: 0, n: 0, v: 0, gold: 0, vil: 0, sg: 0, sr: 0, res: 0, cut: 0, gcut: 0 }));
  for (const m of S.marks.scen) { const a = areaOfMark(m); if (!a) continue; if (m.t === 'pu') st[a].pu++; else if (m.t === 'eu') st[a].eu++; }
  for (const i of mapIcons()) {
    const a = st[i.a]; if (!a) continue; const k = i.k === 'o' ? 'gold' : i.k;
    if (['g', 'n', 'v', 'gold'].includes(k)) { a.res++; if (i.cut) { a.cut++; if (k === 'gold') a.gcut++; continue; } }
    a[k]++;
  }
  return st;
}
/* Contadores calculados pelo mapa. */
const AUTO_CNT = {
  held: (a) => a.pu > 0 && a.eu === 0,
  occ: (a) => a.pu > 0,
  advP: (a) => a.pu > a.eu,
  advE: (a) => a.eu > a.pu,
  razed: (a) => a.res > 0 && a.cut === a.res,
};
const isAutoCnt = (k) => hasAreas() && (!!AUTO_CNT[k] || k === 'coins');
function autoCnt(k) {
  const st = areaStats().filter((a) => a.id);
  if (k === 'coins') return st.reduce((s, a) => s + a.gcut, 0);
  return st.filter((a) => AUTO_CNT[k](a)).length;
}

/* Recursos (não riscados) das áreas onde você tem unidades, para Coletar. */
function collectFromAreas() {
  const pick = { g: 0, n: 0, v: 0, gold: 0 }; let areas = 0;
  for (const a of areaStats()) if (a.id && a.pu) { for (const k of Object.keys(pick)) pick[k] += a[k]; if (a.g + a.n + a.v + a.gold) areas++; }
  return { pick, areas };
}
/* Áreas acima do limite por área. */
function areaOver() {
  const sc = SC[S.scenId]; const out = [];
  for (const a of areaStats()) if (a.id) {
    if (a.pu > sc.lim[2]) out.push({ a, who: 'pu', lim: sc.lim[2] });
    if (a.eu > sc.lim[3]) out.push({ a, who: 'eu', lim: sc.lim[3] });
  }
  return out;
}
/* Selos sobre o mapa: ✓ área controlada/vantagem, ⚠ limite estourado. */
function areaBadgesHtml() {
  const A = AREAS[S.scenId]; if (!A) return '';
  const keys = cntKeys().map((o) => o.k).filter((k) => AUTO_CNT[k]);
  const over = new Set(areaOver().map((o) => o.a.id));
  return areaStats().filter((a) => a.id && (a.pu || a.eu)).map((a) => {
    const [u, v] = A.c[a.id - 1]; const bad = over.has(a.id);
    const good = keys.some((k) => (k === 'advE' ? false : AUTO_CNT[k](a)));
    const enemyAdv = keys.includes('advE') && AUTO_CNT.advE(a);
    const cls = bad ? 'bad' : enemyAdv ? 'enemy' : good ? 'good' : '';
    return _T`<div class="abadge ${cls}" style="left:${u * 100}%;top:${v * 100}%" title="Área ${a.id}">${bad ? '⚠ ' : good ? '✓ ' : ''}<i class="u pu"></i>${a.pu} <i class="u eu"></i>${a.eu}</div>`;
  }).join('');
}
/* Anéis nos escudos verdes quando a ferramenta é "Sua unidade". */
function shieldRingsHtml() {
  const A = AREAS[S.scenId]; if (!A || ui.mapTool !== 'pu') return '';
  return A.ic.filter(([k]) => k === 'sg').map(([, u, v]) => `<div class="sgring" style="left:${u * 100}%;top:${v * 100}%"></div>`).join('');
}
function areaOverHtml() {
  return areaOver().map((o) => _T`<div class="warn">⚠ Uma área tem ${o.who === 'pu' ? o.a.pu + _T` unidades suas` : o.a.eu + _T` inimigas`}; o limite é ${o.lim} por área.</div>`).join('');
}

/* =================== Mapa assistido: vizinhança, movimento e ataques =================== */
const _graph = {};
/* Vizinhança. kind 'pu' = suas unidades (setas de travessia só no sentido indicado);
   kind 'eu' = inimigos (cruzam o rio livremente onde o cartão não restringe). */
function areaGraph(kind = 'pu', id = S.scenId) {
  const key = id + ':' + kind; if (_graph[key]) return _graph[key];
  const A = AREAS[id]; const g = Array.from({ length: A.n + 1 }, () => []);
  const add = (a, b) => { if (a && b && !g[a].includes(b)) g[a].push(b); };
  for (const [a, b] of A.adj) { add(a, b); add(b, a); }
  for (const [a, b] of A.darr || []) { add(a, b); if (kind === 'eu') add(b, a); }
  if (kind === 'eu') for (const [a, b] of A.radj || []) { add(a, b); add(b, a); }
  return (_graph[key] = g);
}
/* Unidade presa: área com inimigo (Cerco ao Velho Castelo sempre; Fortaleza no modo avançado). */
function stuckRule() { return S.scenId === 'oldcastle' || (S.scenId === 'stronghold' && S.advanced); }
function isStuck(i) {
  if (!hasAreas() || !stuckRule()) return false;
  const m = S.marks.scen[i]; if (!m || m.t !== 'pu') return false;
  const a = areaOfMark(m); return !!a && S.marks.scen.some((o) => o.t === 'eu' && areaOfMark(o) === a);
}
const stuckMsg = () => S.scenId === 'oldcastle' ? _T`Esta unidade está numa área com guardas: só sai depois de derrotar todos os inimigos dela.` : _T`Modo avançado: unidades suas numa área ocupada pelo inimigo não podem se mover.`;
const isBlocked = (a) => (AREAS[S.scenId].blk || []).includes(a);
function areaDist(targets, blockedFn) {
  const A = AREAS[S.scenId]; const g = areaGraph('eu'); const d = new Array(A.n + 1).fill(Infinity); const q = [];
  for (const t of targets) { d[t] = 0; q.push(t); }
  while (q.length) { const a = q.shift(); for (const b of g[a]) if (d[b] === Infinity && !(blockedFn && blockedFn(b))) { d[b] = d[a] + 1; q.push(b); } }
  return d;
}
const castleAreas = (kind) => (AREAS[S.scenId].cas || []).filter((c) => c[0] === kind).map((c) => c[3]);
const iconAreas = (k) => mapIcons().filter((i) => i.k === k && !i.cut).map((i) => i.a);
/* Para onde as unidades inimigas andam em cada cenário. */
function moveTargets() {
  const id = S.scenId;
  if (id === 'monster') { const v = [...new Set(iconAreas('vil'))]; return { areas: v, label: _T`à vila intacta mais próxima` }; }
  if (['flood', 'plague', 'elections', 'rebely', 'oldcastle', 'duel'].includes(id)) return null;
  const own = castleAreas('own');
  if (own.length) return { areas: own, label: _T`ao seu castelo` };
  return null;
}
/* Peças por área (índices das marcas). */
function marksByArea(t) {
  const out = {}; S.marks.scen.forEach((m, i) => { if (m.t !== t) return; const a = areaOfMark(m); if (!a) return; (out[a] = out[a] || []).push(i); });
  return out;
}
/* Plano de movimento inimigo (n passos). */
function enemyMovePlan(steps) {
  const T = moveTargets(); if (!T || !T.areas.length) return { none: true };
  const d = areaDist(T.areas, (a) => isBlocked(a));
  const pu = marksByArea('pu'); const stopAtPlayer = S.scenId === 'monster';
  const moves = []; let ties = false;
  S.marks.scen.forEach((m, i) => {
    if (m.t !== 'eu') return; let a = areaOfMark(m); if (!a) return; const from = a;
    for (let s = 0; s < steps; s++) {
      if (d[a] === 0 || d[a] === Infinity) break;
      if (stopAtPlayer && s > 0 && pu[a]) break;
      const nx = areaGraph('eu')[a].filter((b) => d[b] === d[a] - 1);
      if (!nx.length) break; if (nx.length > 1) ties = true;
      a = nx[0];
      if (stopAtPlayer && pu[a]) break;
    }
    if (a !== from) moves.push({ i, from, to: a });
  });
  return { moves, ties, label: T.label };
}
/* Plano de ataque inimigo. */
function enemyAttackPlan() {
  const id = S.scenId; const st = areaStats(); const pu = marksByArea('pu'); const eu = marksByArea('eu');
  const icons = mapIcons(); const own = castleAreas('own'); const res = [];
  for (const a of Object.keys(eu).map(Number)) {
    const str = eu[a].length; const mine = pu[a] || [];
    const left = icons.filter((i) => i.a === a && !i.cut && ['g', 'n', 'v', 'o'].includes(i.k));
    const vil = icons.some((i) => i.a === a && i.k === 'vil' && !i.cut);
    if (id === 'flood' || id === 'plague') {
      if (mine.length) res.push({ a, kill: mine.slice(0, 1), destroy: [], area: false, txt: id === 'flood' ? _T`o trabalhador morre, a área fica seca` : _T`1 unidade sua morre` });
      else {
        const busy = new Set([...Object.keys(eu).map(Number), ...deadAreas()]);
        const spread = areaGraph('eu')[a].find((b) => !busy.has(b) && !isBlocked(b) && !res.some((r) => r.spread === b));
        res.push({ a, kill: [], destroy: [], area: true, vil, units: eu[a], spread, txt: `${id === 'flood' ? _T`a área inunda` : _T`a área é destruída`}${vil ? _T` (com vila)` : ''}${spread ? _T` e ${id === 'flood' ? _T`a água` : _T`a peste`} segue para a área ${spread}` : ''}` });
      }
      continue;
    }
    const kill = mine.slice(0, str); const rest = str - kill.length;
    const destroy = left.slice(0, rest);
    const castle = own.includes(a) && rest > 0;
    const parts = []; if (kill.length) parts.push(_T`${kill.length} unidade(s) sua(s)`); if (destroy.length) parts.push(_T`${destroy.length} recurso(s) do mapa`);
    if (castle) parts.push(_T`ATACA O CASTELO`);
    res.push({ a, kill, destroy, castle, txt: _T`força ${str}: ${parts.join(' · ') || _T`nada a destruir`}` });
  }
  return res;
}
/* Plano do seu ataque: cada unidade sua elimina 1 inimiga na mesma área. */
function playerAttackPlan() {
  const pu = marksByArea('pu'), eu = marksByArea('eu'); const res = [];
  for (const a of Object.keys(pu).map(Number)) if (eu[a]) res.push({ a, kill: eu[a].slice(0, pu[a].length) });
  return res;
}
/* =================== Vagas padronizadas =================== */
/* Cada área tem vagas fixas (calculadas no mapa): suas unidades ocupam as primeiras, as inimigas as seguintes. */
function slotPos(a, k) {
  const A = AREAS[S.scenId]; const sl = (A.sl || [])[a - 1] || [];
  if (k < sl.length) return sl[k];
  const base = sl[0] || A.c[a - 1];
  for (let t = 0; t < 16; t++) {
    const ang = (k + t) * 2.4, r = 0.012 + 0.004 * (k + t);
    const uu = base[0] + Math.cos(ang) * r, vv = base[1] + Math.sin(ang) * r * 1.9;
    if (areaAtMap(uu, vv) === a) return [uu, vv];
  }
  return A.c[a - 1];
}
function spotIn(a, k) { const [u, v] = slotPos(a, k); return mapToCard(u, v); }
function layoutUnits() {
  if (!hasAreas()) return;
  const by = {};
  S.marks.scen.forEach((m, i) => { if (m.t !== 'pu' && m.t !== 'eu') return; const a = areaOfMark(m); if (a) (by[a] = by[a] || []).push(i); });
  for (const [a, idx] of Object.entries(by)) {
    idx.sort((x, y) => (S.marks.scen[x].t === 'pu' ? 0 : 1) - (S.marks.scen[y].t === 'pu' ? 0 : 1) || x - y);
    idx.forEach((i, k) => { const [x, y] = spotIn(+a, k); const m = S.marks.scen[i]; if (m.x !== x || m.y !== y) { m.x = x; m.y = y; } });
  }
}
function pushUnit(t, a) { const [x, y] = mapToCard(...AREAS[S.scenId].c[a - 1]); S.marks.scen.push({ t, x, y }); }
const deadAreas = () => (S.dead || []);
const isDead = (a) => deadAreas().includes(a);

/* =================== Planos =================== */
const ANY_AREA_ADD = ['elections', 'duel', 'rebely'];
/* Onde unidades inimigas novas podem entrar (em ordem de preferência). */
function addCandidates(castle) {
  const id = S.scenId, A = AREAS[id], sc = SC[id];
  const eu = marksByArea('eu'), pu = marksByArea('pu');
  const cnt = (a) => (eu[a] || []).length;
  const all = Array.from({ length: A.n }, (_, i) => i + 1).filter((a) => !isBlocked(a) && !isDead(a));
  const entry = [...new Set(mapIcons().filter((i) => i.k === 'sr').map((i) => i.a))].filter((a) => !isDead(a));
  const perArea = id === 'duel' ? 1 : sc.lim[3];
  let c;
  if (castle) c = castleAreas('enemy');
  else if (ANY_AREA_ADD.includes(id)) {
    const res = (a) => mapIcons().filter((i) => i.a === a && !i.cut && ['g', 'n', 'v', 'o'].includes(i.k)).length;
    const score = (a) => ((pu[a] || []).length ? 100 : 0) + res(a) * 10 - a * 0.01;
    c = all.filter((a) => !cnt(a)).sort((x, y) => score(y) - score(x));
    if (id === 'elections') c = c.concat(all.filter((a) => cnt(a) && cnt(a) < perArea).sort((x, y) => cnt(x) - cnt(y)));
  } else if (id === 'flood' || id === 'plague') {
    c = entry.filter((a) => !cnt(a));
    if (!c.length) {
      const src = new Set([...Object.keys(eu).map(Number), ...deadAreas()]);
      c = all.filter((a) => !cnt(a) && areaGraph('eu')[a].some((b) => src.has(b)));
    }
  } else c = entry.slice().sort((x, y) => (cnt(x) ? 1 : 0) - (cnt(y) ? 1 : 0) || cnt(x) - cnt(y) || x - y);
  return { cands: c.filter((a) => cnt(a) < perArea), perArea };
}
function enemyAddPlan(n, castle) {
  const sc = SC[S.scenId]; const { cands, perArea } = addCandidates(castle);
  const eu = marksByArea('eu'); const tmp = {}; let total = S.marks.scen.filter((m) => m.t === 'eu').length;
  const areas = [];
  const one = ['flood', 'plague', 'rebely', 'duel'].includes(S.scenId);
  for (let k = 0; k < n; k++) {
    if (total >= sc.lim[1]) break;
    const pool = cands.filter((a) => ((eu[a] || []).length + (tmp[a] || 0)) < perArea && !(one && tmp[a]));
    const a = pool.find((x) => !tmp[x]) || pool[0]; if (!a) break;
    areas.push(a); tmp[a] = (tmp[a] || 0) + 1; total++;
  }
  return { areas, n, short: n - areas.length, cands, castle: !!castle };
}
/* =================== Aplicar =================== */
function applyEnemyAdd(plan, label) {
  commit(() => {
    for (const a of plan.areas) pushUnit('eu', a);
    if (plan.short && plan.dipOnShort) S.res.dipE = Math.min(5, S.res.dipE + 1);
    layoutUnits();
  }, label || _T`Mapa: entraram ${plan.areas.length} unidade(s) inimiga(s)${plan.short && plan.dipOnShort ? _T` · ordem não cumprida: +1 Diplomacia inimiga` : ''}`);
}
function applyEnemyMoves(plan) {
  commit(() => {
    for (const mv of plan.moves) { const [x, y] = mapToCard(...AREAS[S.scenId].c[mv.to - 1]); Object.assign(S.marks.scen[mv.i], { x, y }); }
    if (plan.dipOnShort) S.res.dipE = Math.min(5, S.res.dipE + 1);
    layoutUnits();
  }, plan.moves.length ? _T`Mapa: ${plan.moves.length} unidade(s) inimiga(s) avançaram rumo ${plan.label}` : _T`Nenhuma unidade inimiga pôde avançar: +1 Diplomacia inimiga`);
}
function applyEnemyAttack(plan) {
  const id = S.scenId; let lost = false;
  commit(() => {
    const kill = new Set(plan.flatMap((p) => p.kill));
    const moveTo = [];
    for (const p of plan) {
      for (const ic of p.destroy || []) { const [x, y] = mapToCard(ic.u, ic.v); S.marks.scen.push({ t: 'x', x, y }); }
      if (p.area) {
        S.dead = S.dead || []; if (!S.dead.includes(p.a)) S.dead.push(p.a);
        for (const ic of mapIcons().filter((i) => i.a === p.a && !i.cut)) { const [x, y] = mapToCard(ic.u, ic.v); S.marks.scen.push({ t: 'x', x, y }); }
        S.counters = S.counters || {};
        if (id === 'flood') { S.counters.flooded = (S.counters.flooded || 0) + 1; if (p.vil) S.counters.villFlood = (S.counters.villFlood || 0) + 1; }
        if (id === 'plague' && p.vil) S.counters.villPlague = (S.counters.villPlague || 0) + 1;
        if (p.spread) moveTo.push(p);
      }
      if (p.castle) lost = true;
    }
    for (const p of moveTo) for (const i of p.units) { const [x, y] = mapToCard(...AREAS[id].c[p.spread - 1]); Object.assign(S.marks.scen[i], { x, y }); }
    for (const p of plan) if (p.area && !p.spread) for (const i of p.units) kill.add(i);
    S.marks.scen = S.marks.scen.filter((_, i) => !kill.has(i));
    layoutUnits();
  }, _T`Mapa: ataque inimigo aplicado`);
  if (lost) wlTrigger('lose', _T`O castelo foi atacado sem defesa suficiente`);
}
function applyPlayerAttack(plan, useCp) {
  const kill = new Set(plan.flatMap((p) => p.kill));
  commit(() => { if (useCp) S.res.cp -= 1; S.marks.scen = S.marks.scen.filter((_, i) => !kill.has(i)); layoutUnits(); }, _T`${useCp ? _T`Comando: Atacar · ` : ''}seu ataque eliminou ${kill.size} unidade(s) inimiga(s)`);
}

/* =================== Execução das consequências no mapa =================== */
const CONS_STEPS = { a1: [['add', 1]], a2: [['add', 2]], a3: [['add', 3]], m1: [['move', 1]], m2: [['move', 2]], am: [['add', 1, 'castle'], ['move', 1]], at: [['at']] };
function consRunStart(k, eff) {
  const steps = (CONS_STEPS[eff] || []).map((s) => (s[0] === 'add' && s[2] === 'castle' && !castleAreas('enemy').length ? ['add', s[1]] : s));
  ui.consRun = { k, eff, steps, i: 0 };
  consRunStep();
}
function consRunStep() {
  const r = ui.consRun; if (!r) return;
  const st = r.steps[r.i]; if (!st) return consRunFinish();
  const eus = S.marks.scen.filter((m) => m.t === 'eu').length;
  if (st[0] === 'add') { const p = enemyAddPlan(st[1], st[2] === 'castle' && S.scenId === 'monster'); p.dipOnShort = p.short > 0; ui.mapPv = { kind: 'add', plan: p, run: true }; }
  else if (st[0] === 'move') {
    const p = enemyMovePlan(st[1]);
    if (p.none || !eus) { ui.mapPv = { kind: 'skip', run: true, txt: p.none ? _T`Neste cenário as unidades inimigas não se movem.` : _T`Não há unidades inimigas no mapa: o movimento não acontece.` }; }
    else { p.dipOnShort = !p.moves.length; ui.mapPv = { kind: 'move', plan: p, moves: p.moves, n: st[1], run: true }; }
  } else if (st[0] === 'at') {
    const p = enemyAttackPlan();
    ui.mapPv = p.length ? { kind: 'at', plan: p, run: true } : { kind: 'skip', run: true, txt: _T`Não há unidades inimigas no mapa: o ataque não acontece.` };
  }
  showMapForRun();
}
function showMapForRun() {
  if (typeof sideMapOn === 'function' && sideMapOn()) { render(); const sm = $('#side-map'); if (sm) sm.scrollTop = 0; return; }
  ui.tab = 'scen'; ui.scenView = 'map'; if (window.innerWidth < 760) ui.mapZoom = 1; render();
  setTimeout(() => { const e = $('#scen-map .as-wrap'); if (e) e.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 60);
}
function consRunApply() {
  const pv = ui.mapPv, r = ui.consRun; ui.mapPv = null;
  if (pv.kind === 'add') applyEnemyAdd(pv.plan);
  else if (pv.kind === 'move') applyEnemyMoves(pv.plan);
  else if (pv.kind === 'at') applyEnemyAttack(pv.plan);
  if (r) { r.i++; consRunStep(); }
}
function consRunFinish(manual) {
  const r = ui.consRun; ui.consRun = null; ui.mapPv = null; ui.assist = null;
  if (!r) return;
  const c = consCur(); if (c && c.items[r.k] && !c.items[r.k].st) commit(() => { c.items[r.k].st = 'done'; }, _T`Consequência ${manual ? _T`feita manualmente` : _T`aplicada no mapa`}: ${effText(r.eff)}`);
  if (!(typeof sideMapOn === 'function' && sideMapOn())) { ui.tab = 'table'; }
  render();
  toast(r.k < 0 ? _T`Penalidade aplicada no mapa.` : manual ? _T`Consequência marcada como feita.` : _T`Consequência aplicada no mapa.`);
}
/* Toque numa área durante a prévia de "adicionar": troca a área escolhida. */
function pvTapArea(a) {
  const pv = ui.mapPv; if (!pv || pv.kind !== 'add' || !a) return false;
  const p = pv.plan; if (!p.cands.includes(a)) { toast(_T`Essa área não recebe unidade inimiga agora. Toque numa área destacada.`); return true; }
  const i = p.areas.indexOf(a);
  if (i >= 0) p.areas.splice(i, 1); else if (p.areas.length < p.n) p.areas.push(a); else { p.areas.shift(); p.areas.push(a); }
  p.short = p.n - p.areas.length; p.dipOnShort = p.short > 0 && !p.cands.some((x) => !p.areas.includes(x));
  return true;
}

/* =================== Painel do assistente =================== */
function assistHtml() {
  if (!hasAreas()) return '';
  const T = moveTargets(); const run = ui.consRun;
  const btn = (k, label, on) => `<button class="btn small" data-assist="${k}" ${on ? '' : 'disabled'}>${label}</button>`;
  const eu = S.marks.scen.some((m) => m.t === 'eu'), pu = S.marks.scen.some((m) => m.t === 'pu');
  const tasks = mapTaskHtml();
  if (tasks && !run) return _T`<div class="assist run"><span class="as-t">🎁 Recompensa no mapa</span>${tasks}${previewHtml()}</div>`;
  if (!eu && !ui.mapPv) return '';
  const head = run ? `<span class="as-t">⚔ ${run.k < 0 ? _T`Penalidade do objetivo` : _T`Consequência`} ${run.steps.length > 1 ? _T`· passo ${run.i + 1}/${run.steps.length}` : ''}</span>` : _T`<span class="as-t">🧭 Assistente</span>`;
  const btns = run ? '' : `${T ? btn('m1', _T`→ Mover inimigos 1`, eu) + btn('m2', _T`⇉ Mover 2`, eu) : ''}${btn('at', _T`⚔ Ataque inimigo`, eu)}${btn('pat', _T`🗡 Seu ataque`, eu && pu)}`;
  return `<div class="assist ${run ? 'run' : ''}">${head}${btns}${previewHtml()}</div>`;
}
function bindAssist(root) {
  const redraw = () => renderMapView(root);
  bindMapTask(root);
  $$('[data-assist]', root).forEach((b) => (b.onclick = () => {
    const k = b.dataset.assist;
    if (k === 'm1' || k === 'm2') {
      const p = enemyMovePlan(k === 'm1' ? 1 : 2);
      if (p.none) return toast(_T`Neste cenário as unidades inimigas não se movem.`);
      if (!p.moves.length) return toast(_T`Nenhuma unidade inimiga consegue avançar: se for uma ordem, vale +1 Diplomacia inimiga.`);
      ui.mapPv = { kind: 'move', plan: p, moves: p.moves, n: k === 'm1' ? 1 : 2 };
    } else if (k === 'at') {
      const p = enemyAttackPlan(); if (!p.length) return toast(_T`Não há unidades inimigas no mapa.`);
      ui.mapPv = { kind: 'at', plan: p };
    } else if (k === 'pat') {
      const p = playerAttackPlan(); if (!p.length) return toast(_T`Nenhuma unidade sua divide área com inimigos.`);
      ui.mapPv = { kind: 'pat', plan: p };
    }
    redraw();
  }));
  const ok = $('[data-pvok]', root), no = $('[data-pvno]', root), man = $('[data-pvman]', root);
  if (no) no.onclick = () => { if (ui.consRun) { ui.consRun = null; } ui.mapPv = null; render(); };
  if (man) man.onclick = () => consRunFinish(true);
  if (ok) ok.onclick = () => {
    const pv = ui.mapPv;
    if (pv.run) { if (pv.kind === 'skip') { ui.mapPv = null; ui.consRun.i++; return consRunStep(); } return consRunApply(); }
    ui.mapPv = null;
    if (pv.kind === 'move') applyEnemyMoves(pv.plan);
    else if (pv.kind === 'at') applyEnemyAttack(pv.plan);
    else if (pv.kind === 'pat') applyPlayerAttack(pv.plan, pv.cmd);
  };
}
function previewHtml() {
  const pv = ui.mapPv; if (!pv) return '';
  const U = UNIT_WORD[S.scenId] || _T`unidade inimiga`;
  let h = '';
  if (pv.kind === 'add') {
    const p = pv.plan;
    h = _T`<b>Entram ${p.n} ${p.n > 1 ? (UNIT_WORD[S.scenId] || _T`unidades inimigas`) : U}</b>${p.castle ? _T` no castelo inimigo` : ''}: ${p.areas.length ? p.areas.map((a) => _T`área <b>${a}</b>`).join(', ') : _T`<b>nenhuma área disponível</b>`}.
      <div class="small">As áreas onde ela${p.n > 1 ? 's' : ''} pode${p.n > 1 ? 'm' : ''} entrar estão em vermelho claro; as escolhidas, em vermelho forte. Toque numa área destacada para trocar.</div>
      ${p.short ? _T`<div class="small bad">${p.short} não ${p.short > 1 ? _T`cabem` : _T`cabe`} no mapa (limites do cartão): a ordem não é cumprida e a Diplomacia inimiga sobe +1.</div>` : ''}`;
  } else if (pv.kind === 'move') h = pv.plan.moves.length ? _T`<b>Mover inimigos ${pv.n} área${pv.n > 1 ? 's' : ''}</b> rumo ${esc(pv.plan.label)}:<ul>${pv.plan.moves.map((m) => _T`<li>área ${m.from} → área ${m.to}</li>`).join('')}</ul>${pv.plan.ties ? _T`<small class="muted">Havia caminhos igualmente curtos; escolhi um. Se preferir outro, arraste a peça depois.</small>` : ''}`
    : _T`<b>Nenhuma unidade inimiga consegue avançar.</b><div class="small bad">A ordem não é cumprida: +1 Diplomacia inimiga.</div>`;
  else if (pv.kind === 'at') h = _T`<b>⚔ Ataque inimigo</b> (força = nº de inimigos na área; primeiro suas unidades, depois recursos do mapa):<ul>${pv.plan.map((x) => _T`<li class="${x.castle ? 'bad' : ''}">área ${x.a}: ${esc(x.txt)}</li>`).join('')}</ul><small class="muted">Ao aplicar, as unidades destruídas somem e os recursos destruídos ficam riscados.</small>`;
  else if (pv.kind === 'pat') h = _T`<b>🗡 Seu ataque</b> (cada unidade sua elimina 1 inimiga na mesma área):<ul>${pv.plan.map((x) => _T`<li>área ${x.a}: elimina ${x.kill.length}</li>`).join('')}</ul>${pv.cmd ? _T`<small class="muted">Custa 1 Comando.</small>` : _T`<small class="muted">Lembre de gastar 1 Comando (Atacar).</small>`}`;
  else if (pv.kind === 'skip') h = `<b>${esc(pv.txt)}</b>`;
  const okLabel = pv.kind === 'skip' ? _T`Continuar` : _T`Aplicar`;
  return _T`<div class="as-pv">${h}<div class="menu row"><button class="btn primary small" data-pvok>${okLabel}</button>${pv.run ? _T`<button class="btn small" data-pvman>Já fiz à mão</button>` : ''}<button class="btn small" data-pvno>Cancelar</button></div></div>`;
}
/* Destaque de áreas (camada desenhada a partir da grade). */
function areaHighlightUrl(sets) {
  const A = AREAS[S.scenId]; const g = areaGrid(); const cv = document.createElement('canvas'); cv.width = A.gw; cv.height = A.gh;
  const ctx = cv.getContext('2d'); const img = ctx.createImageData(A.gw, A.gh);
  const col = {}; for (const [areas, rgba] of sets) for (const a of areas) col[a] = rgba;
  for (let i = 0; i < g.length; i++) { const c = col[g[i]]; if (c) { img.data.set(c, i * 4); } }
  ctx.putImageData(img, 0, 0); return cv.toDataURL();
}
function areaHighlightHtml() {
  if (!hasAreas()) return '';
  const sets = [];
  if (deadAreas().length) sets.push([deadAreas(), [25, 30, 40, 150]]);
  const pv = ui.mapPv;
  if (ui.dragFrom) { const nb = ui.dragStuck ? [] : areaGraph('pu')[ui.dragFrom].filter((b) => !isBlocked(b)); sets.push([nb, [60, 200, 90, 70]], [[ui.dragFrom], [60, 200, 90, 35]]); }
  if (pv && pv.kind === 'add') sets.push([pv.plan.cands, [230, 50, 60, 55]], [pv.plan.areas, [230, 30, 40, 150]]);
  if (pv && pv.moves) sets.push([[...new Set(pv.moves.map((m) => m.to))], [230, 50, 60, 70]]);
  if (pv && pv.kind === 'at') sets.push([pv.plan.map((p) => p.a), [230, 50, 60, 80]]);
  if (pv && pv.kind === 'pat') sets.push([pv.plan.map((p) => p.a), [60, 200, 90, 80]]);
  if (!sets.length) return '';
  const arrows = pv && pv.moves && pv.moves.length ? `<svg class="mvarrows" viewBox="0 0 100 100" preserveAspectRatio="none">${pv.moves.map((mv) => { const A = AREAS[S.scenId]; const [u1, v1] = cardToMap(S.marks.scen[mv.i].x, S.marks.scen[mv.i].y); const [u2, v2] = A.c[mv.to - 1]; return `<line x1="${u1 * 100}" y1="${v1 * 100}" x2="${u2 * 100}" y2="${v2 * 100}"/>`; }).join('')}</svg>` : '';
  const ids = !pv || pv.kind === 'skip' ? [] : pv.kind === 'add' ? pv.plan.cands : pv.kind === 'move' ? [...new Set(pv.moves.flatMap((m) => [m.from, m.to]))] : pv.plan.map((p) => p.a);
  const plus = pv && pv.kind === 'add' ? pv.plan.areas.map((a, k) => { const [u, v] = slotPos(a, (marksByArea('pu')[a] || []).length + (marksByArea('eu')[a] || []).length + pv.plan.areas.slice(0, k).filter((x) => x === a).length); return `<div class="ghost" style="left:${u * 100}%;top:${v * 100}%">${markSvg('eu')}</div>`; }).join('') : '';
  const nums = ids.map((a) => { const [u, v] = AREAS[S.scenId].c[a - 1]; return `<span class="anum" style="left:${u * 100}%;top:${v * 100}%">${a}</span>`; }).join('');
  return `<img class="ahl" src="${areaHighlightUrl(sets)}" alt="">${arrows}${plus}${nums}`;
}

/* =================== Recompensas de mapa (remover inimiga, colocar sua, mover) =================== */
/* Chamar DENTRO de um commit: registra o que o jogador ganhou para fazer no mapa. */
function grantMap(kind, n = 1) {
  if (kind === 'kill') S.kill = (S.kill || 0) + n;
  else if (kind === 'add') S.place = (S.place || 0) + n;
  else S.mapTask = kind; // 'moveOwn' | 'moveEn'
}
/* Chamar DEPOIS do commit: leva o jogador ao mapa com a instrução certa. */
function mapRewardPrompt(why) {
  if (!hasAreas()) return;
  if ((S.kill || 0) > 0 && !S.marks.scen.some((m) => m.t === 'eu')) {
    commit(() => { S.kill = 0; }, _T`Remoção de inimiga sem efeito: não há unidades inimigas no mapa`);
    toast(_T`${why ? why + ' ' : ''}Não há unidades inimigas no mapa para remover.`); return;
  }
  if (!(S.kill > 0) && !(S.place > 0) && !S.mapTask) return;
  const sm = typeof sideMapOn === 'function' && sideMapOn();
  if (!sm) { ui.tab = 'scen'; ui.scenView = 'map'; }
  if (S.place > 0 && !(S.kill > 0)) ui.mapTool = 'pu';
  render();
  if (!sm) setTimeout(() => { const e = $('#scen-map .as-wrap'); if (e) e.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 60);
  toast(`${why ? why + ' ' : ''}${S.kill > 0 ? _T`Toque na unidade inimiga que quer remover.` : S.place > 0 ? _T`Toque numa área com + verde para colocar sua unidade.` : _T`Faça o movimento no mapa.`}`);
}
function mapTaskHtml() {
  const out = [];
  if (S.kill > 0) out.push(_T`<div class="as-pv task"><b>🗡 Remova ${S.kill} unidade${S.kill > 1 ? 's' : ''} inimiga${S.kill > 1 ? 's' : ''}</b> à sua escolha: toque nela no mapa (as inimigas estão piscando).<div class="menu row"><button class="btn small" data-tskip="kill">Não remover</button></div></div>`);
  if (S.place > 0) out.push(_T`<div class="as-pv task"><b>📍 Coloque ${S.place} unidade${S.place > 1 ? 's' : ''} sua${S.place > 1 ? 's' : ''}</b>: toque numa área ${PLACE_ANY.includes(S.scenId) ? _T`permitida` : _T`com + verde (piscando)`}.</div>`);
  if (S.mapTask) out.push(_T`<div class="as-pv task"><b>${S.mapTask === 'moveOwn' ? _T`↔ Mova suas unidades até 1 área cada` : _T`↔ Mova cada unidade inimiga 1 área`}</b>: arraste as peças no mapa (sem gastar Comando).<div class="menu row"><button class="btn small primary" data-tskip="task">Concluído</button></div></div>`);
  return out.join('');
}
function bindMapTask(root) {
  $$('[data-tskip]', root).forEach((b) => (b.onclick = () => {
    const k = b.dataset.tskip;
    commit(() => { if (k === 'kill') S.kill = 0; else S.mapTask = null; }, k === 'kill' ? _T`Recompensa de remover inimiga não usada` : _T`Movimento concluído`);
  }));
}
